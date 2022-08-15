const systemCodeTableName = 'system_codes'
const systemCodeColumns = [
  'id',
  'code',
  'display_name as displayName',
  'parent_id',
]

module.exports = (fastify) => {
  const { knex, log } = fastify

  const getAllCodes = async () => {
    log.debug('systemCodesModel.getAllCodes')
    return await knex.from(systemCodeTableName).select(systemCodeColumns)
  }

  return {
    getAllCodes,
  }
}
