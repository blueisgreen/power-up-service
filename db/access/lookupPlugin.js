const SYSTEM_CODES = 'system_codes'
const columnsToReturn = ['id', 'code', 'display_name as displayName']

const { getAllCodes } = require('./systemCodesModel')

module.exports = async function (fastify, options, next) {
  const codes = await getAllCodes()

  /* 
  Set up lookup structure like this:
  lookups: {
    all: [ // ids // ],
    byId: {
      1: { id, code, displayName }
    },
    byCode: {
      parent-id: {
        code: { id, code, displayName }
      }
    },
    byCategory: {
      cat: [],
    }
  }
   */
  const all = []
  const byId = {}
  const byCode = {}
  const categoriesByCode = {}
  codes.map((code) => {
    all.push[code]
    byId[code.id] = code

    // category-code should be unique
    if (code.parent_id) {
      if (!byCode[code.parent_id]) {
        byCode[code.parent_id] = {}
      }
      byCode[code.parent_id][code.code] = code
    } else {
      // keep track of category codes
      categoriesByCode[code.code] = code
    }
  })

  const lookups = {
    all,
    byId,
    byCode,
    categoriesByCode,
    getById = (id) => {
      return byId[id] 
    },
    getByCode = (catCode, code) => {
      const catId = categoriesByCode[catCode]
      return byCode[catId][code]
    },
    getSelectOptionsForUI = (catCode) => {
      const catId = categoriesByCode[catCode]
      
    }
  }

  fastify.decorate('lookups', lookups)

  fastify.decorate('lookups', {
    platforms: await getCodes('socialPlatform'),
    findPlatform: (code) => {
      return fastify.lookups.platforms.find((item) => item.code === code)
    },
    roles: await getCodes('role'),
    findRole: (code) => {
      return fastify.lookups.roles.find((item) => item.code === code)
    },
  })
  next()

  async function loadSystemCodes() {
    // load all codes into structure like:
    // codes: byId, byCategory
    // use that to implement lookup methods
  }

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

  /**
   * Given type, return look-up options for UI.
   */
  function lookupOptions(category) {}

  function codeToId(code) {}

  function idToCode(id) {}

  /**
   * Given a code, return the display name
   * @param {*} code
   */
  function decode(code) {}
}
