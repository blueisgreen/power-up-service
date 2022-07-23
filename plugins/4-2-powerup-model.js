'use strict'

const fp = require('fastify-plugin')
const actionModel = require('../db/models/actionModel')
const adminModel = require('../db/models/adminModel')
const articleModel = require('../db/models/articleModel')
const authorModel = require('../db/models/authorModel')
const identityModel = require('../db/models/identityModel')
const supportModel = require('../db/models/supportModel')
const systemCodesModel = require('../db/models/systemCodesModel')

module.exports = fp(
  async function (fastify, options, next) {
    fastify.log.info('loading power up data model')
    const data = {
      action: actionModel(fastify),
      admin: adminModel(fastify),
      article: articleModel(fastify),
      author: authorModel(fastify),
      identity: identityModel(fastify),
      support: supportModel(fastify),
      systemCodes: systemCodesModel(fastify),
      workbench: articleModel(fastify)  // TODO: remove after conversion to article
    }
    fastify.decorate('data', data)
    next()
  },
  {
    fastify: '3.x',
    name: 'powerup-model',
  }
)
