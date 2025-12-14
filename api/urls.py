from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    SweetViewSet,
    purchase_sweet,
    restock_sweet,
)

router = DefaultRouter()
router.register(r"sweets", SweetViewSet, basename="sweet")

urlpatterns = [
    path("auth/register", RegisterView.as_view(), name="register"),
    path("auth/login", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh", TokenRefreshView.as_view(), name="token_refresh"),
    path("", include(router.urls)),
    path("sweets/<int:pk>/purchase", purchase_sweet, name="purchase_sweet"),
    path("sweets/<int:pk>/restock", restock_sweet, name="restock_sweet"),
]
