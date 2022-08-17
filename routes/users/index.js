const { userSchema } = require('./schema')

/**
 * For creating and managing user accounts.
 *
 * @param {*} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
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
      const { userKey } = request.userContext
      return fastify.data.user.getUserWithPublicId(userKey)
    },
  })
}
