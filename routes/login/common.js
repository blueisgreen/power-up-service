export const finishLogin = (fastify, response) => {
  fastify.log.debug('do some common stuff')
  return 'blah'
}

export const updateToken = (fastify, payload) => {
  /*
      const token = fastify.jwt.sign({
        user: {
          who: '596b3081-6073-476c-bc9d-d9273ba70f0e',
          alias: 'Big Faker',
          roles: ['butcher', 'baker', 'candlestick maker'],
        },
      })
      reply.setCookie('token', token, fastify.secretCookieOptions)
*/
}
