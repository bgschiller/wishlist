import express from 'express';
import cookieSession from 'cookie-session';
import bodyParser, { json } from 'body-parser';
import { verifyUser } from './models/users';
import { requiresLogin, unhideParams, mustOwnWishlist } from './authorization';
import { Wishlist } from './models/wishlists';

const app = express();
app.use(
  cookieSession({
    name: 'session',
    keys: [process.env.SECRET_KEY],
  }),
);

/*

POST /login
 - set the user id in the session
POST /logout
 - clear the session

 */

app.post('/login', bodyParser.json(), async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'must provide email and password' });
  }
  const result = await verifyUser(email, password);
  if (result === 'user_not_found') {
    res
      .status(401)
      .json({ result, message: 'user could not be found with that email' });
    return;
  }
  if (result === 'incorrect_password') {
    res
      .status(401)
      .json({ result, message: 'incorrect password for that email' });
    return;
  }
  req.session.userId = result.id;
  res.status(200).json({ result: 'ok', message: 'logged in' });
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.status(200).json({ result: 'ok' });
});

/*
POST /wishlists
 - create a new wishlsit
GET /wishlists/<wishlist_id>
 - fetch a wishlist, including all items
PATCH /wishlists/<wishlist_id>
 - update an attribute of a wishlist (eg, name)
*/

app.post('/wishlists', bodyParser.json(), requiresLogin, async (req, res) => {
  const { name } = req.body;
  const wishlist = await Wishlist.query()
    .insert({
      name,
      owner_id: req.session.userId,
    })
    .returning('*');
  res.json(wishlist);
});

// URLs like "/wishlists/1" are vulnerable to enumeration attacks. We want
// wishlists to only be visible to people with whom they are shared.
// 'unhideParams' does this job for us.
app.get('/wishlists/:wishlistId', unhideParams, async (req, res) => {
  const { wishlistId } = req.params;
  const wishlist = await Wishlist.query()
    .eager('items.claim')
    .findOne({ id: wishlistId });
  res.json(wishlist);
});

app.patch(
  '/wishlists/:wishlistId',
  bodyParser.json(),
  unhideParams,
  mustOwnWishlist,
  async (req, res) => {
    const { wishlistId } = req.params;
    const { name } = req.body;
    const wishlist = await Wishlist.query()
      .patch({ name })
      .where({ id: wishlistId })
      .returning('*')
      .first();
    res.json(wishlist);
  },
);

/*
POST /subscriptions/<wishlist_id>
 - subscribe to a new list
DELETE /subscriptions/<wishlist_id>
 - unsubscribe from a wishlist

POST /wishlists/<wishlist_id>/items
 - add an item to a wishlist that you own
 - queue an email to subscribers
DELETE /wishlists/<wishlist_id>/items/<item_id>
 - remove an item from a wishlist that you own
PATCH /wishlists/<wishlist_id>/items/<item_id>
 - update details on an item on a wishlist that you own
 - eg, image_url, description, etc.
POST /wishlists/<wishlist_id>/items/<item_id>/claim
 - claim a wishlist item (commit to purchase it)
 - queue an email to the owner
DELETE /wishlists/<wishlist_id>/items/<item_id>/claim
 - revoke a claim to a wishlist item
 - emails the claimer immediately, unless the claimer is the deleter
*/
