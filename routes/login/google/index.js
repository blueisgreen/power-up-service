'use strict'

module.exports = async function (fastify, opts) {
  const { log } = fastify
  const uuidv4 = require('uuid').v4

  fastify.get('/callback', async function (request, reply) {
    const authToken =
      await this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
    log.debug(authToken.access_token)

    // FIXME: look at example from Google
    // try to get user info from Google
    const userInfo = await fastify.axios.request({
      url: 'https://openidconnect.googleapis.com/v1/userinfo',
      method: 'get',
      headers: {
        Authorization: `Bearer ${authToken.access_token}`,
      },
      json: true,
    })
    log.debug(userInfo)

    // find or register user using authentication data
    let user = null
    // let user = await fastify.data.identity.findUserFromSocialProfile(
    //   'google',
    //   userInfo.data.id
    // )

    let goTo = 'home'

    // user not found; set up new user
    if (!user) {
      const publicId = uuidv4()
      user = await fastify.data.identity.registerUser(
        'google',
        authToken.access_token,
        userInfo.data,
        publicId
      )
      goTo = 'register'
    }

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
