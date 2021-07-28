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

  return result[0]
  // const socialUserId = knex('social_profiles')
  //   .select('user_id')
  //   .join('system_codes', 'social_profiles.') // system_codes.public_id = 'github' and system_codes.id = social_profiles.social_platform_id
  //   .where({ social_id: ? }, [userInfo.id])
}

module.exports = {
  findUser,
}
