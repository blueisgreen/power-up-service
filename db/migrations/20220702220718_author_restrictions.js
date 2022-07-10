const AUTHORS = 'authors'
const SYSTEM_CODES = 'system_codes'
const ARTICLES = 'articles'
const USERS = 'users'

exports.up = function (knex) {
  return knex.schema
    .createTable(AUTHORS, function (table) {
      table.increments()
      table.integer('user_id').references('id').inTable(USERS)
      table.string('pen_name').notNullable()
      table.string('status')
      table.timestamps(true, true)
    })
    .then(() => {
      return knex.schema.alterTable(ARTICLES, function (table) {
        table.timestamp('requested_to_publish_at')
      })
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
              display_name: 'Not trusted',
              parent_id: categoryId,
            },
            {
              code: 'trusted',
              display_name: 'Trusted',
              parent_id: categoryId,
            },
            {
              code: 'blocked',
              display_name: 'Blocked',
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
    .alterTable(ARTICLES, function (table) {
      table.dropColumn('requested_to_publish_at')
    })
    .then(() => {
      return knex(SYSTEM_CODES).where({ code: 'authorStatus' }).del()
    })
}
