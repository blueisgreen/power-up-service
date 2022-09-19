const actionModel = require('./models/actionModel')
// const adminModel = require('./models/adminModel')
const articleModel = require('./models/articleModel')
const authorModel = require('./models/authorModel')
const identityModel = require('./models/identityModel')
const supportModel = require('./models/supportModel')
const systemCodesModel = require('./models/systemCodesModel')
const userModel = require('./models/userModel')
const userRoleModel = require('./models/userRoleModel')

module.exports = async function (fastify, options, next) {
  fastify.log.debug('loading power up data models')
  const data = {
    action: actionModel(fastify),
    // admin: adminModel(fastify),
    article: articleModel(fastify),
    author: authorModel(fastify),
    identity: identityModel(fastify),
    support: supportModel(fastify),
    systemCodes: systemCodesModel(fastify),
    user: userModel(fastify),
    userRole: userRoleModel(fastify),
  }
  fastify.decorate('data', data)
  next()
}
