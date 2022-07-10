const ARTICLES = 'articles'
const ARTICLE_HITS = 'article_hits' // TODO track times an article is accessed

exports.up = function (knex) {
  return knex.schema.createTable(ARTICLES, (table) => {
    table.increments('id')
    table.integer('author_id')
    table.string('headline', 500)
    table.string('byline', 100)
    table.text('synopsis')
    table.text('cover_art_url')
    table.text('content')
    table.timestamps(true, true)
    table.timestamp('published_at')
    table.timestamp('archived_at')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists(ARTICLES)
}
