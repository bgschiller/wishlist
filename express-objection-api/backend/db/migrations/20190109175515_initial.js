exports.up = function(knex, Promise) {
  return knex.schema.raw(`
create table "user" (
    id serial primary key,
    email varchar(200) not null unique,
    pw_hash varchar(200)
);

create table wishlist (
    id serial primary key,
    owner_id integer references "user" not null,
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

create table subscription (
    id serial primary key,
    wishlist_id integer references wishlist not null,
    subscriber_id integer references "user" not null
);

create type email_type as enum (
    'new_item_on_subscribed_list'
);

create table email (
    id serial primary key,
    recipient_id integer references "user" not null,
    email_type email_type not null,
    item_id integer references wishlist_item not null,
    created_at timestamp default current_timestamp,
    sent_at timestamp,
    failed_at timestamp,
    claimed_at timestamp
);
  `);
};

exports.down = function(knex, Promise) {};
