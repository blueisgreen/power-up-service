const { actionSchema, postActionBody, actionFilters } = require('./schema.js')

module.exports = async function (fastify, opts) {
  const { log } = fastify

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['action'],
      description: 'Search action log',
      query: actionFilters,
      response: {
        200: {
          type: 'array',
          items: actionSchema,
        },
      },
    },
    handler: async (request, reply) => {
      const { start, end, user, action, limit, offset } = request.query
      const queryParams = {
        start,
        end,
        user,
        action,
        limit: limit || 100,
        offset: offset || 0,
      }
      const actions = await fastify.data.action.getActions(queryParams)
      return actions
    },
  })

  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      tags: ['action'],
      description: 'Record an action',
      body: postActionBody,
    },
    handler: async (request, reply) => {
      const { actionCode, details } = request.body
      const userKey = request.anonymous ? null : request.userContext.userKey

      fastify.data.action.capture(
        userKey,
        actionCode,
        details
      )
      reply.code(204)
    },
  })
}
