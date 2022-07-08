const {
  userTableName,
  userColumns,
  authorTableName,
  authorColumns,
} = require('./modelFieldMap')

// TODO: verify that userPublicId parameter is uuid or wrap query in try-catch and handle

module.exports = (fastify) => {
  const { knex, log } = fastify

  const getUser = async (userId) => {
    log.debug('identity plugin: getUser')
    const userRecord = await knex(userTableName)
      .select(userColumns)
      .where('id', '=', userId)
    return userRecord.length > 0 ? userRecord[0] : null
  }

  const getUserContext = async (userPublicId) => {
    log.debug('identity plugin: getUserContext')
    const context = {
      userKey: userPublicId,
      userId: 0,
      userStatus: '',
      roles: {},
    }
    const user = await getUserWithPublicId(userPublicId)
    context.userId = user.id
    if (user.accountStatusId) {
      context.userStatus = fastify.lookups.idToCode(user.accountStatusId)
    }
    const roles = await getUserRolesWithPublicId(userPublicId)
    roles.forEach((role) => (context.roles[role] = true))
    if (context.roles.author) {
      const authorInfo = await getAuthorInfo(user.id)
      context.authorStatus = authorInfo.status
    }
    return context
  }

  const getUserWithPublicId = async (userPublicId) => {
    log.debug('identity plugin: getUserWithPublicId')
    const userRecord = await knex(userTableName)
      .select(userColumns)
      .where('public_id', '=', userPublicId)
    return userRecord.length > 0 ? userRecord[0] : null
  }

  const findUserWithPublicId = async (userKey, platform) => {
    log.debug(
      `identity plugin: findUserWithPublicId using userKey ${userKey} on platform ${platform}`
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

    return getUser(profileRecord[0].userId)
  }

  const findUserFromSocialProfile = async (platform, profileId) => {
    log.debug('identity plugin: findUserFromSocialProfile')

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

    return getUser(profileRecord[0].userId)
  }

  const registerUser = async (
    platform,
    accessToken,
    socialProfile,
    userPublicId,
    accessTokenExpiresIn = 0
  ) => {
    log.debug('identity plugin: registerUser')

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

    return getUser(id)
  }

  const becomeMember = async (userPublicId, alias, okToTerms, okToCookies) => {
    log.debug(`identity plugin: becomeMember ${userPublicId}, ${alias}`)
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
      .where('public_id', '=', userPublicId)
      .update(membership)
    const userInfo = result[0]
    if (okToTerms) {
      await grantRoles(userInfo.id, ['member'])
      const roles = getUserRoles(userInfo.id)
      userInfo.roles = roles
    }
    return userInfo
  }

  const becomeAuthor = async (userPublicId) => {
    log.debug('identity plugin: becomeAuthor')
    const userRecord = await getUserWithPublicId(userPublicId)
    const authorRecord = await knex(authorTableName)
      .returning(authorColumns)
      .insert({
        user_id: userRecord.id,
        pen_name: userRecord.alias,
        status: 'untrusted',
      })
    await grantRoles(userRecord.id, ['author'])
    const roles = getUserRoles(userRecord.id)
    userRecord.author = authorRecord
    userRecord.roles = roles
    return userRecord
  }

  // TODO: figure out strategy for return user info, including for roles
  const getAuthorInfo = async (userId) => {
    const authorRecord = await knex(authorTableName)
      .select(authorColumns)
      .where('user_id', userId)
    return authorRecord[0]
  }

  const getUserRoles = async (userId) => {
    log.debug('identity plugin: getUserRoles')
    const roleRecords = await knex('system_codes')
      .select('system_codes.code')
      .join('user_roles', 'user_roles.role_id', '=', 'system_codes.id')
      .where({ user_id: userId })
    const roles = roleRecords.map((record) => record.code)
    log.debug(`roles ${roles}`)
    return roles
  }

  const getUserRolesWithPublicId = async (userPublicId) => {
    log.debug('identity plugin: getUserWithPublicId')
    const userRecord = await knex(userTableName)
      .returning(['id'])
      .where('public_id', '=', userPublicId)
    log.debug(userRecord)
    const userId = userRecord.length > 0 ? userRecord[0].id : null
    return await getUserRoles(userId)
  }

  const grantRoles = async (userId, roles) => {
    log.debug('identity plugin: grantRoles')
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
    log.debug('identity plugin: agreeToTerms')
    const now = new Date()
    await knex(userTableName).where('public_id', '=', publicId).update({
      terms_accepted_at: now,
      updated_at: now,
    })
    return true
  }

  const agreeToCookies = async (publicId) => {
    log.debug('identity plugin: agreeToCookies')
    const now = new Date()
    await knex(userTableName).where('public_id', '=', publicId).update({
      cookies_accepted_at: now,
      updated_at: now,
    })
    return true
  }

  const agreeToEmailComms = async (publicId) => {
    log.debug('identity plugin: agreeToEmailComms')
    const now = new Date()
    await knex(userTableName).where('public_id', '=', publicId).update({
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
    const result = await knex(userTableName)
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

    return result.length ? result[0].auth_token : null
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
    getUserContext,
    getUserWithPublicId,
    findUserWithPublicId,
    findUserFromSocialProfile,
    registerUser,
    getUserRoles,
    getUserRolesWithPublicId,
    grantRoles,
    becomeMember,
    becomeAuthor,
    getAuthorInfo,
    agreeToTerms,
    agreeToCookies,
    agreeToEmailComms,
    updateUser,
    findSessionToken,
    setSessionToken,
  }
}
