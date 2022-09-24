const fp = require('fastify-plugin')
const lookups = require('../../db/lookupPlugin')

module.exports = fp(lookups, {
  fastify: '4.x',
  name: 'powerup-lookups',
})
