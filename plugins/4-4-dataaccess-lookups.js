'use strict'

const fp = require('fastify-plugin')
const lookups = require('../db/access/lookupPlugin')

module.exports = fp(lookups, {
  fastify: '4.x',
  name: 'powerup-dataaccess-lookups',
})
