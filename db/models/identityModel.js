const userTableName = 'users'
const userColumns = [
  'users.id',
  'public_id as userKey',
  'alias',
  'email',
  'avatar_url as avatarUrl',
  'created_at as createdAt',
  'updated_at as updatedAt',
  'terms_accepted_at as termsAcceptedAt',
  'cookies_accepted_at as cookiesAcceptedAt',
  'email_comms_accepted_at as emailCommsAcceptedAt',
  'system_codes.code as statusKey',
]

const userContextColumns = [
  'users.id',
  'public_id as userKey',
  'alias',
  'system_codes.code as statusKey',
  'pen_name as penName',
  'authors.status as authorStatus',
]

// TODO: validation: verify that userPublicId parameter is uuid or wrap query in try-catch and handle

module.exports = (fastify) => {
  const { knex, log } = fastify

  const __getUserRecord = async (userId) => {
    const userRecord = await knex(userTableName)
      .select(userColumns)
      .where('users.id', '=', userId)
      .join('system_codes', { 'users.account_status_id': 'system_codes.id' })
    return userRecord.length > 0 ? userRecord[0] : null
  }

  /**
   * Gets user information.
   *
   * @param {string} userKey unique public user identifier
   * @returns UserInfo
   */
  const getUser = async (userKey) => {
    log.debug('identityModel.getUser')
    const userId = await knex(userTableName)
      .select('id')
      .where('public_id', '=', userKey)
    log.debug(userId)
    return userId[0] ? __getUserRecord(userId[0].id) : null
  }

  /**
   * Returns frequently used subset of user information.
   *
   * @param {string} userKey unique public user identifier
   * @returns
   */
  const getUserContext = async (userKey) => {
    log.debug('identityModel.getUserContext')

    const result = await knex(userTableName)
      .select(userContextColumns)
      .join('system_codes', { 'users.account_status_id': 'system_codes.id' })
      .join('authors', { 'users.id': 'authors.user_id' })
      .where('public_id', '=', userKey)

    const userContext = Object.assign({}, result[0])

    const roles = await getUserRoles(userContext.id)
    userContext['hasRole'] = {}
    roles.map((role) => (userContext.hasRole[role] = true))

    return userContext
  }

  /**
   * 
   */
  const findUserOnPlatform = async (userKey, platform) => {
    log.debug(
      `identityModel.findUserOnPlatform using userKey ${userKey} on platform ${platform}`
    )
    const platformCode = fastify.lookups.codeLookup('socialPlatform', platform)
    if (!userKey || !platformCode) {
      log.debug(
        `Need both userKey and platform: ${userKey} ${platform} ${platformCode}`
      )
      return null
    }
    const platformId = platformCode.id
    let profileRecord = await knex('social_profiles')
      .select('social_profiles.user_id as userId')
      .join(userTableName, 'users.id', 'social_profiles.user_id')
      .where('users.public_id', '=', userKey)
      .andWhere('social_profiles.social_platform_id', '=', platformId)

    if (profileRecord.length < 1) {
      log.info(
        `user not found with public ID '${userKey}' on platform '${platform}'`
      )
      return null
    }

    return __getUserRecord(profileRecord[0].userId)
  }

  const findUserFromSocialProfile = async (platform, profileId) => {
    log.debug('identityModel.findUserFromSocialProfile')

    const platformId = fastify.lookups.codeLookup('socialPlatform', platform).id
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

    return __getUserRecord(profileRecord[0].userId)
  }

  // TODO: pull this up out of the model
  const registerUser = async (
    platform,
    accessToken,
    socialProfile,
    userPublicId,
    accessTokenExpiresIn = 0
  ) => {
    log.debug('identityModel.registerUser')

    const platformId = fastify.lookups.codeLookup('socialPlatform', platform).id
    const userRecord = await knex(userTableName)
      .returning(userColumns)
      .insert({
        public_id: userPublicId,
        alias: socialProfile.name,
        email: socialProfile.email,
        avatar_url: socialProfile.avatar_url || socialProfile.picture,
      })

    log.debug('user record ==V')
    log.debug(JSON.stringify(userRecord[0]))
    const id = userRecord[0].id
    await knex('social_profiles').insert({
      user_id: id,
      social_id: socialProfile.id || socialProfile.sub,
      social_platform_id: platformId,
      access_token: accessToken,
      social_user_info: socialProfile,
      access_token_exp: accessTokenExpiresIn,
    })

    return __getUserRecord(id)
  }

  // TODO: pull this up out of the model
  const becomeMember = async (userKey, alias, okToTerms, okToCookies) => {
    log.debug(`identityModel.becomeMember ${userKey}, ${alias}`)
    const active = fastify.lookups.codeLookup('accountStatus', 'active')
    const now = new Date()
    const membership = {
      alias,
      updated_at: now,
      account_status_id: active.id,
    }
    if (okToTerms) {
      membership.terms_accepted_at = now
    }
    if (okToCookies) {
      membership.cookies_accepted_at = now
    }
    const result = await knex(userTableName)
      .returning(userColumns)
      .where('public_id', '=', userKey)
      .update(membership)
    const userInfo = result[0]
    if (okToTerms) {
      await grantRoles(userInfo.id, ['member'])
      const roles = getUserRoles(userInfo.id)
      userInfo.roles = roles
    }
    return userInfo
  }

  // TODO: pull this up out of the model
  const becomeAuthor = async (userKey) => {
    log.debug('identityModel.becomeAuthor')
    const userInfo = await getUser(userKey)

    const authorRecord = await fastify.data.author.createAuthor(
      userInfo.id,
      userInfo.penName
    )
    await grantRoles(userInfo.id, ['author'])
    const roles = await getUserRoles(userInfo.id)
    userInfo.author = authorRecord
    userInfo.roles = roles
    return userInfo
  }

  const getUserRoles = async (userId) => {
    log.debug('identityModel.getUserRoles')
    const roleRecords = await knex('system_codes')
      .select('system_codes.code')
      .join('user_roles', 'user_roles.role_id', '=', 'system_codes.id')
      .where({ user_id: userId })
    const roles = roleRecords.map((record) => record.code)
    log.debug(`roles ${roles}`)
    return roles
  }

  const getUserRolesWithPublicId = async (userPublicId) => {
    log.debug('identityModel.getUserWithPublicId')
    const userRecord = await knex(userTableName)
      .returning(['id'])
      .where('public_id', '=', userPublicId)
    log.debug(userRecord)
    const userId = userRecord.length > 0 ? userRecord[0].id : null
    return await getUserRoles(userId)
  }

  const grantRoles = async (userId, roles) => {
    log.debug('identityModel.grantRoles')
    const roleIdsToGrant = roles.map(
      (roleCode) => fastify.lookups.codeLookup('userRole', roleCode).id
    )
    roleIdsToGrant.forEach(async (roleId) => {
      await knex('user_roles')
        .insert({ user_id: userId, role_id: roleId })
        .onConflict()
        .ignore()
    })
    return true
  }

  const agreeToTerms = async (publicId) => {
    log.debug('identityModel.agreeToTerms')
    const now = new Date()
    await knex(userTableName).where('public_id', '=', publicId).update({
      terms_accepted_at: now,
      updated_at: now,
    })
    return true
  }

  const agreeToCookies = async (publicId) => {
    log.debug('identityModel.agreeToCookies')
    const now = new Date()
    await knex(userTableName).where('public_id', '=', publicId).update({
      cookies_accepted_at: now,
      updated_at: now,
    })
    return true
  }

  const agreeToEmailComms = async (publicId) => {
    log.debug('identityModel.agreeToEmailComms')
    const now = new Date()
    await knex(userTableName).where('public_id', '=', publicId).update({
      email_comms_accepted_at: now,
      updated_at: now,
    })
    return true
  }

  const updateUser = async (userKey, changes) => {
    log.debug('identityModel.updateUser')
    const now = new Date()
    const userBefore = await getUser(userKey)
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
    const result = await knex(userTableName)
      .where('public_id', '=', userKey)
      .update(userAfter, ['id'])

    const userId = result[0].id

    // if (changes.agreeToTerms) {
    if (true) {
      await grantRoles(userId, ['member'])
    }

    return await __getUserRecord(userId)
  }

  const findSessionToken = async (userPublicId) => {
    log.debug('identityModel.findSessionToken')
    const result = await knex('user_sessions')
      .select('auth_token')
      .where('user_public_id', '=', userPublicId)

    return result.length ? result[0].auth_token : null
  }

  const setSessionToken = async (userPublicId, sessionToken) => {
    log.debug('identityModel.setSessionToken')
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
    getUserContext,
    findUserOnPlatform,
    findUserFromSocialProfile,
    registerUser,
    getUserRoles,
    getUserRolesWithPublicId,
    grantRoles,
    becomeMember,
    becomeAuthor,
    agreeToTerms,
    agreeToCookies,
    agreeToEmailComms,
    updateUser,
    findSessionToken,
    setSessionToken,
  }
}
