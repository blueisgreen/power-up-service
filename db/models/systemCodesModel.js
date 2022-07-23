const { systemCodeTableName, systemCodeColumns } = require('./modelFieldMap')

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
