exports.up = function (knex) {
  return knex.schema.createTable('inquiries', (table) => {
    table.increments('id')
    table.integer('user_id')
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.integer('relates_to')
    table.string('purpose')
    table.text('message')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('inquiries')
}
