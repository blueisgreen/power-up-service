const system = require('./system.js')
const identity = require('./identity.js')

const rebuildSchema = async (fastify) => {
  await system.rebuildSchema(fastify)
  await identity.rebuildSchema(fastify)
}

module.exports = {
  rebuildSchema,
}
