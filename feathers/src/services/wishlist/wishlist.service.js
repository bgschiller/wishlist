// Initializes the `wishlist` service on path `/wishlist`
const createService = require('feathers-knex');
const createModel = require('../../models/wishlist.model');
const hooks = require('./wishlist.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'wishlist',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/wishlist', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('wishlist');

  service.hooks(hooks);
};
  