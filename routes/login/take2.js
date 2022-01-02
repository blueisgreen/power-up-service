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
    // let token = user.public_id
    //   ? await fastify.data.identity.findSessionToken(user.public_id)
    //   : null

    // nope, create one
    // if (!token) {
    const roles = ['member', 'author', 'editor', 'admin']
    const token = fastify.jwt.sign({
      user: {
        who: user.public_id,
        alias: user.alias,
        roles,
      },
    })
    await fastify.data.identity.setSessionToken(user.public_id, token)
    reply.setCookie('token', token, fastify.uiCookieOptions)
    // }

    reply.header('Authorization', `Bearer ${token}`)
    reply.redirect(`${process.env.SPA_LANDING_URL}?goTo=home&token=${token}`)
  })
}
