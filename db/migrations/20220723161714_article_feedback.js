const { generateRandomKey } = require('../models/util')

const ARTICLES = 'articles'
const INQUIRIES = 'inquiries'

exports.up = function (knex) {
  return knex.schema
    .alterTable(INQUIRIES, function (table) {
      table
        .integer('about_article_id')
        .references('id')
        .inTable(ARTICLES)
        .onDelete('CASCADE')
    })
    // ==> keep code sample for reference
    // .then(() => {
    //   // give unique keys to existing articles
    //   return knex(ARTICLES)
    //     .select('id')
    //     .then((rows) => {
    //       rows.forEach(async (row) => {
    //         const articleKey = generateRandomKey()
    //         console.log(articleKey)
    //         await knex(ARTICLES)
    //           .where({ id: row.id })
    //           .update({ public_id: articleKey })
    //       })
    //     })
    // })
}

exports.down = function (knex) {
  return knex.schema
    .alterTable(INQUIRIES, function (table) {
      table.dropColumn('about_article_id')
    })
}
