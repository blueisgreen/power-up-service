'use strict'

const fp = require('fastify-plugin')
// const identity = require('../db/access/identity')

const userReturnColumns = [
  'id',
  'public_id',
  'alias',
  'email',
  'created_at as createdAt',
  'updated_at as updatedAt',
  'terms_accepted_at as termsAcceptedAt',
  'cookies_accepted_at as cookiesAcceptedAt',
  'email_comms_accepted_at as emailCommsAcceptedAt',
  'account_status_id',
]

module.exports = fp(
  async function (fastify, options, next) {
    fastify.log.info('loading power up data access')
    const identity = {
      blargy,
      getUser,
    }
    fastify.decorate('data', { identity })
    // fastify.decorate('blargy', blargy)
    // fastify.decorate('getUser', getUser)
    next()

    function blargy() {
      fastify.log.info('blargy blargy')
      return { message: 'this is a message from blargy' }
    }

    async function getUser(userPublicId) {
      const { knex, log } = fastify
      log.info('called getUser Io')
      const userRecord = await knex('users')
        .returning(userReturnColumns)
        .where('public_id', '=', userPublicId)
      return userRecord.length > 0 ? userRecord[0] : null
    }
  },
  {
    fastify: '3.x',
    name: 'powerup-dataaccess',
  }
)
