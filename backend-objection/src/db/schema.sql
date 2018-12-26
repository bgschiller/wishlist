create table user (
    id serial primary key,
    email varchar(200) not null unique,
    pw_hash varchar(200)
);

create table wishlist (
    id serial primary key,
    owner_id integer references users not null,
    name varchar(100),
    created_at timestamp default current_timestamp
);
-- wishlists will be visible via a signed url (so they can't be enumerated)
-- in the future, we may add a nonce to each wishlist so the URLs are revokable.

create table wishlist_item (
    id serial primary key,
    wishlist_id integer references wishlist not null,
    title varchar(100) not null,
    image_url varchar(120),
    description text
);
-- images will be uploaded to S3, and only the URL stored here.

create table claim (
    id serial primary key,
    wishlist_item_id integer references wishlist_item not null,
    claimer_id integer references users not null,
    created_at timestamp default current_timestamp,
    revoked_at timestamp,
);

create table subscription (
    id serial primary key,
    wishlist_id integer references wishlist not null,
    subscriber_id integer references users not null
);