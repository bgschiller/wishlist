import { paramsSync, verifyKdf, kdf } from 'scrypt';
import { Model } from '../../db';

export class User extends Model {
  static get tableName() {
    return 'user';
  }

  id: number;
  email: string;
  pw_hash: string;

  static get relationMappings() {
    const { Wishlist } = require('./wishlists');
    const { Subscription } = require('./subscriptions');
    return {
      wishlists: {
        relation: Model.HasManyRelation,
        modelClass: Wishlist,
        join: {
          from: 'user.id',
          to: 'wishlist.owner_id',
        },
      },
      subscribed_lists: {
        relation: Model.ManyToManyRelation,
        modelClass: Wishlist,
        join: {
          from: 'user.id',
          through: {
            modelClass: Subscription,
            from: 'subscription.subscriber_id',
            to: 'subscription.wishlist_id',
          },
          to: 'wishlist.id',
        },
      },
    };
  }
}

const scriptParams = paramsSync(0.1);

export async function verifyUser(
  email: string,
  password: string,
): Promise<User | 'user_not_found' | 'incorrect_password'> {
  const user = await User.query().findOne({ email });
  if (!user) return 'user_not_found';
  const isCorrect = await verifyKdf(Buffer.from(user.pw_hash), password);
  if (!isCorrect) return 'incorrect_password';
  return user;
}

export async function hashPassword(password: string): Promise<Buffer> {
  return kdf(password, scriptParams);
}
