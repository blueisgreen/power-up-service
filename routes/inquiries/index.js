const inquirySchema = {
  type: 'object',
  properties: {
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'When action record created.',
    },
    purpose: {
      type: 'string',
      description: 'Public key of the actor.',
    },
    message: {
      type: 'string',
      description: 'Details of the action.',
    },
  },
}

module.exports = async function (fastify, opts) {
  const { log } = fastify

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['inquiries'],
      description: 'Messages between user and Customer Support',
      response: {
        200: {
          type: 'array',
          items: inquirySchema,
        },
      },
    },
    preHandler: [fastify.guard.role('admin')],
    handler: async (request, reply) => {
      return await fastify.data.support.getInquiries()
    },
  })
}
