export async function seed(knex) {
  // Deletes ALL existing entries
  return knex('user')
    .insert([
      { id: 1, email: 'test@test.com', pw_hash: await hashPassword('test') },
      {
        id: 2,
        email: 'friend@test.com',
        pw_hash: await hashPassword('friend'),
      },
    ])
    .then(function() {
      // Inserts seed entries
      return knex('wishlist').insert([
        { id: 1, owner_id: 1, name: 'Baby items' },
      ]);
    })
    .then(function() {
      return knex('wishlist_item').insert([
        { wishlist_id: 1, title: 'NoseFrida SnotSucker' },
        { wishlist_id: 1, title: 'Sleepsack' },
      ]);
    })
    .then(function() {
      return knex('subscription').insert([
        { wishlist_id: 1, subscriber_id: 2 },
      ]);
    });
}
