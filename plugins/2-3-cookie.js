const fp = require('fastify-plugin')
const cookiePlugin = require('fastify-cookie')

module.exports = fp(async function (fastify, opts) {
  fastify.log.info('loading fastify-cookie')

  fastify.register(cookiePlugin, {
    secret: 'chocolateChip', // for cookies signature
    parseOptions: {}, // options for parsing cookies
  })

  fastify.get('/cookie', (req, reply) => {
    // const aCookieValue = req.cookies.cookieName
    // const bCookie = req.unsignCookie(req.cookies.cookieSigned)
    reply
      .setCookie('session-key', 'blargy$pants123', {
        domain: 'powerupmagazine.com',
        path: '/',
      })
      .send({ hello: 'world. eat a cookie.' })
  })
})


