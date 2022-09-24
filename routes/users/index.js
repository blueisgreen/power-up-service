const {
  userRefSchema,
  userSchema,
  publicKeyParam,
  userRoleSchema,
  addRoleSchema,
} = require('./schema')

/**
 * For creating and managing user accounts.
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
      description: 'Gets all users',
      response: {
        200: {
          type: 'array',
          items: userRefSchema,
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
    url: '/:userKey',
    schema: {
      tags: ['users'],
      description: 'Gets specific user',
      params: publicKeyParam,
      response: {
        200: userSchema,
      },
    },
    preHandler: [fastify.guard.role('admin')],
    handler: async (request, reply) => {
      const { userKey } = request.params
      const details = await fastify.data.user.getUserDetails(userKey)
      if (details === null) {
        return fastify.httpErrors.notFound()
      }
      return details
    },
  })

  fastify.route({
    method: 'PUT',
    url: '/:userKey',
    schema: {
      tags: ['users'],
      description: 'Gets specific user',
      params: publicKeyParam,
      response: {
        200: userSchema,
      },
    },
    preHandler: [fastify.guard.role('admin')],
    handler: async (request, reply) => {
      const { userKey } = request.params
      const details = await fastify.data.user.getUserDetails(userKey)
      if (details === null) {
        return fastify.httpErrors.notFound()
      }
      return fastify.httpErrors.notImplemented()
    },
  })

  fastify.route({
    method: 'PUT',
    url: '/:userKey/:action',
    schema: {
      tags: ['users'],
      description: 'Change state of account: suspend, activate, etc.',
      params: publicKeyParam,
      response: {
        200: userSchema,
      },
    },
    preHandler: [fastify.guard.role('admin')],
    handler: async (request, reply) => {
      const { userKey } = request.params
      const details = await fastify.data.user.getUserDetails(userKey)
      if (details === null) {
        return fastify.httpErrors.notFound()
      }
      return fastify.httpErrors.notImplemented()
    },
  })

  fastify.route({
    method: 'DELETE',
    url: '/:userKey',
    schema: {
      tags: ['users'],
      description: 'Gets specific user',
      params: publicKeyParam,
      response: {
        200: userSchema,
      },
    },
    preHandler: [fastify.guard.role('admin')],
    handler: async (request, reply) => {
      const { userKey } = request.params
      const details = await fastify.data.user.getUserDetails(userKey)
      if (details === null) {
        return fastify.httpErrors.notFound()
      }
      return fastify.httpErrors.notImplemented()
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
      return await fastify.data.userRole.getRoles(userKey)
    },
  })

  fastify.route({
    method: 'PUT',
    url: '/:userKey/roles',
    schema: {
      tags: ['users'],
      description: 'Gets all Power Up users',
      params: publicKeyParam,
      body: addRoleSchema,
      response: {
        200: userRoleSchema,
      },
    },
    preHandler: [fastify.guard.role('admin')],
    handler: async (request, reply) => {
      const { userKey } = request.params
      const { roles } = request.body
      await roles.reduce(async (memo, role) => {
        await memo
        await fastify.data.userRole.addRole(userKey, role)
      }, undefined)
      return await fastify.data.userRole.getRoles(userKey)
    },
  })

  fastify.route({
    method: 'DELETE',
    url: '/:userKey/roles',
    schema: {
      tags: ['users'],
      description: 'Gets all Power Up users',
      params: publicKeyParam,
      body: addRoleSchema,
      response: {
        200: userRoleSchema,
      },
    },
    preHandler: [fastify.guard.role('admin')],
    handler: async (request, reply) => {
      const { userKey } = request.params
      const { roles } = request.body
      await roles.reduce(async (memo, role) => {
        await memo
        await fastify.data.userRole.removeRole(userKey, role)
      }, undefined)
      return await fastify.data.userRole.getRoles(userKey)
    },
  })
}
