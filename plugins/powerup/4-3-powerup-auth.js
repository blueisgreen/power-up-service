const fp = require('fastify-plugin')
const uuidv4 = require('uuid').v4

async function powerupAuthPlugin(fastify, options, next) {
  const { log } = fastify
  log.debug('loading power up auth')

  /**
   * Create session token
   */
  const forgeToken = (userKey, alias, roles) => {
    return fastify.jwt.sign({
      user: {
        userKey,
        alias,
        roles,
      },
    })
  }
  // fastify.decorate('forgeToken', forgeToken, ['jwt'])

  const handleLoginReply = async (reply, userKey, alias, roles, goTo) => {
    const token = fastify.auth.forgeToken(userKey, alias, roles)
    await fastify.data.identity.setSessionToken(userKey, token)
    reply.setCookie('token', token, fastify.secretCookieOptions)
    reply.redirect(`${process.env.SPA_LANDING_URL}?goTo=${goTo}&token=${token}`)
  }
  // fastify.decorate('handleLoginReply', handleLoginReply, [
  //   'forgeToken',
  // ])

  /**
   * Common logic to complete login using identity provider
   */
  const finishLogin = async (reply, fromAuthProvider) => {
    const { pid, socialId, accessToken, tokenExpiration, socialUserInfo } =
      fromAuthProvider

    log.debug('login: bring it home')

    // find or register user using authentication data
    let user = await fastify.data.identity.findUserFromSocialProfile(
      pid,
      socialId
    )

    let goTo = 'home'

    // user not found; set up new user
    if (!user) {
      const userKey = uuidv4()
      user = await fastify.data.identity.registerUser(
        pid,
        accessToken,
        socialUserInfo,
        userKey,
        tokenExpiration
      )
      goTo = 'register'
    }

    const roles = await fastify.data.identity.getUserRoles(user.id)
    await fastify.auth.handleLoginReply(
      reply,
      user.userKey,
      user.alias,
      roles,
      goTo
    )
  }

  /**
   * For verifying user is not anonymous
   */
  const preValidation = async (request, reply) => {
    log.debug('require known user')
    if (request.anonymous) {
      reply.code(401)
      reply.send('You must be signed in for that.')
    }
  }
  // TODO: switch references to auth.preValidation to organize auth collection
  fastify.decorate('preValidation', preValidation)

  fastify.decorate('auth', {
    forgeToken,
    handleLoginReply,
    finishLogin,
    preValidation,
  })

  next()
}

module.exports = fp(powerupAuthPlugin, {
  fastify: '4.x',
  name: 'powerup-auth',
})
