// Initializes the `wishlist_item` service on path `/wishlist-item`
const createService = require('feathers-knex');
const createModel = require('../../models/wishlist_item.model');
const hooks = require('./wishlist_item.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'wishlist_item',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/wishlist-item', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('wishlist-item');

  service.hooks(hooks);
};
  