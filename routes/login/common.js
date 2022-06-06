// TODO: move common logic here to avoid duplication in callback funtions

export const finishLogin = (fastify, response) => {
  const browserContext = `${request.headers['user-agent']} | ${request.headers['referer']}`
  fastify.data.action.capture(
    'login',
    request.tracker,
    request.userKey,
    browserContext
  )

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
