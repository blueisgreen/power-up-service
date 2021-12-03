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
    findUserWithPublicId,
    findUserFromSocialProfile,
    registerUser,
    getUserRoles,
    grantRoles,
    agreeToTerms,
    agreeToCookies,
    agreeToEmailComms,
    updateUser,
    findSessionToken,
    setSessionToken,
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

  async function findUserWithPublicId(userPublicId, platform) {
    log.debug('identity plugin: findUserWithPublicId')
    const platformId = fastify.lookups.findPlatform(platform).id
    let profileRecord = await knex('social_profiles')
      .select('social_profiles.user_id as userId')
      .join('users', 'users.id', 'social_profiles.user_id')
      .where('users.public_id', '=', userPublicId)
      .andWhere('social_profiles.social_platform_id', '=', platformId)

    if (profileRecord.length < 1) {
      log.info(
        `user not found with public ID '${userPublicId}' on platform '${platform}'`
      )
      return null
    }

    return getUser(profileRecord[0].userId)
  }

  async function findUserFromSocialProfile(platform, profileId) {
    log.debug('identity plugin: findUserFromSocialProfile')

    const platformId = fastify.lookups.findPlatform(platform).id
    const profileRecord = await knex('social_profiles')
      .select('user_id as userId')
      .where({
        social_platform_id: platformId,
        social_id: profileId,
      })

    if (profileRecord.length < 1) {
      log.info(
        `user not found with social ID '${profileId}' on platform '${provider}'`
      )
      return null
    }

    return getUser(profileRecord[0].userId)
  }

  async function registerUser(
    platform,
    accessToken,
    socialProfile,
    userPublicId
  ) {
    log.debug('identity plugin: registerUser')

    const platformId = fastify.lookups.findPlatform(platform).id
    const userRecord = await knex('users').returning(userReturnColumns).insert({
      public_id: userPublicId,
      alias: socialProfile.name,
      email: socialProfile.email,
      avatar_url: socialProfile.avatar_url,
    })

    log.debug('user record ==V')
    log.debug(JSON.stringify(userRecord[0]))
    const id = userRecord[0].id

    await knex('social_profiles').insert({
      user_id: id,
      social_id: socialProfile.id,
      social_platform_id: platformId,
      access_token: accessToken,
      social_user_info: socialProfile,
    })

    return getUser(id)
  }

  async function getUserRoles(userId) {
    log.debug('identity plugin: getUserRoles')
    const roleRecords = await knex('system_codes')
      .select('system_codes.code')
      .join('user_roles', 'user_roles.role_id', '=', 'system_codes.id')
      .where({ user_id: userId })
    const roles = roleRecords.map((record) => record.code)
    return roles
  }

  async function grantRoles(userId, roles) {
    log.debug('identity plugin: grantRoles')
    const roleMap = await knex('system_codes as a')
      .join('system_codes as b', 'a.parent_id', '=', 'b.id')
      .where('b.code', '=', 'role')
      .select('a.*')
    info.debug(roleMap)
    const roleIdsToGrant = roles.map((role) => {
      const roleToUse = roleMap.find((element) => element.code === role)
      return roleToUse.id
    })
    roleIdsToGrant.forEach(async (roleId) => {
      await knex('user_roles')
        .insert({ user_id: userId, role_id: roleId })
        .onConflict()
        .ignore()
    })
    return true
  }

  async function agreeToTerms(publicId) {
    log.debug('identity plugin: agreeToTerms')
    const now = new Date()
    await knex('users').where('public_id', '=', publicId).update({
      terms_accepted_at: now,
      updated_at: now,
    })
    return true
  }

  async function agreeToCookies(publicId) {
    log.debug('identity plugin: agreeToCookies')
    const now = new Date()
    await knex('users').where('public_id', '=', publicId).update({
      cookies_accepted_at: now,
      updated_at: now,
    })
    return true
  }

  async function agreeToEmailComms(publicId) {
    log.debug('identity plugin: agreeToEmailComms')
    const now = new Date()
    await knex('users').where('public_id', '=', publicId).update({
      email_comms_accepted_at: now,
      updated_at: now,
    })
    return true
  }

  async function updateUser(userPublicId, changes) {
    log.debug('identity plugin: updateUser')
    const now = new Date()
    const userBefore = await getUser(fastify, userPublicId)
    const userAfter = Object.assign({}, userBefore, {
      alias: changes.alias,
      email: changes.email,
      avatar_url: changes.avatarUrl,
      updated_at: now,
    })
    if (!userBefore.terms_accepted_at && changes.agreeToTerms) {
      userAfter.terms_accepted_at = now
    }
    if (!userBefore.cookies_accepted_at && changes.agreeToCookies) {
      userAfter.cookies_accepted_at = now
    }
    if (!userBefore.email_comms_accepted_at && changes.agreeToEmailComms) {
      userAfter.email_comms_accepted_at = now
    }
    const result = await knex('users')
      .where('public_id', '=', userPublicId)
      .update(userAfter, ['id'])

    const userId = result[0].id

    if (changes.agreeToTerms) {
      await grantRoles(userId, ['member'])
    }

    return await getUser(userId)
  }

  async function findSessionToken(userPublicId) {
    log.debug('identity plugin: findSessionToken')
    return await knex('user_sessions')
      .select('auth_token')
      .where('user_public_id', '=', userPublicId)
  }

  async function setSessionToken(userPublicId, sessionToken) {
    log.debug('identity plugin: setSessionToken')
    await knex('user_sessions')
      .insert({
        user_public_id: userPublicId,
        auth_token: sessionToken,
      })
      .onConflict('user_public_id')
      .merge()
  }
}
