from django.db import models
from django.conf import settings
from django.urls import reverse

# Create your models here.
class Wishlist(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=False,
        on_delete=models.CASCADE,
        related_name="wishlists",
    )
    name = models.CharField(max_length=100, null=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def get_absolute_url(self):
        return reverse("wishlist-detail", kwargs={"wishlist_id": self.pk})


class WishlistItem(models.Model):
    wishlist = models.ForeignKey(
        Wishlist, on_delete=models.CASCADE, related_name="items"
    )
    title = models.CharField(max_length=100, null=False)
    description = models.TextField(null=False, default="")

    def get_absolute_url(self):
        return reverse(
            "wishlist-item-update",
            kwargs={"wishlist_id": self.wishlist_id, "item_id": self.pk},
        )
