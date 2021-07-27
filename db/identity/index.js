export const findUser = async (fastify, providerPlatform, socialId) => {
  const { knex, log } = fastify
  // const socialUserId = knex('social_profiles')
  //   .select('user_id')
  //   .join('system_codes', 'social_profiles.') // system_codes.public_id = 'github' and system_codes.id = social_profiles.social_platform_id
  //   .where({ social_id: ? }, [userInfo.id])

}