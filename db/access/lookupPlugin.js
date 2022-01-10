const { getAllCodes } = require('./systemCodesModel')

/**
  Structure of lookups:

  lookups: {
    all: [ // ids // ],
    byId: {
      1: { id, code, displayName }
    },
    byCode: {
      all: [ // ids // ],
      parent-id: {
        code: { id, code, displayName }
      }
    },
    byCategory: {
      cat: [],
    }
  }
*/
module.exports = async function (fastify, options, next) {
  fastify.decorate('lookups', buildLookups())
  next()

  // helper methods below

  function buildLookups() {
    const codes = await getAllCodes()

    const byId = {}
    const byCatIdAndCode = {}
    const byCategoryAndCode = {}
    const categoriesByCode = {}

    codes.forEach((record) => {
      byId[record.id] = record

      // category-code should be unique
      if (record.parent_id) {
        if (!byCatIdAndCode[record.parent_id]) {
          byCatIdAndCode[record.parent_id] = []
        }
        byCatIdAndCode[record.parent_id].all.push(record)
        byCatIdAndCode[record.parent_id][record.code] = record
      } else {
        // keep track of category codes
        categoriesByCode[record.code] = record
      }
    })

    const idToCode = (id) => {
      return byId[id].code
    }

    const codeLookup = (catCode, code) => {
      return byCategoryAndCode[catCode][code]
    }

    byCatIdAndCode.keys().forEach((key) => {
      byCategoryAndCode[idToCode(key)] = byCatIdAndCode[key]
    })

    const lookups = {
      idToCode,
      codeLookup,
      categoriesByCode,
      uiOptionLists,
    }

    const getCategoriesForUI = () => {}

    const getCodesByCategoryForUI = (catCode) => {
      const records = categoriesByCode[catCode].all
      const results = records.map((record) => {
        return {
          code: record.code,
          display: record.displayName,
        }
      })
    }

    return lookups
  }
}

// fastify.decorate('lookups', {
//   platforms: await getCodes('socialPlatform'),
//   findPlatform: (code) => {
//     return fastify.lookups.platforms.find((item) => item.code === code)
//   },
//   roles: await getCodes('role'),
//   findRole: (code) => {
//     return fastify.lookups.roles.find((item) => item.code === code)
//   },
// })
