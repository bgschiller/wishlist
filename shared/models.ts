export interface User {
  id: number;
  email: string;
}

export interface Wishlist {
  id: number;
  owner_id: number;
  name: string | null;
  created_at: Date;
}

export interface WishlistItem {
  id: number;
  wishlist_id: number;
  title: string;
  image_url: string | null;
  description: string;
}

export interface Claim {
  id: number;
  wishlist_item_id: number;
  claimer_id: number;
  created_at: Date;
  revoked_at: Date | null;
}

export interface Subscription {
  id: number;
  wishlist_id: number;
  subscriber_id: number;
}
