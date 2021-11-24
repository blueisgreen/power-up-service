const ARTICLES = 'articles'
const ARTICLE_HITS = 'article_hits' // TODO track times an article is accessed

exports.up = function (knex) {
  return knex.schema.createTable(ARTICLES, (table) => {
    table.increments('id')
    table.string('headline')
    table.string('byline')
    table.text('synopsis') // FIXME longer than default
    table.string('cover_art_url') // FIXME longer than default
    table.text('content')
    table.timestamps(true, true)
    table.timestamp('published_at')
    table.timestamp('archived_at')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists(ARTICLES)
}
