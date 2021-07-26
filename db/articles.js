/**
 * This will recreate the database table 'users'. Any existing data will be lost.
 */
const createArticlesTable = async (fastify) => {
  const articlesTableName = 'articles'
  const { knex, log } = fastify
  await knex.schema.dropTableIfExists(articlesTableName)
  await knex.schema.createTable(articlesTableName, (table) => {
      table.increments('id')
      table.string('headline')
      table.string('byline')
      table.string('cover_art_url')
      table.text('content')
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())
      table.timestamp('published_at')
      table.timestamp('archived_at')
  })
  log.info(`created ${articlesTableName}`)
}

const rebuildSchema = async (fastify) => {
  await createArticlesTable(fastify)
}

module.exports = {
  rebuildSchema,
}
