'use strict'

const fp = require('fastify-plugin')

module.exports = fp(function (fastify, opts, next) {
  fastify.log.info('Loading swagger plugin')
  fastify.register(require('@fastify/swagger'), {
    routePrefix: '/spec',
    swagger: {
      info: {
        title: 'Power Up Magazine service API',
        description: 'Service to support Power Up Magazine.',
        version: '0.6.0',
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
