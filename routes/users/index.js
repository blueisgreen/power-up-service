const { userSchema, publicKeyParam, userRoleSchema } = require('./schema')

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
      description: 'Gets all Power Up users',
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

  fastify.route({
    method: 'GET',
    url: '/:userKey/roles',
    schema: {
      tags: ['users'],
      description: 'Gets all Power Up users',
      params: publicKeyParam,
      response: {
        200: userRoleSchema,
      },
    },
    preHandler: [fastify.guard.role('admin')],
    handler: async (request, reply) => {
      const { userKey } = request.params
      return fastify.data.userRole.getRoles(userKey)
    },
  })
}
