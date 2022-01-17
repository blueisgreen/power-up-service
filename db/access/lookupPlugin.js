/**
 * Cache system codes for quick access. Also provide helpers
 * for converting between codes and database IDs.
 *
 * @param {*} fastify
 * @param {*} options
 * @param {*} next
 */
module.exports = async function (fastify, options, next) {
  const codes = await fastify.data.systemCodes.getAllCodes()
  fastify.decorate('lookups', await buildLookups(codes))
  next()

  async function buildLookups(codes) {
    const byId = {}
    const byCatIdAndCode = {}
    const byCatAndCode = {}
    const categoryCodes = {}
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
        categoryCodes[record.code] = record
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

    function mapToUI(codesToMap) {
      if (!codesToMap) {
        return []
      }
      return codesToMap.map((code) => ({
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
      const catCode = cat.code
      lookups[catCode] = mapToUI(byCatAndCode[catCode].all)
    })

    fastify.log.debug('== show lookups structure ==')
    fastify.log.debug(JSON.stringify(lookups))

    return lookups
  }
}
