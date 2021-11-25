const SYSTEM_CODES = 'system_codes'
const columnsToReturn = ['id', 'code', 'display_name as displayName']

const getCodes = async (fastify, category) => {
  const { knex, log } = fastify
  log.debug(`retrieving codes for category ${category}`)
  const codeRecords = await knex(SYSTEM_CODES)
    .select(columnsToReturn)
    .where('parent_id', '=', category) // FIXME: join where category matches parent_id.code
  return codeRecords
}

const getCategories = async (fastify) => {
  const { knex, log } = fastify
  log.debug('retrieving categories')
  const codeRecords = await knex(SYSTEM_CODES)
    .select(columnsToReturn)
    .whereIsNull('parent_id')
  return codeRecords
}
