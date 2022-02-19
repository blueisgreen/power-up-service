'use strict'

module.exports = async function (fastify, opts) {
  const { log } = fastify
  fastify.get(
    '/users',
    {
      // FIXME: make sure user is admin
      preValidation: [fastify.preValidation],
    },
    async function (request, reply) {
      const users = await fastify.data.admin.getUsers()
      log.debug(`found ${users.length} users`)
      reply.send(users)
    }
  )

  fastify.get(
    '/users/:userKey/roles',
    {
      // FIXME: make sure user is admin
      preValidation: [fastify.preValidation],
    },
    async function (request, reply) {
      const userKey = request.params.userKey
      log.debug('getting roles for ' + userKey)
      const roles = await fastify.data.admin.getUserRoles(userKey)
      reply.send(roles)
    }
  )

  fastify.post(
    '/users/:userKey/roles',
    {
      preValidation: [fastify.preValidation],
    },
    async function (request, reply) {}
  )

  fastify.get(
    '/roles',
    {
      preValidation: [fastify.preValidation],
    },
    async function (request, reply) {
      reply.send(fastify.lookups.role)
    }
  )

  fastify.put(
    '/users/:userKey/roles/:code',
    {
      preValidation: [fastify.preValidation],
    },
    async function (request, reply) {
      const { userKey, code } = request.params
      await fastify.data.admin.addUserRole(userKey, code)
      reply.code(204)
    }
  )

  fastify.delete(
    '/users/:userKey/roles/:code',
    {
      preValidation: [fastify.preValidation],
    },
    async function (request, reply) {
      const { userKey, code } = request.params
      await fastify.data.admin.removeUserRole(userKey, code)
      reply.code(204)
    }
  )
}
