const users = require('./users/users.service.js');
const wishlist = require('./wishlist/wishlist.service.js');
const wishlistItem = require('./wishlist_item/wishlist_item.service.js');
const subscription = require('./subscription/subscription.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(wishlist);
  app.configure(wishlistItem);
  app.configure(subscription);
};
