'use strict'
const identity = require('../../../db/identity')

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

    // find or register user using authentication data
    let user = await identity.findUser(fastify, 'github', userInfo.data.id)
    let goTo = 'home'
    if (!user) {
      user = await identity.registerUser(fastify, 'github', token.access_token, userInfo.data)
      goTo = 'register'
    }
    fastify.log.info(`found user ${user}`)

    // to refresh token at some point, use
    // const newToken = await this.getNewAccessTokenUsingRefreshToken(token.refresh_token)

    // create jwt and return (forward? redirect?)
    const sessionToken = fastify.jwt.sign({
      user: user.public_id,
      roles: ['guest']
    })

    // TODO store session token

    reply.header('x-access-blargy', sessionToken)
    reply.redirect(
      `${process.env.SPA_LANDING_URL}?session=${sessionToken}&goTo=${goTo}`
    )

  })
}
