from django.forms import ModelForm
from .models import Wishlist, WishlistItem


class CreateWishlistForm(ModelForm):
    class Meta:
        model = Wishlist
        fields = ["name"]


class CreateWishlistItemForm(ModelForm):
    class Meta:
        model = WishlistItem
        fields = ["title", "description"]

