'use strict'

const fp = require('fastify-plugin')
const identityModel = require('../db/access/identityModel')
const adminModel = require('../db/access/adminModel')
const supportModel = require('../db/access/supportModel')
const actionModel = require('../db/access/actionModel')
const systemCodesModel = require('../db/access/systemCodesModel')
const workbenchModel = require('../db/access/workbenchModel')

module.exports = fp(
  async function (fastify, options, next) {
    fastify.log.info('loading power up data model')
    const data = {
      admin: adminModel(fastify),
      identity: identityModel(fastify),
      support: supportModel(fastify),
      action: actionModel(fastify),
      systemCodes: systemCodesModel(fastify),
      workbench: workbenchModel(fastify)
    }
    fastify.decorate('data', data)
    next()
  },
  {
    fastify: '4.x',
    name: 'powerup-model',
  }
)
