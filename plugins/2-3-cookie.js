const fp = require('fastify-plugin')
const cookiePlugin = require('@fastify/cookie')

module.exports = fp(async function (fastify, opts) {
  const { log } = fastify

  log.info('loading fastify-cookie')

  fastify.register(cookiePlugin, {
    secret: 'chocolateChip', // for cookies signature
    parseOptions: {}, // options for parsing cookies
  })

  let expDate = new Date()
  expDate.setDate(expDate.getDate() + 30)

  fastify.decorate('secretCookieOptions', {
    path: '/',
    sameSite: 'Strict',
    httpOnly: true,
    expires: expDate,
  })
  fastify.decorate('uiCookieOptions', {
    path: '/',
    sameSite: 'Strict',
    expires: expDate,
  })
})
