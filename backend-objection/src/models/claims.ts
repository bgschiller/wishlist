import { Model } from '../db';

export class Claim extends Model {
  static tableName = 'claim';

  id: number;
  wishlist_item_id: number;
  claimer_id: number;
  created_at: Date;
  revoked_at: Date | null;

  static get relationMappings() {
    const { WishlistItem } = require('./wishlist_item');
    const { User } = require('./users');
    return {
      wishlist_item: {
        relation: Model.BelongsToOneRelation,
        modelClass: WishlistItem,
        join: {
          from: 'claim.wishlist_item_id',
          to: 'wishlist_item.id',
        },
      },
      claimer: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'claim.claimer_id',
          to: 'user.id',
        },
      },
    };
  }
}
