const identity = require('./identity.js')
const articles = require('./articles.js')
const support = require('./support.js')

const rebuildSchema = async (fastify) => {
  await identity.rebuildSchema(fastify)
  await articles.rebuildSchema(fastify)
  await support.rebuildSchema(fastify)
}

module.exports = {
  rebuildSchema,
}
