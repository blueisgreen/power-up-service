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
  const { knex, log } = fastify

  fastify.log.info('loading power up data access')
  const identity = {
    getUser,
    findUser,
    findSessionToken,
  }
  fastify.decorate('data', { identity })
  next()

  async function getUser(userId) {
    log.debug('identity plugin: getUser')
    const userRecord = await knex('users')
      .returning(userReturnColumns)
      .where('id', '=', userId)
    return userRecord.length > 0 ? userRecord[0] : null
  }

  async function findUser(userPublicId, providerCode) {
    log.debug('identity plugin: findUser')
    const platformId = fastify.lookups.findPlatform(providerCode).id

    let profileRecord = await knex('social_profiles')
      .select('social_profiles.user_id as userId')
      .join('users', 'users.id', 'social_profiles.user_id')
      .where('users.public_id', '=', userPublicId)
      .andWhere('social_profiles.social_platform_id', '=', platformId)

    if (profileRecord.length < 1) {
      log.info(
        `profile not found for user '${userPublicId}'' using identity provider '${providerCode}'`
      )
      return null
    }

    return getUser(profileRecord[0].userId)
  }

  async function findSessionToken(userPublicId) {
    log.debug('identity plugin: findSessionToken')
    return await knex('user_sessions')
      .select('auth_token')
      .where('user_public_id', '=', userPublicId)
  }
}
