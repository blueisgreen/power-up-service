const {
  profileSchema,
  contextSchema,
  profileUpdateSchema,
  settingsSchema,
  authorSchema,
  authorUpdateSchema,
  inquirySchema,
} = require('./schema')

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
      description: 'Get key reference information about the user',
      response: {
        200: contextSchema,
      },
    },
    preHandler: [fastify.auth.preValidation],
    handler: async (request, reply) => {
      return request.userContext
    },
  })

  fastify.route({
    method: 'POST',
    url: '/join',
    schema: {
      tags: ['active-user'],
      description: 'User request for membership',
      body: profileUpdateSchema,
      response: {
        200: contextSchema,
      },
    },
    preHandler: [fastify.auth.preValidation],
    handler: async (request, reply) => {
      const { who } = request.userContext
      const { alias } = request.body
      await fastify.data.identity.updateUser(who, alias, 'active')
      await fastify.data.identity.agreeToTerms(who)
      await fastify.data.identity.agreeToCookies(who)
      return await fastify.data.identity.getUserContext(who)
    },
  })

  fastify.route({
    method: 'GET',
    url: '/profile',
    schema: {
      tags: ['active-user'],
      description: 'Get user account information',
      response: {
        200: profileSchema,
      },
    },
    preHandler: [fastify.auth.preValidation],
    handler: async (request, reply) => {
      const { who } = request.userContext
      return await fastify.data.identity.getUser(who)
    },
  })

  fastify.route({
    method: 'PUT',
    url: '/profile',
    schema: {
      tags: ['active-user'],
      description: 'Update user account information',
      body: profileUpdateSchema,
      response: {
        200: profileSchema,
      },
    },
    preHandler: [fastify.auth.preValidation],
    handler: async (request, reply) => {
      const { who } = request.userContext
      const { alias } = request.body
      return await fastify.data.identity.updateUser(who, alias)
    },
  })

  fastify.route({
    method: 'PUT',
    url: '/settings',
    schema: {
      tags: ['active-user'],
      description: 'Update agreements and app preferences',
      body: settingsSchema,
    },
    preHandler: [fastify.auth.preValidation],
    handler: async (request, reply) => {
      const { who } = request.userContext
      const { acceptCookies, acceptEmailComms } = request.body
      if (acceptCookies) {
        await fastify.data.identity.agreeToCookies(who)
      }
      if (acceptEmailComms) {
        await fastify.data.identity.agreeToEmailComms(who)
      }
      reply.code(204).send()
    },
  })

  fastify.route({
    method: 'POST',
    url: '/apply/author',
    schema: {
      tags: ['active-user'],
      description: 'Apply to become an author',
      body: authorUpdateSchema,
      response: {
        200: contextSchema,
      },
    },
    preHandler: [fastify.auth.preValidation],
    handler: async (request, reply) => {
      const { who, userId } = request.userContext
      const { penName } = request.body
      await fastify.data.identity.createAuthor(who, penName)
      await grantRoles(userId, ['author'])
      return await fastify.data.identity.getUserContext(who)
    },
  })

  fastify.route({
    method: 'GET',
    url: '/profile/author',
    schema: {
      tags: ['active-user'],
      description: 'Get attributes of author profile',
      response: {
        200: authorSchema,
      },
    },
    preHandler: [fastify.guard.role('author')],
    handler: async (request, reply) => {
      const { who } = request.userContext
      return await fastify.data.author.getInfo(who)
    },
  })

  fastify.route({
    method: 'GET',
    url: '/inquiries',
    schema: {
      tags: ['inquiries'],
      description: 'See all inquiries related to this user',
      response: {
        200: {
          type: 'array',
          items: inquirySchema,
        },
      },
    },
    preHandler: [fastify.auth.preValidation],
    handler: async (request, reply) => {
      const { who } = request.userContext
      return await fastify.data.support.getInquiriesByUser(who)
    },
  })

  fastify.route({
    method: 'GET',
    url: '/inquiries/related/:id',
    schema: {
      tags: ['inquiries'],
      description: 'See message thread',
      response: {
        200: inquirySchema,
      },
    },
    preHandler: [fastify.auth.preValidation],
    handler: async (request, reply) => {
      return await fastify.data.support.getRelatedInquiries(request.params.id)
    },
  })
}
