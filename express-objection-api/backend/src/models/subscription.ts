import { Model } from '../../db';

export class Subscription extends Model {
  static tableName = 'subscription';

  id: number;
  wishlist_id: number;
  subscriber_id: number;

  static get relationMappings() {
    const { Wishlist } = require('./wishlists');
    const { User } = require('./users');
    return {
      wishlist: {
        relation: Model.HasOneRelation,
        modelClass: Wishlist,
        join: {
          from: 'subscription.wishlist_id',
          to: 'wishlist.id',
        },
      },
      subscriber: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: 'subscription.subscriber_id',
          to: 'user.id',
        },
      },
    };
  }
}
