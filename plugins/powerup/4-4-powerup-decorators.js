const fp = require('fastify-plugin')

module.exports = fp(
  async function (fastify, options, next) {
    const { log } = fastify
    log.debug('loading powerup decorators')
    fastify.decorateRequest('anonymous', true)
    fastify.decorateRequest('userContext', null)

    // somehow decorate and call from there; makes room in onRequest for series of calls
    fastify.addHook('onRequest', async (request, reply) => {
      try {
        await request.jwtVerify()
        log.debug('found session token:' + JSON.stringify(request.user))
        request.anonymous = false
        const { who } = request.user.user
        request.userContext = await fastify.data.identity.getUserContext(who)
        log.debug('user context: ' + JSON.stringify(request.userContext))
      } catch (err) {
        if (err.message.startsWith('No Authorization was found')) {
          log.debug('anonymous user')
        } else {
          log.error(err)
        }
      }
    })

    // TODO: rethink tracking based on how cookies are (not) working
    // record login activity - capture user browser context
    // const browserContext = `${request.headers['user-agent']} | ${request.headers['referer']}`
    // fastify.data.action.capture(
    //   'login',
    //   request.tracker,
    //   user.userKey,
    //   browserContext
    // )

    next()
  },
  {
    fastify: '4.x',
    name: 'powerup-decorators',
  }
)
