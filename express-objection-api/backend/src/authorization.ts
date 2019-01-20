import { compose } from 'compose-middleware';
import { ReallyDangerous } from 'reallydangerous';
import { Wishlist } from './models/wishlists';
import { Request, Response } from 'express';

export function requiresLogin(req, res, next) {
  if (!req.session || !req.session.user_id) {
    res.status(401).json({
      result: 'error',
      message: 'You must be logged in to access this route',
    });
    return;
  }
  next();
}

export const mustOwnWishlist = compose(
  requiresLogin,
  async (req, res, next) => {
    const { wishlistId } = req.params;
    const { userId } = req.session;
    const wishlist = await Wishlist.query().findOne({
      id: wishlistId,
      owner_id: userId,
    });
    if (!wishlist) {
      res.status(404).json({
        result: 'error',
        message: 'the requested wishlist was not found',
      });
      return;
    }
    req.wishlist = wishlist;
    next();
  },
);

export const paramSigner = new ReallyDangerous(process.env.PARAM_KEY);
export function unhideParams(
  ...paramNames_: Array<string>
): (req: Request, res: Response, next: Function) => void;
export function unhideParams(req: Request, res: Response, next: Function): void;
export function unhideParams(...args: Array<any>) {
  if (args[0] && args[0] instanceof Request) {
    _unhideParams(Object.keys(args[0].params), args[0], args[1], args[2]);
  }
  return (req, res, next) => _unhideParams(args, req, res, next);
}

function _unhideParams(
  paramNames: Array<string>,
  req: Request,
  res: Response,
  next: Function,
) {
  try {
    paramNames.forEach(p => {
      req.params[p] = paramSigner.unsign(req.params[p]);
    });
  } catch (err) {
    res.status(404).json({
      result: 'error',
      message: 'the requested resource was not found',
    });
  }
  next();
}
