import { Model } from '../db';

export class Wishlist extends Model {
  static tableName = 'wishlist';

  id: number;
  owner_id: number;
  name: string | null;
  created_at: Date;

  static get relationMappings() {
    const { User } = require('./users');
    const { Subscription } = require('./Subscription');
    const { WishlistItem } = require('./wishlist_items');

    return {
      owner: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'wishlist.owner_id',
          to: 'user.id',
        },
      },
      items: {
        relation: Model.HasManyRelation,
        modelClass: WishlistItem,
        join: {
          from: 'wishlist.id',
          to: 'wishlist_item.wishlist_id',
        },
      },
      subscriptions: {
        relation: Model.HasManyRelation,
        modelClass: Subscription,
        join: {
          from: 'wishlist.id',
          to: 'subscription.wishlist_id',
        },
      },
      subscribers: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'wishlist.id',
          through: {
            modelClass: Subscription,
            from: 'subscription.wishlist_id',
            to: 'subscription.subscriber_id',
          },
          to: 'user.id',
        },
      },
    };
  }
}
