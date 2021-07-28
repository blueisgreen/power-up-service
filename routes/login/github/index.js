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
    fastify.log.info(JSON.stringify(userInfo.data))

    // check database for user; add if missing and store profile info, including access_token


    // knex('social_profiles').insert()

    // to refresh token at some point, use
    // const newToken = await this.getNewAccessTokenUsingRefreshToken(token.refresh_token)

    // create jwt and return (forward? redirect?)

    const sessionToken = fastify.jwt.sign({
      user: 'asdfg-qwert-yuiop-hjklm',
      roles: ['member', 'support', 'editor', 'admin']
    })

    reply.header('x-access-blargy', sessionToken)
    reply.redirect(
      `${process.env.SPA_LANDING_URL}?session=${sessionToken}&goTo=home`
    )

  })
}
