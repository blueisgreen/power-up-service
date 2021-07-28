const system = require('./schema/system.js')
const identity = require('./schema/identity.js')
const articles = require('./schema/articles.js')

const rebuildSchema = async (fastify) => {
  // remember to add the extension to Postgres database
  //   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  await system.rebuildSchema(fastify)
  await identity.rebuildSchema(fastify)
  await articles.rebuildSchema(fastify)
}

module.exports = {
  rebuildSchema,
}
