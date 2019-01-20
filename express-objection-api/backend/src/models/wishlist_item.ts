import { Model } from '../../db';

export class WishlistItem extends Model {
  static tableName = 'wishlist_item';

  id: number;
  wishlist_id: number;
  title: string;
  image_url: string | null;
  description: string;

  static get relationMappings() {
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
    };
  }
}
