'use strict'

const GOTO_HOME = 'home'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    const { log } = fastify
    const pid = request.query.pid

    if (request.anonymous || pid !== 'bypass') {
      reply.code(401)
      reply.send("I hear you knocking, but you can't come in.")
      return
    }

    // look up user based on cookie
    const user = await fastify.data.identity.findUserWithPublicId(
      request.userKey,
      pid
    )

    if (!user) {
      reply.code(401)
      reply.send('Who are you?')
      return
    }

    log.debug(`found user ${JSON.stringify(user)}`)

    // do i have a session token?
    let token = await fastify.data.identity.findSessionToken(user.userKey)

    // nope, create one
    if (!token) {
      token = fastify.jwt.sign({
        user: {
          who: user.userKey,
          alias: user.alias,
          roles,
        },
      })
      await fastify.data.identity.setSessionToken(user.userKey, token)
    }

    reply.header('Authorization', `Bearer ${token}`)
    reply.redirect(`${process.env.SPA_LANDING_URL}?goTo=home&token=${token}`)
  })
}
