exports.up = function (knex) {
  return knex.schema.createTable('system_codes', function (table) {
    table.increments()
    table.string('public_id').notNullable()
    table.string('display_name').notNullable()
    table.integer('parent_id').references('id').inTable('system_codes')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('system_codes')
}
