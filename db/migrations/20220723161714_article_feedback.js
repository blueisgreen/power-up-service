const ARTICLES = 'articles'
const INQUIRIES = 'inquiries'

exports.up = function (knex) {
  return knex.schema
    .alterTable(ARTICLES, function (table) {
      table.string('public_id')
    })
    .alterTable(INQUIRIES, function (table) {
      table.string('about_article_id')
    })
}

exports.down = function (knex) {
  return knex.schema
    .alterTable(ARTICLES, function (table) {
      table.dropColumn('public_id')
    })
    .alterTable(INQUIRIES, function (table) {
      table.dropColumn('about_article_id')
    })
}
