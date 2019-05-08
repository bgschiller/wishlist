const { disallow } = require('feathers-hooks-common');
const { authenticate } = require('@feathersjs/authentication').hooks;

const subscribeOnlySelf = require('../../hooks/subscribe-only-self');

const mustBeOwner = require('../../hooks/must-be-owner');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [disallow()],
    get: [disallow()],
    create: [subscribeOnlySelf()],
    update: [disallow()],
    patch: [disallow()],
    remove: [mustBeOwner({
      modelProp: 'subscriber_id'
    })]
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
