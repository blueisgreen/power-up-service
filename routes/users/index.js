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
      description: "Gets all Power Up users",
      response: {
        200: {
          type: 'array',
          items: userSchema,
        },
      },
    },
    preHandler: [fastify.guard.role('admin')],
    handler: async (request, reply) => {
      return fastify.data.user.getAllUsers()
    },
  })
}
