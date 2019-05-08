const app = require('../../src/app');

describe('\'wishlist\' service', () => {
  it('registered the service', () => {
    const service = app.service('wishlist');
    expect(service).toBeTruthy();
  });
});
