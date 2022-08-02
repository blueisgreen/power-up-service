const fp = require('fastify-plugin')
const swagger = require('@fastify/swagger')

module.exports = fp(function (fastify, opts, next) {
  fastify.log.debug('Loading swagger plugin')
  fastify.register(swagger, {
    routePrefix: '/spec',
    swagger: {
      info: {
        title: 'Power Up Magazine service API',
        description: 'Service to support Power Up Magazine.',
        version: process.env.API_VERSION,
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here',
      },
      host: process.env.API_DOC_HOST,
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
    },
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next()
      },
      preHandler: function (request, reply, next) {
        next()
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    exposeRoute: true,
  })

  next()
})
