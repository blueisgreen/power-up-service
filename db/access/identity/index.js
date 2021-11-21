const getAuthProviderId = async (fastify, providerCode) => {
  const { knex } = fastify
  const platformRecord = await knex('system_codes')
    .select('id')
    .where({ public_id: providerCode })
  if (platformRecord.length < 1) {
    throw 'Unsupported social platform'
  }
  return platformRecord[0].id
}

/**
 * Looks for user based on auth provider info. Returns public ID.
 */
const findUser = async (fastify, providerCode, socialId) => {
  const { knex, log } = fastify

  const authProviderId = await getAuthProviderId(fastify, providerCode)

  let profileRecord = await knex('social_profiles')
    .select('user_id')
    .where({ social_id: socialId })
    .andWhere('social_platform_id', '=', authProviderId)

  if (profileRecord.length < 1) {
    return null
  }

  return getUser(fastify, profileRecord[0].user_id)
}

const getUser = async (fastify, publicId) => {
  const { knex } = fastify
  const userRecord = await knex('users')
    .select()
    .where('public_id', '=', publicId)
  return userRecord.length > 0 ? userRecord[0] : null
}

// social profile includes: socialId, name, alias, email, avatarUrl
const registerUser = async (
  fastify,
  providerCode,
  accessToken,
  socialProfile,
  userId,
) => {
  const { knex } = fastify

  const authProviderId = await getAuthProviderId(fastify, providerCode)

  // create user record
  // FIXME put this in cookie plugin
  const userPublicId = userId.startsWith('jd-') ? userId.substr(3) : userId

  const userRecord = await knex('users').insert(
    {
      public_id: userPublicId,
      screen_name: socialProfile.name,
      email: socialProfile.email,
      avatar_url: socialProfile.avatar_url,
    }
  )

  // create social record
  const socialRecord = await knex('social_profiles').insert({
    user_id: userPublicId,
    social_id: socialProfile.id,
    social_platform_id: authProviderId,
    access_token: accessToken,
    social_user_info: socialProfile,
  })

  // return user with guest permissions
  return getUser(fastify, userPublicId)
}

const getUserRoles = async (fastify, userId) => {
  const { knex } = fastify
  const roleRecords = await knex('system_codes')
    .select('system_codes.public_id')
    .join('user_roles', 'user_roles.role_id', '=', 'system_codes.id')
    .where({ user_id: userId })
  const roles = roleRecords.map((record) => record.public_id)
  return roles
}

// TODO load role map (and other system tables) when registering db plug-ins

const grantRoles = async (fastify, userPublicId, roles) => {
  const { knex } = fastify
  const roleMap = await knex('system_codes as a')
    .join('system_codes as b', 'a.parent_id', '=', 'b.id')
    .where('b.public_id', '=', 'role')
    .select('a.*')
  console.log(roleMap)
  const roleIdsToGrant = roles.map((role) => {
    const roleToUse = roleMap.find((element) => element.public_id === role)
    return roleToUse.id
  })
  const userId = await knex('users')
    .where('public_id', '=', userPublicId)
    .select('id')

  roleIdsToGrant.forEach(async (roleId) => {
    await knex('user_roles')
      .insert({ user_id: userId[0].id, role_id: roleId })
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

// FIXME
const updateUser = async (fastify, userPublicId, changes) => {
  const { knex } = fastify
  const now = new Date()
  const userBefore = await getUser(fastify, userPublicId)
  const userAfter = Object.assign({}, userBefore, {
    screen_name: changes.screenName,
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
  await knex('users').where('public_id', '=', userPublicId).update(userAfter)

  // TODO assign member role if terms accepted and not already assigned
  if (changes.agreeToTerms) {
    await grantRoles(fastify, userPublicId, ['member'])
  }

  return await getUser(fastify, userPublicId)
}

const setSessionToken = async (fastify, userId, sessionToken) => {
  const { knex } = fastify
  const now = new Date()
  await knex('users').where('id', '=', userId).update({
    session_token: sessionToken,
    updated_at: now,
  })
}

module.exports = {
  findUser,
  getUser,
  registerUser,
  getUserRoles,
  grantRoles,
  agreeToTerms,
  agreeToCookies,
  agreeToEmailComms,
  updateUser,
  setSessionToken,
}
