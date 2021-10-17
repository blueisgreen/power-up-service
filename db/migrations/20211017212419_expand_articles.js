exports.up = function (knex) {
  return knex.schema.table('articles', (table) => {
    table.string('synposis')
  })
}

exports.down = function (knex) {
  return knex.schema.table('articles', (table) => {
    table.dropColumn('synposis')
  })
}
