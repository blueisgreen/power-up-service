'use strict'

const fp = require('fastify-plugin')
const identityModel = require('../db/access/identityModel')
const adminModel = require('../db/access/adminModel')
const supportModel = require('../db/access/supportModel')
const actionModel = require('../db/access/actionModel')

module.exports = fp(
  async function (fastify, options, next) {
    fastify.log.info('loading power up data model')
    const data = {
      admin: adminModel(fastify),
      identity: identityModel(fastify),
      support: supportModel(fastify),
      action: actionModel(fastify),
    }
    fastify.decorate('data', data)
    next()
  },
  {
    fastify: '3.x',
    name: 'powerup-model',
  }
)
