const { userSchema, userContextSchema } = require('../users/schema')

/**
 * For creating and managing one's own user accounts.
 *
 * @param {*} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
  const { log } = fastify

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['users'],
      description: "Get user's own information",
      response: {
        200: userSchema,
      },
    },
    preHandler: [fastify.preValidation],
    handler: async (request, reply) => {
      const { who } = request.userContext
      return await fastify.data.identity.getUser(who)
    },
  })

  fastify.route({
    method: 'GET',
    url: '/context',
    schema: {
      tags: ['users'],
      description: "Get user's own information",
      response: {
        200: userContextSchema,
      },
    },
    preHandler: [fastify.preValidation],
    handler: async (request, reply) => {
      const { who } = request.userContext
      return await fastify.data.identity.getUserContext(who)
    },
  })
}
