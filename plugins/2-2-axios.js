const fp = require('fastify-plugin')
const axiosPlugin = require('fastify-axios')

module.exports = fp(async function (fastify, opts) {
  fastify.log.info('loading fastify-axios')
  fastify.register(axiosPlugin)
})
