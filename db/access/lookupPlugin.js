/**
  Structure of lookups:

  lookups: {
    byId: {
      1: { id, code, displayName }
    },
    byCatAndCode: {
      all: [ // ids // ],
      parent-id: {
        code: { id, code, displayName }
      }
    },
    catsByCode: {
      code: { id, code, displayName },
    },
    categories: [],
    idToCode(id),
    codeLookup(catCode, code)
    categoriesForSelect: [],
    category1: [],
    category2: [],
  }
*/
module.exports = async function (fastify, options, next) {
  const codes = await fastify.data.systemCodes.getAllCodes()
  fastify.decorate('lookups', buildLookups(codes))
  next()

  async function buildLookups(codes) {
    const byId = {}
    const byCatIdAndCode = {}
    const byCatAndCode = {}
    const catsByCode = {}
    const categories = []

    codes.forEach((record) => {
      byId[record.id] = record

      // category-code should be unique
      if (record.parent_id) {
        if (!byCatIdAndCode[record.parent_id]) {
          byCatIdAndCode[record.parent_id] = {
            all: [],
          }
        }
        byCatIdAndCode[record.parent_id].all.push(record)
        byCatIdAndCode[record.parent_id][record.code] = record
      } else {
        categories.push(record)
        catsByCode[record.code] = record
      }
    })

    const catIds = Object.keys(byCatIdAndCode)
    catIds.forEach((id) => {
      byCatAndCode[idToCode(id)] = byCatIdAndCode[id]
    })

    function idToCode(id) {
      return byId[id].code
    }

    function codeLookup(catCode, code) {
      return byCatAndCode[catCode][code]
    }

    function mapToUI(codes) {
      if (!codes) {
        return []
      }
      return codes.map((code) => ({
        code: code.code,
        displayName: code.displayName,
      }))
    }

    const lookups = {
      idToCode,
      codeLookup,
      categoriesForUI: mapToUI(categories),
    }

    categories.map((cat) => {
      fastify.log.debug(cat)
      lookups[cat] = mapToUI(catsByCode[cat])
    })

    fastify.log.debug('== show lookups structure ==')
    fastify.log.debug(JSON.stringify(lookups))

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
