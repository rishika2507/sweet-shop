import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from api.models import Sweet

User = get_user_model()


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        username="adminuser",
        email="admin@example.com",
        password="StrongPass123!",
        role="admin",
        is_staff=True,
        is_superuser=True,
    )


@pytest.fixture
def normal_user(db):
    return User.objects.create_user(
        username="normaluser",
        email="normal@example.com",
        password="StrongPass123!",
        role="user",
    )


@pytest.fixture
def admin_client(admin_user):
    client = APIClient()
    login_url = reverse("token_obtain_pair")
    resp = client.post(
        login_url,
        {"username": "adminuser", "password": "StrongPass123!"},
        format="json",
    )
    token = resp.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


@pytest.fixture
def user_client(normal_user):
    client = APIClient()
    login_url = reverse("token_obtain_pair")
    resp = client.post(
        login_url,
        {"username": "normaluser", "password": "StrongPass123!"},
        format="json",
    )
    token = resp.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


@pytest.fixture
def sweet(db):
    return Sweet.objects.create(
        name="Test Sweet",
        category="Test Category",
        price="10.00",
        quantity_in_stock=5,
    )


@pytest.mark.django_db
def test_admin_can_create_sweet(admin_client):
    url = reverse("sweet-list")
    data = {
        "name": "Another Sweet",
        "category": "New Category",
        "price": "20.00",
        "quantity_in_stock": 10,
    }
    response = admin_client.post(url, data, format="json")

    assert response.status_code == 201
    assert Sweet.objects.filter(name="Another Sweet").exists()


@pytest.mark.django_db
def test_user_can_purchase_sweet(user_client, sweet):
    url = reverse("purchase_sweet", kwargs={"pk": sweet.id})
    response = user_client.post(url, {"quantity": 2}, format="json")

    sweet.refresh_from_db()
    assert response.status_code == 200
    assert sweet.quantity_in_stock == 3  # 5 - 2


@pytest.mark.django_db
def test_purchase_more_than_stock_fails(user_client, sweet):
    url = reverse("purchase_sweet", kwargs={"pk": sweet.id})
    response = user_client.post(url, {"quantity": 10}, format="json")

    sweet.refresh_from_db()
    assert response.status_code == 400
    assert sweet.quantity_in_stock == 5  # unchanged


@pytest.mark.django_db
def test_admin_can_restock_sweet(admin_client, sweet):
    url = reverse("restock_sweet", kwargs={"pk": sweet.id})
    response = admin_client.post(url, {"quantity": 5}, format="json")

    sweet.refresh_from_db()
    assert response.status_code == 200
    assert sweet.quantity_in_stock == 10  # 5 + 5


@pytest.mark.django_db
def test_normal_user_cannot_restock(user_client, sweet):
    url = reverse("restock_sweet", kwargs={"pk": sweet.id})
    response = user_client.post(url, {"quantity": 5}, format="json")

    sweet.refresh_from_db()
    assert response.status_code == 403  # forbidden by IsAdmin
    assert sweet.quantity_in_stock == 5  # unchanged
