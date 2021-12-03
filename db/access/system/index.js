const SYSTEM_CODES = 'system_codes'
const columnsToReturn = ['id', 'code', 'display_name as displayName']

module.exports = async function (fastify, options, next) {
  fastify.decorate('lookups', {
    platforms: await getCodes('socialPlatform'),
    findPlatform: (code) => {
      return fastify.lookups.platforms.find((item) => item.code === code)
    },
  })
  next()

  async function getCodes(category) {
    const { knex, log } = fastify
    log.debug(`retrieving codes for category ${category}`)
    const categoryRecord = await knex(SYSTEM_CODES)
      .select(columnsToReturn)
      .where({ code: category })

    if (categoryRecord.length === 0) {
      log.warn(`no codes found for category ${category}`)
      return []
    }
    const categoryId = categoryRecord[0].id
    const codeRecords = await knex(SYSTEM_CODES)
      .select(columnsToReturn)
      .where({ parent_id: categoryId })

    return codeRecords
  }

  // const getCategories = async (fastify) => {
  //   const { knex, log } = fastify
  //   log.debug('retrieving categories')
  //   const codeRecords = await knex(SYSTEM_CODES)
  //     .select(columnsToReturn)
  //     .whereIsNull('parent_id')
  //   return codeRecords
  // }
}
