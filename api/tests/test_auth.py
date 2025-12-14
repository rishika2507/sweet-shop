import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
def test_register_user():
    client = APIClient()
    url = reverse("register")  # name from api/urls.py
    data = {
        "username": "pytestuser",
        "email": "pytest@example.com",
        "password": "StrongPass123!",
        "role": "user",
    }
    response = client.post(url, data, format="json")

    assert response.status_code == 201
    assert User.objects.filter(username="pytestuser").exists()


@pytest.mark.django_db
def test_login_user():
    # Create a user in the test database
    User.objects.create_user(
        username="loginuser",
        email="login@example.com",
        password="StrongPass123!",
        role="user",
    )

    client = APIClient()
    url = reverse("token_obtain_pair")  # name from api/urls.py
    data = {
        "username": "loginuser",
        "password": "StrongPass123!",
    }
    response = client.post(url, data, format="json")

    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data
