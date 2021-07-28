const system = require('./schema/system.js')
const identity = require('./schema/identity.js')
const articles = require('./schema/articles.js')

const rebuildSchema = async (fastify) => {
  await system.rebuildSchema(fastify)
  await identity.rebuildSchema(fastify)
  await articles.rebuildSchema(fastify)
}

module.exports = {
  rebuildSchema,
}
