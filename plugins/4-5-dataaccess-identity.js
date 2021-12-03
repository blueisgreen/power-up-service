'use strict'

const fp = require('fastify-plugin')
const identity = require('../db/access/identityPlugin')

module.exports = fp(identity, {
  fastify: '3.x',
  name: 'powerup-dataaccess-identity',
})
