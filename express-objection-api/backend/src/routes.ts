import express from 'express';
import cookieSession from 'cookie-session';
import bodyParser, { json } from 'body-parser';
import { verifyUser } from './models/users';
import {
  requiresLogin,
  unhideParams,
  mustOwnWishlist,
  paramSigner,
} from './authorization';
import { Wishlist } from './models/wishlists';
import { Subscription } from './models/subscription';
import { WishlistItem } from './models/wishlist_item';
import { Email, EmailType } from './models/email';
import { transaction } from 'objection';
import { Claim } from './models/claims';

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

app.post('/api/login', bodyParser.json(), async (req, res) => {
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

app.post('/api/logout', (req, res) => {
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

app.post(
  '/api/wishlists',
  bodyParser.json(),
  requiresLogin,
  async (req, res) => {
    const { name } = req.body;
    const wishlist = await Wishlist.query()
      .insert({
        name,
        owner_id: req.session.userId,
      })
      .returning('*');
    res.json(wishlist);
  },
);

app.get('/api/wishlists/:wishlistId', async (req, res) => {
  let { wishlistId } = req.params;
  const { userId } = req.session;
  let mustOwn = false;
  try {
    wishlistId = paramSigner.unsign(wishlistId);
  } catch {
    // if not possible to unsign, probably it was never signed.
    // URLs like "/wishlists/1" are vulnerable to enumeration attacks. We want
    // wishlists to only be visible to people with whom they are shared.
    // however, the owner should be able to access from the regular url
    mustOwn = true;
  }
  const wishlist = await Wishlist.query()
    .eager('items.claim')
    .findOne({ id: wishlistId });
  if (mustOwn && userId !== wishlist.owner_id) {
    res.status(404).json({ status: 'error', message: 'not found' });
    return;
  }
  res.json(wishlist);
});

app.patch(
  '/api/wishlists/:wishlistId',
  bodyParser.json(),
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
 */
app.post(
  '/api/subscriptions/:wishlistId',
  unhideParams,
  requiresLogin,
  async (req, res) => {
    const { wishlistId } = req.params;
    const subscription = {
      wishlist_id: wishlistId,
      subscriber_id: req.session.userId,
    };
    await Subscription.query().insert(subscription);
    res.json(subscription);
  },
);

app.delete(
  '/api/subscriptions/:wishlistId',
  unhideParams,
  requiresLogin,
  async (req, res) => {
    const { wishlistId } = req.params;
    const { userId } = req.session;
    await Subscription.query()
      .delete()
      .where({
        wishlist_id: wishlistId,
        user_id: userId,
      });
    res.json({ status: 'ok' });
  },
);

/*POST /wishlists/<wishlist_id>/items
 - add an item to a wishlist that you own
 - queue an email to subscribers
DELETE /wishlists/<wishlist_id>/items/<item_id>
 - remove an item from a wishlist that you own
PATCH /wishlists/<wishlist_id>/items/<item_id>
 - update details on an item on a wishlist that you own
 - eg, image_url, description, etc.
 */
app.post(
  '/api/wishlists/:wishlistId/items',
  bodyParser.json(),
  mustOwnWishlist,
  async (req, res) => {
    const { wishlistId } = req.params;
    const { title, image_url, description } = req.body;
    if (!title) {
      res.status(400).json({
        status: 'error',
        message: 'title cannot be blank',
      });
    }

    const item = await WishlistItem.query()
      .insert({
        wishlist_id: wishlistId,
        title,
        image_url,
        description,
      })
      .returning('*');

    // prepare emails for all subscribers
    await Email.knexQuery().insert(function() {
      this.from('subscription')
        .where('wishlist_id', wishlistId)
        .select(
          'user_id as recipient_id',
          this.raw('? as ??', [
            EmailType.new_item_on_subscribed_list,
            'email_type',
          ]),
          this.raw('? as ??', [item.id, 'item_id']),
        );
    });

    res.json(item);
  },
);

app.patch(
  '/api/wishlists/:wishlistId/items/:itemId',
  bodyParser.json(),
  mustOwnWishlist,
  async (req, res) => {
    const { wishlistId, itemId } = req.params;
    const { title, image_url, description } = req.body;
    const updates: Partial<WishlistItem> = {};
    if (title) updates.title = title;
    if (image_url) updates.image_url = image_url;
    if (description) updates.description = description;
    if (!title && !image_url && !description) {
      res.status(400).json({
        status: 'error',
        message:
          'expected update to contain one of title, image_url, description',
      });
      return;
    }
    const item = await WishlistItem.query()
      .update(updates)
      .where({ wishlist_id: wishlistId, id: itemId })
      .returning('*');
    res.json(item);
  },
);

app.delete(
  '/api/wishlists/:wishlistId/items/:itemId',
  mustOwnWishlist,
  async (req, res) => {
    const { wishlistId, itemId } = req.params;
    const numRows = await WishlistItem.query()
      .delete()
      .where({
        wishlist_id: wishlistId,
        id: itemId,
      });
    if (numRows > 0) res.json({ status: 'ok' });
    else res.status(404).json({ status: 'error', message: 'record not found' });
  },
);

/*
POST /wishlists/<wishlist_id>/items/<item_id>/claim
 - claim a wishlist item (commit to purchase it)
 - queue an email to the owner
DELETE /wishlists/<wishlist_id>/items/<item_id>/claim
 - revoke a claim to a wishlist item
 - emails the claimer immediately, unless the claimer is the deleter
*/
app.post(
  '/api/wishlists/:wishlistId/items/:itemId/claim',
  unhideParams('wishlistId'),
  requiresLogin,
  async (req, res) => {
    const { wishlistId, itemId } = req.params;
    const { userId } = req.session;
    const maybe_claim = await transaction(
      WishlistItem.knex(),
      async (trx): Promise<Claim | 'a_claim_exists'> => {
        const existingClaims = await Claim.query(trx).where({
          wishlist_item_id: itemId,
          revoked_at: null,
        });
        if (existingClaims.length > 0) {
          return 'a_claim_exists';
        }
        const claim = await Claim.query(trx)
          .insert({
            wishlist_item_id: itemId,
            claimer_id: userId,
          })
          .returning('*');
        return claim;
      },
    );

    const wishlist = await Wishlist.query().findById(wishlistId);

    await Email.query().insert({
      recipient_id: wishlist.owner_id,
      email_type: EmailType.item_claimed_on_owned_list,
      item_id: itemId,
    });
    if (maybe_claim === 'a_claim_exists') {
      res.status(400).json({
        status: 'error',
        message: 'That item has already been claimed',
      });
    } else {
      res.json(maybe_claim);
    }
  },
);

app.delete(
  '/api/wishlists/:wishlistId/items/:itemId/claim',
  requiresLogin,
  async (req, res) => {
    let { wishlistId, itemId } = req.params;
    const { userId } = req.session;
    let mustOwn = false;
    try {
      wishlistId = paramSigner.unsign(wishlistId);
    } catch {
      // if not possible to unsign, probably it was never signed.
      // URLs like "/wishlists/1" are vulnerable to enumeration attacks. We want
      // wishlists to only be visible to people with whom they are shared.
      // however, the owner should be able to access from the regular url
      mustOwn = true;
    }
    const wishlist = await Wishlist.query().findById(wishlistId);
    if (!wishlist || (mustOwn && wishlist.owner_id !== userId)) {
      res.status(404).json({
        status: 'error',
        message: 'Wishlist could not be found',
      });
    }
    const isOwner = wishlist.owner_id === userId;
    const searchConditions: Partial<Claim> = isOwner
      ? { wishlist_item_id: itemId, revoked_at: null }
      : { wishlist_item_id: itemId, revoked_at: null, claimer_id: userId };
    const claim = await Claim.query()
      .update({
        revoked_at: Claim.knex().fn.now(),
      })
      .where(searchConditions)
      .returning('*')
      .first();

    if (isOwner) {
      await Email.query().insert({
        item_id: itemId,
        email_type: EmailType.item_revoked_that_you_claimed,
        recipient_id: claim.claimer_id,
      });
    } else {
      await Email.query().insert({
        item_id: itemId,
        email_type: EmailType.item_revoked_on_owned_list,
        recipient_id: wishlist.owner_id,
      });
    }

    res.json(claim);
  },
);
