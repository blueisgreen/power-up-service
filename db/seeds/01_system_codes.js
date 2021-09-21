exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('system_codes')
    .del()
    .then(function () {
      // Inserts seed entries
      return knex('system_codes').insert([
        { public_id: 'role', display_name: 'Role' },
        { public_id: 'accountStatus', display_name: 'Account Status' },
        { public_id: 'socialPlatform', display_name: 'Social Platform' },
      ])
    })
}
