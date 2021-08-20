const system = require('./system.js')
const identity = require('./identity.js')
const articles = require('./articles.js')
const support = require('./support.js')

const rebuildSchema = async (fastify) => {
  // remember to add the extension to Postgres database
  //   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  await system.rebuildSchema(fastify)
  await identity.rebuildSchema(fastify)
  await articles.rebuildSchema(fastify)
  await support.rebuildSchema(fastify)
}

module.exports = {
  rebuildSchema,
}
