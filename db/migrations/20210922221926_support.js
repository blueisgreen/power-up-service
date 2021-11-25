const USERS = 'users'
const INQUIRIES = 'inquiries'
const ACTIVITIES = 'activities'

exports.up = function (knex) {
  return knex.schema
    .createTable(INQUIRIES, (table) => {
      table.increments('id')
      table.integer('user_id')
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.integer('relates_to')
      table.string('purpose')
      table.text('message')
      table.foreign('user_id').references('id').inTable(USERS)
      table.foreign('relates_to').references('id').inTable(INQUIRIES)
    })
    .createTable(ACTIVITIES, (table) => {
      table.increments('id')
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.string('action_code')
      table.text('details')
      table.uuid('user_public_id')
      table.foreign('user_public_id').references('public_id').inTable(USERS)
    })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists(INQUIRIES).dropTableIfExists(ACTIVITIES)
}
