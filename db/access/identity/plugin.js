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

module.exports = async function (fastify, options, next) {
  fastify.log.info('loading power up data access')
  const identity = {
    blargy,
    getUser,
  }
  fastify.decorate('data', { identity })
  next()

  function blargy() {
    const msg = 'identity plugin: hello blargy'
    fastify.log.info(msg)
    return { message: msg }
  }

  async function getUser(userPublicId) {
    const { knex, log } = fastify
    log.info('identity plugin: getUser')
    const userRecord = await knex('users')
      .returning(userReturnColumns)
      .where('public_id', '=', userPublicId)
    return userRecord.length > 0 ? userRecord[0] : null
  }
}
