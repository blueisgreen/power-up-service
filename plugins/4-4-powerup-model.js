'use strict'

const fp = require('fastify-plugin')
const identityModel = require('../db/access/identityModel')
const supportModel = require('../db/access/supportModel')

module.exports = fp(
  async function (fastify, options, next) {
    fastify.log.info('loading power up data model')
    const data = {
      identity: identityModel(fastify),
      support: supportModel(fastify),
    }
    fastify.decorate('data', data)
    next()
  },
  {
    fastify: '3.x',
    name: 'powerup-model',
  }
)
