exports.up = function (knex) {
  return knex.schema.createTable('articles', (table) => {
    table.increments('id')
    table.string('headline')
    table.string('byline')
    table.string('synopsis')
    table.string('cover_art_url')
    table.text('content')
    table.timestamps(true, true)
    table.timestamp('published_at')
    table.timestamp('archived_at')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('articles')
}
