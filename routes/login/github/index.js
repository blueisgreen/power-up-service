'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/callback', async function (request, reply) {
    const token =
      await this.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
    fastify.log.info(token.access_token)

    // try to get user info from GitHub
    const userInfo = await fastify.axios.request({
      url: 'https://api.github.com/user',
      method: 'get',
      headers: {
        Authorization: `token ${token.access_token}`,
      },
    })
    fastify.log.info('found user info')
    fastify.log.info(JSON.stringify(userInfo.data))

    // check database for user; add if missing and store profile info, including access_token

    const { knex } = fastify
    // const socialUserId = knex('social_profiles')
    //   .select('user_id')
    //   .join('system_codes', 'social_profiles.') // system_codes.public_id = 'github' and system_codes.id = social_profiles.social_platform_id
    //   .where({ social_id: ? }, [userInfo.id])

    // knex('social_profiles').insert()

    // to refresh token at some point, use
    // const newToken = await this.getNewAccessTokenUsingRefreshToken(token.refresh_token)

    // create jwt and return (forward? redirect?)

    reply.header('x-access-blargy', token.access_token)
    reply.redirect(
      `http://localhost:8080/calculators?token=${token.access_token}&goTo=home`
    )

  })
}
