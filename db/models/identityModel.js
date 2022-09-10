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
const userOnlyColumns = [
  'id',
  'public_id as userKey',
  'alias',
  'email',
  'avatar_url as avatarUrl',
  'created_at as createdAt',
  'updated_at as updatedAt',
  'terms_accepted_at as termsAcceptedAt',
  'cookies_accepted_at as cookiesAcceptedAt',
  'email_comms_accepted_at as emailCommsAcceptedAt',
]
const userContextColumns = [
  'users.id',
  'public_id as userKey',
  'alias',
  'system_codes.code as accountStatus',
  'pen_name as penName',
  'authors.status as authorStatus',
]

// TODO: validation: verify that userPublicId parameter is uuid or wrap query in try-catch and handle

module.exports = (fastify) => {
  const { knex, log } = fastify

  const __getUserRecord = async (userId) => {
    log.debug('__getUserRecord with ID ' + userId)
    const userRecord = await knex(userTableName)
      .select(userOnlyColumns)
      .where('users.id', '=', userId)
    // .join('system_codes', { 'users.account_status_id': 'system_codes.id' })
    log.debug('user: ' + JSON.stringify(userRecord[0]))
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

    log.debug('context: ' + JSON.stringify(result[0]))
    const userContext = Object.assign({}, result[0])
    log.debug('userContext: ' + userContext)

    const roles = await getUserRoles(userContext.id)
    userContext['hasRole'] = {}
    roles.map((role) => (userContext.hasRole[role] = true))

    return userContext
  }

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

  const findSessionToken = async (userPublicId) => {
    log.debug('identityModel.findSessionToken')
    const result = await knex('user_sessions')
      .select('auth_token')
      .where('user_public_id', '=', userPublicId)

    return result.length ? result[0].auth_token : null
  }

  const setSessionToken = async (userKey, sessionToken) => {
    log.debug('identityModel.setSessionToken')
    await knex('user_sessions')
      .insert({
        user_public_id: userKey,
        auth_token: sessionToken,
      })
      .onConflict('user_public_id')
      .merge()
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

  const registerUser = async (
    platform,
    accessToken,
    socialProfile,
    userPublicId,
    accessTokenExpiresIn = 0
  ) => {
    log.debug('identityModel.registerUser')

    // TODO: use transaction - all or nothing
    
    const platformId = fastify.lookups.codeLookup('socialPlatform', platform).id
    const result = await knex(userTableName)
      .returning(userOnlyColumns)
      .insert({
        public_id: userPublicId,
        alias: socialProfile.name,
        email: socialProfile.email,
        avatar_url: socialProfile.avatar_url || socialProfile.picture,
      })
    const user = result[0]
    await knex('social_profiles').insert({
      user_id: user.id,
      social_id: socialProfile.id || socialProfile.sub,
      social_platform_id: platformId,
      access_token: accessToken,
      social_user_info: socialProfile,
      access_token_exp: accessTokenExpiresIn,
    })
    return user
  }

  /**
   * Updates user information.
   *
   * @param {string} userKey unique public user identifier
   * @param {string} alias how the user wants to be known
   * @param {boolean} acceptTerms pass when user is accepting terms; ignored if not true or already accepted
   * @param {boolean} acceptCookies pass to indicate user accepting the use (or not) of cookies
   * @param {boolean} acceptEmailComms pass to indicate user accepting the receipt (or not) of email communications
   * @returns UserInfo
   */
  const updateUser = async (userKey, alias, accountStatus) => {
    log.debug('identityModel.updateUser')
    const now = new Date()
    const changes = {
      alias,
      account_status: accountStatus,
      updated_at: now,
    }
    const result = await knex(userTableName)
      .where('public_id', '=', userKey)
      .update(changes, ['id'])

    log.debug(JSON.stringify(result[0]))
    const userId = result[0].id
    return await __getUserRecord(userId)
  }

  const agreeToTerms = async (userKey) => {
    log.debug('identityModel.agreeToTerms')
    const now = new Date()
    await knex(userTableName).where('public_id', '=', userKey).update({
      terms_accepted_at: now,
      updated_at: now,
    })
    // TODO: verify that role only added once despite multiple calls
    await grantRoles(userId, ['member'])
    return true
  }

  const agreeToCookies = async (userKey) => {
    log.debug('identityModel.agreeToCookies')
    const now = new Date()
    await knex(userTableName).where('public_id', '=', userKey).update({
      cookies_accepted_at: now,
      updated_at: now,
    })
    return true
  }

  const agreeToEmailComms = async (userKey) => {
    log.debug('identityModel.agreeToEmailComms')
    const now = new Date()
    await knex(userTableName).where('public_id', '=', userKey).update({
      email_comms_accepted_at: now,
      updated_at: now,
    })
    return true
  }

  return {
    getUser,
    getUserContext,
    findUserOnPlatform,
    findUserFromSocialProfile,
    findSessionToken,
    setSessionToken,
    getUserRoles,
    getUserRolesWithPublicId,
    grantRoles,
    registerUser,
    updateUser,
    agreeToTerms,
    agreeToCookies,
    agreeToEmailComms,
  }
}
