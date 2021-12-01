'use strict'
const identity = require('../../../db/access/identity')

module.exports = async function (fastify, opts) {
  fastify.get('/callback', async function (request, reply) {
    const authToken =
      await this.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
    fastify.log.info(authToken.access_token)

    // try to get user info from GitHub
    const userInfo = await fastify.axios.request({
      url: 'https://api.github.com/user',
      method: 'get',
      headers: {
        Authorization: `token ${authToken.access_token}`,
      },
    })
    fastify.log.info(JSON.stringify(userInfo.data))

    // find or register user using authentication data
    let user = await identity.findUser(fastify, 'github', userInfo.data.id)

    // was anonymous but user was found; no longer anonymous
    if (request.anonymous && user) {
      request.anonymous = false
      request.userId = user.public_id
      reply.setCookie('who', user.public_id, fastify.cookieOptions)
    }

    // user not found; set up new user
    if (!user) {
      user = await identity.registerUser(
        fastify,
        'github',
        token.access_token,
        userInfo.data,
        request.userId
      )
      // no longer anonymous
      request.anonymous = false
      reply.setCookie('who', request.userId, fastify.cookieOptions)
    }

    fastify.log.info(`found user: ${JSON.stringify(user)}`)

    // TODO: check age of token and refresh if too old; use something like next line
    // const newToken = await this.getNewAccessTokenUsingRefreshToken(token.refresh_token)

    const roles = await identity.getUserRoles(fastify, user.id)

    let goTo = 'home'
    if (!roles.find((item) => item === 'member')) {
      goTo = 'register'
    }

    // create jwt and return (forward? redirect?)
    const token = fastify.jwt.sign({
      user: {
        who: user.public_id,
        alias: user.alias,
        roles,
      },
    })
    identity.setSessionToken(fastify, user.id, token)
    reply.setCookie('who', user.public_id, fastify.cookieOptions)
    reply.setCookie('token', token, fastify.cookieOptions)
    reply.header('Authorization', `Bearer ${token}`)
    reply.redirect(`${process.env.SPA_LANDING_URL}?token=${token}&goTo=${goTo}`)
  })
}
