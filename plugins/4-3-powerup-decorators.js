const fp = require('fastify-plugin')

module.exports = fp(
  async function (fastify, options, next) {
    const { log } = fastify
    log.debug('loading useful decorators')
    fastify.decorateRequest('anonymous', true)
    fastify.decorateRequest('userContext', null)

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

    fastify.decorate('preValidation', async (request, reply) => {
      log.debug('require known user')
      if (request.anonymous) {
        reply.code(401)
        reply.send('You must be signed in for that.')
      }
    })
  },
  {
    fastify: '4.x',
    name: 'powerup-decorators',
  }
)
