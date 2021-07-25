const system = require('./system.js')
const identity = require('./identity.js')
const articles = require('./articles.js')

const rebuildSchema = async (fastify) => {
  await system.rebuildSchema(fastify)
  await identity.rebuildSchema(fastify)
  await articles.rebuildSchema(fastify)
}

module.exports = {
  rebuildSchema,
}
