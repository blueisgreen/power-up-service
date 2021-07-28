
/**
 * Looks for user based on auth provider info. Returns public ID.
 */
const findUser = async (fastify, providerPlatform, socialId) => {
  const { knex, log } = fastify

  const platformId = await knex('system_codes')
    .select('id')
    .where({ public_id: providerPlatform })
  if (!platformId) {
    throw 'Unsupported social platform'
  } else {
    log.info(`rows: ${platformId.length}`)
    log.info(`Social Platform ID: ${platformId[0].id}`)
  }

  let result = await knex('social_profiles')
    .select('user_id')
    .where({ social_id: socialId })
    .andWhere('social_platform_id', '=', platformId[0].id)

  if (result.length === 0) {
    result = await knex('users').insert()
  }

  return result[0].user_id
}

const getUser = async (fastify, publicId) => {
  const { knex, log } = fastify
  const userRecord = await knex('users').select().where('public_id', '=', publicId)
  return userRecord.length > 0 ? userRecord[0] : null
}

// social profile includes: socialId, name, alias, email, avatarUrl
const registerUser = async (fastify, providerPlatform, socialProfile) => {
  const { knex, log } = fastify

  // make sure auth provider is known
  const platformRecord = await knex('system_codes')
    .select('id')
    .where({ public_id: providerPlatform })
  if (!platformId) {
    throw 'Unsupported social platform'
  }
  log.info(`rows: ${platformRecord.length}`)
  log.info(`Social Platform ID: ${platformRecord[0].id}`)
  const platformId = platformRecord[0].id

  // create user record
  const userRecord = await knex('users')
    .insert({
      'screen_name': socialProfile.name,
      'email': socialProfile.email,
      'avatar_url': socialProfile.avatar_url
    },
    ['public_id']) // return value to use in next query
  const userPublicId = userRecord[0].public_id

  // create social record
  const socialRecord = await knex('social_profile')
    .insert({
      user_id: userRecord[0].public_id,
      social_id: socialProfile.id,
      social_platform_id: platformId,
      social_user_info: socialProfile,
    })
  
  // return user with guest permissions
  return getUser(fastify, userPublicId)
}

module.exports = {
  findUser,
}
