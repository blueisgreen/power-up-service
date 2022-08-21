const {
  userSchema,
  userContextSchema,
  userUpdateSchema,
} = require('../users/schema')

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
      tags: ['active-user'],
      description: "Get user's account information",
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
    method: 'PUT',
    url: '/',
    schema: {
      tags: ['active-user'],
      description: "Update user's account information",
      body: userUpdateSchema,
      response: {
        200: userSchema,
      },
    },
    preHandler: [fastify.preValidation],
    handler: async (request, reply) => {
      const { who } = request.userContext
      return await fastify.data.identity.updateUser(who, request.body)
    },
  })

  fastify.route({
    method: 'GET',
    url: '/context',
    schema: {
      tags: ['active-user'],
      description: 'Get frequently used information about the user',
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
