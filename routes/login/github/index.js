'use strict'
const identity = require('../../../db/access/identity')

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
      user = await identity.registerUser(
        fastify,
        'github',
        token.access_token,
        userInfo.data
      )
      // goTo = 'register'
    }
    fastify.log.info(`found user ${user}`)

    // to refresh token at some point, use
    // const newToken = await this.getNewAccessTokenUsingRefreshToken(token.refresh_token)
    const roles = await identity.getUserRoles(fastify, user.id)

    if (!roles.find((item) => item === 'member')) {
      goTo = 'register'
    }

    // create jwt and return (forward? redirect?)
    const sessionToken = fastify.jwt.sign({
      user: {
        publicId: user.public_id,
        screenName: user.screen_name,
        roles,
      },
    })

    // TODO store session token
    identity.setSessionToken(fastify, user.id, sessionToken)

    reply.setCookie('sessionToken', sessionToken, {
      domain: 'powerupmagazine.com',
      path: '/',
    })
    reply.redirect(
      `${process.env.SPA_LANDING_URL}?token=${sessionToken}&goTo=${goTo}`
    )
  })
}
