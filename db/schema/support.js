const recreateInquiriesTable = async (fastify) => {
  const tableName = 'inquiries'
  const { knex, log } = fastify
  await knex.schema.dropTableIfExists(tableName)
  await knex.schema.createTable(tableName, (table) => {
    table.increments('id')
    table.integer('user_id')
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.integer('relates_to')
    table.string('purpose')
    table.text('message')
  })
  log.info(`created ${tableName}`)
}

const rebuildSchema = async (fastify) => {
  await recreateInquiriesTable(fastify)
}

module.exports = {
  rebuildSchema,
}
