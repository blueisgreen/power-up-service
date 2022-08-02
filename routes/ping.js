'use strict'

module.exports = function (fastify, options, next) {
  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['ping'],
      description: 'Endpoint to check if service responds',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      return { status: 'alive', timestamp: new Date().toISOString() }
    },
  })

  next()
}
