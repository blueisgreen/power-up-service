const userReturnColumns = [
  'id',
  'public_id as userKey',
  'alias',
  'email',
  'created_at as createdAt',
  'updated_at as updatedAt',
  'terms_accepted_at as termsAcceptedAt',
  'cookies_accepted_at as cookiesAcceptedAt',
  'email_comms_accepted_at as emailCommsAcceptedAt',
  'account_status_id',
]

// TODO: verify that userPublicId parameter is uuid or wrap query in try-catch and handle

module.exports = (fastify) => {
  const { knex, log } = fastify

  const getUser = async (userId) => {
    log.debug('identity plugin: getUser')
    const userRecord = await knex('users')
      .returning(userReturnColumns)
      .where('id', '=', userId)
    return userRecord.length > 0 ? userRecord[0] : null
  }

  const getUserWithPublicId = async (userPublicId) => {
    log.debug('identity plugin: getUserWithPublicId')
    const userRecord = await knex('users')
      .returning(userReturnColumns)
      .where('public_id', '=', userPublicId)
    return userRecord.length > 0 ? userRecord[0] : null
  }

  const findUserWithPublicId = async (userPublicId, platform) => {
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

  const findUserFromSocialProfile = async (platform, profileId) => {
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
        `user not found with social ID '${profileId}' on platform '${platform}'`
      )
      return null
    }

    return getUser(profileRecord[0].userId)
  }

  const registerUser = async (
    platform,
    accessToken,
    socialProfile,
    userPublicId
  ) => {
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

  const getUserRoles = async (userId) => {
    log.debug('identity plugin: getUserRoles')
    const roleRecords = await knex('system_codes')
      .select('system_codes.code')
      .join('user_roles', 'user_roles.role_id', '=', 'system_codes.id')
      .where({ user_id: userId })
    const roles = roleRecords.map((record) => record.code)
    return roles
  }

  const grantRoles = async (userId, roles) => {
    log.debug('identity plugin: grantRoles')
    const roleMap = fastify.lookups.roles
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

  const agreeToTerms = async (publicId) => {
    log.debug('identity plugin: agreeToTerms')
    const now = new Date()
    await knex('users').where('public_id', '=', publicId).update({
      terms_accepted_at: now,
      updated_at: now,
    })
    return true
  }

  const agreeToCookies = async (publicId) => {
    log.debug('identity plugin: agreeToCookies')
    const now = new Date()
    await knex('users').where('public_id', '=', publicId).update({
      cookies_accepted_at: now,
      updated_at: now,
    })
    return true
  }

  const agreeToEmailComms = async (publicId) => {
    log.debug('identity plugin: agreeToEmailComms')
    const now = new Date()
    await knex('users').where('public_id', '=', publicId).update({
      email_comms_accepted_at: now,
      updated_at: now,
    })
    return true
  }

  const updateUser = async (userPublicId, changes) => {
    log.debug('identity plugin: updateUser')
    const now = new Date()
    const userBefore = await getUserWithPublicId(userPublicId)
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

    // if (changes.agreeToTerms) {
    if (true) {
      await grantRoles(userId, ['member'])
    }

    return await getUser(userId)
  }

  const findSessionToken = async (userPublicId) => {
    log.debug('identity plugin: findSessionToken')
    const result = await knex('user_sessions')
      .select('auth_token')
      .where('user_public_id', '=', userPublicId)

    return result[0].auth_token
  }

  const setSessionToken = async (userPublicId, sessionToken) => {
    log.debug('identity plugin: setSessionToken')
    await knex('user_sessions')
      .insert({
        user_public_id: userPublicId,
        auth_token: sessionToken,
      })
      .onConflict('user_public_id')
      .merge()
  }

  return {
    getUser,
    getUserWithPublicId,
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
}
