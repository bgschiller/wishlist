const app = require('../../src/app');

describe('\'wishlist_item\' service', () => {
  it('registered the service', () => {
    const service = app.service('wishlist-item');
    expect(service).toBeTruthy();
  });
});
