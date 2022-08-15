const TABLE_NAME = 'system_codes'

exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex(TABLE_NAME)
    .where({ code: 'sandwiches' })
    .del()
    .then(function () {
      // Inserts seed entries
      return knex(TABLE_NAME)
        .insert(
          [{ code: 'sandwiches', display_name: 'Types of Sandwich' }],
          ['id']
        )
        .then((rows) => {
          const categoryId = rows[0].id
          return knex(TABLE_NAME).insert([
            {
              code: 'pbj',
              display_name: 'Peanut butter and jelly',
              parent_id: categoryId,
            },
            {
              code: 'blt',
              display_name: 'Bacon lettuce and tomato',
              parent_id: categoryId,
            },
            {
              code: 'tuna',
              display_name: 'Tuna salad',
              parent_id: categoryId,
            },
          ])
        })
    })
}
