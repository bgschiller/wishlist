from django.urls import path
from .views import (
    WishlistDetail,
    WishlistCreate,
    WishlistDelete,
    WishlistIndex,
    WishlistItemCreate,
    WishlistItemDelete,
    WishlistItemUpdate,
)

urlpatterns = [
    path("", WishlistIndex.as_view(), name="my-wishlists"),
    path("add/", WishlistCreate.as_view(), name="wishlist-create"),
    path("<int:wishlist_id>/", WishlistDetail.as_view(), name="wishlist-detail"),
    path("<int:wishlist_id>/delete/", WishlistDelete.as_view(), name="wishlist-delete"),
    path(
        "<int:wishlist_id>/items/add/",
        WishlistItemCreate.as_view(),
        name="wishlist-item-create",
    ),
    path(
        "<int:wishlist_id>/items/<int:item_id>/",
        WishlistItemUpdate.as_view(),
        name="wishlist-item-update",
    ),
    path(
        "<int:wishlist_id>/items/<int:item_id>/delete/",
        WishlistItemDelete.as_view(),
        name="wishlist-item-delete",
    ),
]
