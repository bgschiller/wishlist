import { Model } from '../../db';

export enum EmailType {
  new_item_on_subscribed_list = 'new_item_on_subscribed_list',
}

export class Email extends Model {
  static tableName = 'email';

  id: number;
  recipient_id: number;
  email_type: EmailType;
  item_id: number;
  created_at: Date | null;
  sent_at: Date | null;
  failed_at: Date | null;
  claimed_at: Date | null;

  static get relationMappings() {
    const { WishlistItem } = require('./wishlists');
    const { User } = require('./users');

    return {
      item: {
        relation: Model.BelongsToOneRelation,
        modelClass: WishlistItem,
        join: {
          from: 'email.item_id',
          to: 'wishlist_item.id',
        },
      },
      recipient: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'email.recipient_id',
          to: 'user.id',
        },
      },
    };
  }
}
