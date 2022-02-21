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

  /**
   * Browse activities. Slice by date, and page through results.
   * Results are for a single day. Pass 'on' in query string in
   * ISO date format. Default for 'on' is today.
   * Limit to N results (capped at 100?) with paging.
   */
  fastify.get('/activities', async (request, reply) => {
    // use today as default when 'on' not provided
    // expect 'on' to be an ISO date string
    const { on } = request.query

    // FIXME: verify format of 'on'
    const onTs = on ? new Date(on) : new Date()
    const actions = await fastify.data.action.getActions(onTs)
    reply.send(actions)
  })
}
