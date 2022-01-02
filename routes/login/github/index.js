'use strict'

module.exports = async function (fastify, opts) {
  const { log } = fastify
  const uuidv4 = require('uuid').v4

  fastify.get('/callback', async function (request, reply) {
    const authToken =
      await this.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
    log.debug(authToken.access_token)

    // try to get user info from GitHub
    const userInfo = await fastify.axios.request({
      url: 'https://api.github.com/user',
      method: 'get',
      headers: {
        Authorization: `token ${authToken.access_token}`,
      },
    })
    log.debug(JSON.stringify(userInfo.data))

    // find or register user using authentication data
    let user = await fastify.data.identity.findUserFromSocialProfile(
      'github',
      userInfo.data.id
    )

    // was anonymous but user was found; no longer anonymous
    if (request.anonymous && user) {
      request.anonymous = false
      request.userId = user.userKey
      reply.setCookie('who', request.userId, fastify.uiCookieOptions)
    }

    // user not found; set up new user
    if (!user) {
      const publicId = uuidv4()
      user = await fastify.data.identity.registerUser(
        'github',
        authToken.access_token,
        userInfo.data,
        publicId
      )
      // no longer anonymous
      request.anonymous = false
      reply.setCookie('who', user.userKey, fastify.uiCookieOptions)
    }

    log.debug(`user: ${JSON.stringify(user)}`)

    // TODO: check age of token and refresh if too old; use something like next line
    // const newToken = await this.getNewAccessTokenUsingRefreshToken(token.refresh_token)

    const roles = await fastify.data.identity.getUserRoles(user.id)

    log.debug('figure out where to return')

    let goTo = 'home'
    if (roles.length === 0 || !roles.find((item) => item === 'member')) {
      log.debug('user needs to register to complete membership')
      goTo = 'register'
    }

    const token = fastify.jwt.sign({
      user: {
        who: user.userKey,
        alias: user.alias,
        roles,
      },
    })
    await fastify.data.identity.setSessionToken(user.userKey, token)

    // send things back to client
    reply.setCookie('who', user.userKey, fastify.uiCookieOptions)
    reply.setCookie('token', token, fastify.secretCookieOptions)
    reply.header('Authorization', `Bearer ${token}`)
    reply.redirect(`${process.env.SPA_LANDING_URL}?goTo=${goTo}&token=${token}`)
  })
}
