const { authenticate } = require('@feathersjs/authentication').hooks;

const mustBeOwner = require('../../hooks/must-be-owner');

async function getWishlistIdFromItemId(ctx) {
  const item = await ctx.service.find(ctx.id);
  return item.wishlist_id;
}

const mustOwnWishlistItem = mustBeOwner({
  getModelId: getWishlistIdFromItemId,
  modelProp: 'owner_id',
});

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [mustBeOwner({
        getModelId: ctx => ctx.data.wishlist_id,
        modelProp: 'owner_id',
    })],
    update: [mustOwnWishlistItem],
    patch: [mustOwnWishlistItem],
    remove: [mustOwnWishlistItem]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
