'use strict'
const identity = require('../../../db/access/identity')
const uuidv4 = require('uuid').v4

module.exports = async function (fastify, opts) {
  const { log } = fastify

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
      request.userId = user.public_id
      reply.setCookie('who', user.public_id, fastify.cookieOptions)
    }

    // user not found; set up new user
    if (!user) {
      const publicId = uuidv4()
      user = await identity.registerUser(
        fastify,
        'github',
        authToken.access_token,
        userInfo.data,
        publicId
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

    const token = fastify.jwt.sign({
      user: {
        who: user.public_id,
        alias: user.alias,
        roles,
      },
    })
    await fastify.data.identity.setSessionToken(user.public_id, token)

    // send things back to client
    reply.setCookie('who', user.public_id, fastify.cookieOptions)
    reply.setCookie('token', token, fastify.cookieOptions)
    reply.header('Authorization', `Bearer ${token}`)
    reply.redirect(`${process.env.SPA_LANDING_URL}?token=${token}&goTo=${goTo}`)
  })
}
