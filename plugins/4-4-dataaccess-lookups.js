'use strict'

const fp = require('fastify-plugin')
const lookups = require('./lookupPlugin')

module.exports = fp(lookups, {
  fastify: '3.x',
  name: 'powerup-dataaccess-lookups',
})
