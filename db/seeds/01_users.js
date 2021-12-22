exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('users')
    .del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        { alias: 'Zanzibar', email: 'zanzibar@happyspiritgames.com' },
        { alias: 'Customer Support', email: 'support@happyspiritgames.com' },
        { alias: 'BubbaGump', email: 'dave@happyspiritgames.com' },
      ])
    })
}
