import django

django.setup()
from users.models import CustomUser
from lists.models import Wishlist

user = CustomUser.objects.all().first()
h = user.wishlists.create(name="hannukah")
c = user.wishlists.create(name="christmas")

h.items.create(title="socks")
c.items.create(title="bike")
