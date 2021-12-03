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

// social profile includes: socialId, name, alias, email, avatarUrl
const registerUser = async (
  fastify,
  providerCode,
  accessToken,
  socialProfile,
  userId
) => {
  const { knex } = fastify

  const authProviderId = await getAuthProviderId(fastify, providerCode)

  const userRecord = await knex('users').returning(userReturnColumns).insert({
    public_id: userId,
    alias: socialProfile.name,
    email: socialProfile.email,
    avatar_url: socialProfile.avatar_url,
  })

  fastify.log.info('user record ==V')
  fastify.log.info(JSON.stringify(userRecord[0]))

  const socialRecord = await knex('social_profiles').insert({
    user_id: userRecord[0].id,
    social_id: socialProfile.id,
    social_platform_id: authProviderId,
    access_token: accessToken,
    social_user_info: socialProfile,
  })

  return getUser(fastify, userId)
}

const getUserRoles = async (fastify, userId) => {
  const { knex } = fastify
  const roleRecords = await knex('system_codes')
    .select('system_codes.code')
    .join('user_roles', 'user_roles.role_id', '=', 'system_codes.id')
    .where({ user_id: userId })
  const roles = roleRecords.map((record) => record.public_id)
  return roles
}

// TODO: load role map (and other system tables) when registering db plug-ins

const grantRoles = async (fastify, userId, roles) => {
  const { knex } = fastify
  const roleMap = await knex('system_codes as a')
    .join('system_codes as b', 'a.parent_id', '=', 'b.id')
    .where('b.code', '=', 'role')
    .select('a.*')
  console.log(roleMap)
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

const agreeToTerms = async (fastify, publicId) => {
  const { knex } = fastify
  const now = new Date()
  await knex('users').where('public_id', '=', publicId).update({
    terms_accepted_at: now,
    updated_at: now,
  })
  return true
}

const agreeToCookies = async (fastify, publicId) => {
  const { knex } = fastify
  const now = new Date()
  await knex('users').where('public_id', '=', publicId).update({
    cookies_accepted_at: now,
    updated_at: now,
  })
  return true
}

const agreeToEmailComms = async (fastify, publicId) => {
  const { knex } = fastify
  const now = new Date()
  await knex('users').where('public_id', '=', publicId).update({
    email_comms_accepted_at: now,
    updated_at: now,
  })
  return true
}

// FIXME:
const updateUser = async (fastify, userPublicId, changes) => {
  const { knex } = fastify
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

  // TODO assign member role if terms accepted and not already assigned
  if (changes.agreeToTerms) {
    await grantRoles(fastify, userId, ['member'])
  }

  return await getUserById(fastify, userId)
}

const setSessionToken = async (fastify, userPublicId, sessionToken) => {
  const { knex } = fastify
  const now = new Date()
  await knex('user_sessions')
    .insert({
      user_public_id: userPublicId,
      auth_token: sessionToken,
    })
    .onConflict('user_public_id')
    .merge()
}

const findSessionToken = async (fastify, userPublicId) => {
  return await fastify
    .knex('user_sessions')
    .select('auth_token')
    .where('user_public_id', '=', userPublicId)
}

/**
 * TODO: Set and return account status - match on id but return code
 */

module.exports = {
  registerUser,
  getUserRoles,
  grantRoles,
  agreeToTerms,
  agreeToCookies,
  agreeToEmailComms,
  updateUser,
  setSessionToken,
  findSessionToken,
}
