'use strict'

const fp = require('fastify-plugin')
const actionModel = require('../db/access/actionModel')
const adminModel = require('../db/access/adminModel')
const articleModel = require('../db/access/articleModel')
const authorModel = require('../db/access/authorModel')
const identityModel = require('../db/access/identityModel')
const supportModel = require('../db/access/supportModel')
const systemCodesModel = require('../db/access/systemCodesModel')

module.exports = fp(
  async function (fastify, options, next) {
    fastify.log.info('loading power up data model')
    const data = {
      action: actionModel(fastify),
      admin: adminModel(fastify),
      articles: articleModel(fastify),
      author: authorModel(fastify),
      identity: identityModel(fastify),
      support: supportModel(fastify),
      systemCodes: systemCodesModel(fastify),
      workbench: articleModel(fastify)  // TODO: remove after conversion to articles
    }
    fastify.decorate('data', data)
    next()
  },
  {
    fastify: '3.x',
    name: 'powerup-model',
  }
)
