from django.views.generic import (
    ListView,
    DetailView,
    CreateView,
    DeleteView,
    UpdateView,
)
from django.urls import reverse_lazy, reverse
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from .models import Wishlist, WishlistItem
from .forms import CreateWishlistForm, CreateWishlistItemForm


class UserOwnsWishlistMixin(UserPassesTestMixin):
    def test_func(self):
        wishlist_id = self.kwargs["wishlist_id"]
        return Wishlist.objects.filter(
            owner_id=self.request.user.id, id=wishlist_id
        ).exists()


class WishlistIndex(ListView, LoginRequiredMixin):
    model = Wishlist
    context_object_name = "wishlists"
    template_name = "lists/wishlist_index.html"

    def get_queryset(self):
        return super().get_queryset().filter(owner=self.request.user)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["create_form"] = CreateWishlistForm()
        context["create_url"] = reverse("wishlist-create")
        return context


# Create your views here.
class WishlistDetail(DetailView):
    model = Wishlist
    context_object_name = "wishlist"
    template_name = "lists/wishlist_detail.html"
    pk_url_kwarg = "wishlist_id"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["create_form"] = CreateWishlistItemForm()
        context["create_url"] = reverse(
            "wishlist-item-create", kwargs={"wishlist_id": self.kwargs["wishlist_id"]}
        )
        return context


class WishlistCreate(CreateView, LoginRequiredMixin):
    model = Wishlist
    form_class = CreateWishlistForm

    def form_valid(self, form):
        form.instance.owner = self.request.user
        return super().form_valid(form)


class WishlistDelete(DeleteView, UserOwnsWishlistMixin):
    model = Wishlist
    success_url = reverse_lazy("my-wishlists")
    pk_url_kwarg = "wishlist_id"


class WishlistItemCreate(CreateView, UserOwnsWishlistMixin):
    model = WishlistItem
    form_class = CreateWishlistItemForm

    def form_valid(self, form):
        form.instance.wishlist_id = self.kwargs["wishlist_id"]
        return super().form_valid(form)


class WishlistItemUpdate(UpdateView):
    model = WishlistItem
    fields = ["title", "description"]
    template_name = "lists/wishlist_item_update.html"
    pk_url_kwarg = "item_id"


class WishlistItemDelete(DeleteView, UserOwnsWishlistMixin):
    model = Wishlist
    success_url = reverse_lazy("my-wishlists")
    pk_url_kwarg = "item_id"

    def get_success_url(self):
        return reverse(
            "wishlist-detail",
            kwargs={"wishlist_id": self.request.kwargs["wishlist_id"]},
        )

