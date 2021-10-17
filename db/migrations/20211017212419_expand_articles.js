exports.up = function (knex) {
  return knex.schema.table('articles', (table) => {
    table.string('synopsis')
  })
}

exports.down = function (knex) {
  return knex.schema.table('articles', (table) => {
    table.dropColumn('synopsis')
  })
}
