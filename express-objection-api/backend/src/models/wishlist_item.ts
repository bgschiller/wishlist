import { Model } from '../db';

export class WishlistItem extends Model {
  static tableName = 'wishlist_item';

  id: number;
  wishlist_id: number;
  title: string;
  image_url: string | null;
  description: string;

  static get relationMappings() {
    const { Claim } = require('./claim');
    const { Wishlist } = require('./wishlist');
    const { User } = require('./users');

    return {
      wishlist: {
        relation: Model.BelongsToOneRelation,
        modelClass: Wishlist,
        join: {
          from: 'wishlist_item.wishlist_id',
          to: 'wishlist.id',
        },
      },
      claim: {
        relation: Model.HasOneRelation,
        modelClass: Claim,
        join: {
          from: 'wishlist_item.id',
          to: 'claim.wishlist_item_id',
        },
      },
      claimer: {
        relation: Model.HasOneThroughRelation,
        modelClass: User,
        join: {
          from: 'wishlist_item.id',
          through: {
            modelClass: Claim,
            from: 'claim.wishlist_item_id',
            to: 'claim.claimer_id',
          },
          to: 'user.id',
        },
      },
    };
  }
}
