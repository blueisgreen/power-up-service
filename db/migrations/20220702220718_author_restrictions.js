const AUTHORS = 'authors'
const SYSTEM_CODES = 'system_codes'
const USERS = 'users'

exports.up = function (knex) {
  return knex.schema
    .createTable(AUTHORS, function (table) {
      table.integer('user_id').references('id').inTable(USERS).unique()
      table.string('pen_name').notNullable()
      table.string('author_status')
      table.timestamps(true, true)
    })
    .then(() => {
      return knex(SYSTEM_CODES)
        .insert(
          [{ code: 'authorStatus', display_name: 'Author Status' }],
          ['id']
        )
        .then((rows) => {
          const categoryId = rows[0].id
          return knex(SYSTEM_CODES).insert([
            {
              code: 'untrusted',
              display_name: 'Requires approval to publish',
              parent_id: categoryId,
            },
            {
              code: 'trusted',
              display_name: 'Trusted to self-publish',
              parent_id: categoryId,
            },
            {
              code: 'blocked',
              display_name: 'Blocked from publishing',
              parent_id: categoryId,
            },
          ])
        })
    })
}

exports.down = function (knex) {
  const catRows = knex(SYSTEM_CODES)
    .select('id')
    .where({ code: 'authorStatus' })
  console.log(catRows)

  return knex.schema
    .dropTableIfExists(AUTHORS)
    .then(() => {
      return knex(SYSTEM_CODES).where({ code: 'authorStatus' }).del()
    })
}
