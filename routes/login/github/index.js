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

    let goTo = 'home'

    // user not found; set up new user
    if (!user) {
      const publicId = uuidv4()
      user = await fastify.data.identity.registerUser(
        'github',
        authToken.access_token,
        userInfo.data,
        publicId,
        authToken.expires_in
      )
      goTo = 'register'
    }

    // record login activity - capture user browser context
    const browserContext = `${request.headers['user-agent']} | ${request.headers['referer']}`
    const actionResponse = await fastify.data.action.capture(
      'login',
      browserContext,
      user.public_id
    )

    // refresh token
    const roles = await fastify.data.identity.getUserRoles(user.id)
    const token = fastify.jwt.sign({
      user: {
        who: user.public_id,
        alias: user.alias,
        roles,
      },
    })
    await fastify.data.identity.setSessionToken(user.public_id, token)
    reply.setCookie('token', token, fastify.secretCookieOptions)
    reply.redirect(`${process.env.SPA_LANDING_URL}?goTo=${goTo}&token=${token}`)
  })
}
