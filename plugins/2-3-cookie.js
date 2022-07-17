const fp = require('fastify-plugin')
const cookiePlugin = require('@fastify/cookie')

module.exports = fp(async function (fastify, opts) {
  const { log } = fastify

  log.info('loading fastify-cookie')

  fastify.register(cookiePlugin, {
    secret: 'snickerDoodle', // for cookies signature
    parseOptions: {}, // options for parsing cookies
  })

  const expires = new Date()
  expires.setDate(expires.getDate() + 30)

  const domain = process.env.COOKIE_DOMAIN
  log.debug('===> cookie domain:' + domain)

  const basicOpts = {
    domain,
    path: '/',
    sameSite: 'lax',
    expires,
  }
  const secretOpts = Object.assign({}, basicOpts, {
    httpOnly: true,
  })

  fastify.decorate('uiCookieOptions', basicOpts)
  fastify.decorate('secretCookieOptions', secretOpts)
})
