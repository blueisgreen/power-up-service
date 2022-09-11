const fp = require('fastify-plugin')

module.exports = fp(
  async function (fastify, options, next) {
    const { log } = fastify

    /**
     * Create session token
     */
    const forgeToken = (userKey, alias, roles) => {
      return fastify.jwt.sign({
        user: {
          who: userKey,
          alias: alias,
          roles,
        },
      })
    }

    const handleLoginReply = async (reply, userKey, alias, roles, goTo) => {
      const token = fastify.auth.forgeToken(userKey, alias, roles)
      await fastify.data.identity.setSessionToken(user.userKey, token)
      reply.setCookie('token', token, fastify.secretCookieOptions)
      reply.redirect(
        `${process.env.SPA_LANDING_URL}?goTo=${goTo}&token=${token}`
      )
    }

    /**
     * Common logic to complete login using identity provider
     */
    const finishLogin = async (reply, fromAuthProvider) => {
      const uuidv4 = require('uuid').v4
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
      log.debug(JSON.stringify(user))

      // refresh token
      await fastify.auth.handleLoginReply(
        reply,
        userKey,
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

    fastify.decorate('forgeToken', forgeToken)
    fastify.decorate('finishLogin', finishLogin)
    fastify.decorate('handleLoginReply', handleLoginReply)

    fastify.decorate('auth', {
      preValidation,
    })
    next()
  },
  {
    fastify: '4.x',
    name: 'powerup-decorators',
  }
)
