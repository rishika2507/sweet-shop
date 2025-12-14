from rest_framework import generics, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Sweet
from .permissions import IsAdmin
from .serializers import (
    RegisterSerializer,
    SweetSerializer,
)


# ---------- AUTH ----------

class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]


# ---------- SWEETS CRUD ----------

class SweetViewSet(viewsets.ModelViewSet):
    queryset = Sweet.objects.all()
    serializer_class = SweetSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    @action(detail=False, methods=["get"], url_path="search")
    def search(self, request):
        name = request.query_params.get("name")
        category = request.query_params.get("category")
        min_price = request.query_params.get("minPrice")
        max_price = request.query_params.get("maxPrice")

        qs = self.queryset

        if name:
            qs = qs.filter(name__icontains=name)
        if category:
            qs = qs.filter(category__icontains=category)
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


# ---------- INVENTORY ACTIONS ----------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def purchase_sweet(request, pk):
    try:
        sweet = Sweet.objects.get(pk=pk)
    except Sweet.DoesNotExist:
        return Response({"detail": "Sweet not found"}, status=status.HTTP_404_NOT_FOUND)

    qty = request.data.get("quantity", 1)
    try:
        qty = int(qty)
    except ValueError:
        return Response({"detail": "Quantity must be integer"}, status=status.HTTP_400_BAD_REQUEST)

    if qty <= 0:
        return Response({"detail": "Quantity must be positive"}, status=status.HTTP_400_BAD_REQUEST)

    if sweet.quantity_in_stock < qty:
        return Response({"detail": "Not enough stock"}, status=status.HTTP_400_BAD_REQUEST)

    sweet.quantity_in_stock -= qty
    sweet.save()
    return Response(SweetSerializer(sweet).data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
def restock_sweet(request, pk):
    try:
        sweet = Sweet.objects.get(pk=pk)
    except Sweet.DoesNotExist:
        return Response({"detail": "Sweet not found"}, status=status.HTTP_404_NOT_FOUND)

    qty = request.data.get("quantity", 1)
    try:
        qty = int(qty)
    except ValueError:
        return Response({"detail": "Quantity must be integer"}, status=status.HTTP_400_BAD_REQUEST)

    if qty <= 0:
        return Response({"detail": "Quantity must be positive"}, status=status.HTTP_400_BAD_REQUEST)

    sweet.quantity_in_stock += qty
    sweet.save()
    return Response(SweetSerializer(sweet).data, status=status.HTTP_200_OK)
