const { authenticate } = require('@feathersjs/authentication').hooks;

const mustBeOwner = require('../../hooks/must-be-owner');
const mustOwnWishlist = mustBeOwner({ modelProp: 'owner_id' });
module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [],
    update: [mustOwnWishlist],
    patch: [mustOwnWishlist],
    remove: [mustOwnWishlist]
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
