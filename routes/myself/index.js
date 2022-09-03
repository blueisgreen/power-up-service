const {
  selfProfileSchema,
  selfContextSchema,
  selfProfileUpdateSchema,
  agreementsSchema,
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
      description: "Get user's account information",
      response: {
        200: selfProfileSchema,
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
      tags: ['active-user'],
      description: 'Get frequently used information about the user',
      response: {
        200: selfContextSchema,
      },
    },
    preHandler: [fastify.preValidation],
    handler: async (request, reply) => {
      const { who } = request.userContext
      return await fastify.data.identity.getUserContext(who)
    },
  })

  fastify.route({
    method: 'PUT',
    url: '/',
    schema: {
      tags: ['active-user'],
      description: "Update user's account information",
      body: selfProfileUpdateSchema,
      response: {
        200: selfProfileSchema,
      },
    },
    preHandler: [fastify.preValidation],
    handler: async (request, reply) => {
      const { who } = request.userContext
      const { alias, acceptTerms, acceptCookies, acceptEmailComms } =
        request.body
      return await fastify.data.identity.updateUser(
        who,
        alias,
        acceptTerms,
        acceptCookies,
        acceptEmailComms
      )
    },
  })

  fastify.route({
    method: 'PUT',
    url: '/accept',
    schema: {
      tags: ['active-user'],
      description: "Update user's account information",
      body: agreementsSchema,
    },
    preHandler: [fastify.preValidation],
    handler: async (request, reply) => {
      const { who } = request.userContext
      const { acceptTerms, acceptCookies, acceptEmailComms } = request.body

      if (acceptTerms) {
        await fastify.data.identity.agreeToTerms(who)
      }
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
    method: 'GET',
    url: '/roles',
    schema: {
      tags: ['inquiries'],
      description: "See all of the user's inquiries",
      response: {
        200: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
    preHandler: [fastify.preValidation],
    handler: async (request, reply) => {
      return await fastify.data.identity.getUserRolesWithPublicId(
        request.userContext.who
      )
    },
  })

  fastify.route({
    method: 'GET',
    url: '/inquiries',
    schema: {
      tags: ['inquiries'],
      description: "See all of the user's inquiries",
      response: {
        200: {
          type: 'array',
          items: inquirySchema,
        },
      },
    },
    preHandler: [fastify.preValidation],
    handler: async (request, reply) => {
      return await fastify.data.support.getInquiriesByUser(
        request.userContext.who
      )
    },
  })

  fastify.route({
    method: 'GET',
    url: '/inquiries/related/:id',
    schema: {
      tags: ['inquiries'],
      description: 'See related messages',
      response: {
        200: inquirySchema,
      },
    },
    preHandler: [fastify.preValidation],
    handler: async (request, reply) => {
      return await fastify.data.support.getRelatedInquiries(request.params.id)
    },
  })
}
