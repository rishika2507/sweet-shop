from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User, Sweet


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    # Show 'role' in the form
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Role", {"fields": ("role",)}),
    )
    list_display = ("username", "email", "role", "is_staff", "is_superuser")


@admin.register(Sweet)
class SweetAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "quantity_in_stock")
