const lookupSchema = {
  type: 'object',
  properties: {
    code: {
      type: 'string',
      description: 'An identifier that is unique among its peers.',
    },
    display: {
      type: 'string',
      description: 'Something a bit more readable.',
    },
  },
}

const categoryParam = {
  type: 'object',
  properties: {
    category: { type: 'string' }
  }
}

module.exports = async function (fastify, opts) {
  const { log } = fastify

  fastify.route({
    method: 'GET',
    url: '/categories',
    schema: {
      tags: ['lookups'],
      description: 'Lookup categories.',
      response: {
        200: {
          type: 'array',
          items: lookupSchema,
        },
      },
    },
    handler: async (request, reply) => {
      return fastify.lookups.categoriesForUI
    },
  })

  fastify.route({
    method: 'GET',
    url: '/categories/:category',
    schema: {
      tags: ['lookups'],
      description: 'Returns lookup by category.',
      params: categoryParam,
      response: {
        200: {
          type: 'array',
          items: lookupSchema,
        },
      },
    },
    handler: async (request, reply) => {
      const { category } = request.params
      const lookup = fastify.lookups[category]
      if (lookup) {
        return lookup
      } else {
        return fastify.httpErrors.notFound()
      }
    },
  })

  fastify.route({
    method: 'GET',
    url: '/platforms',
    schema: {
      tags: ['lookups'],
      description: 'Returns platforms for verifying user identity.',
      response: {
        200: {
          type: 'array',
          items: lookupSchema,
        },
      },
    },
    handler: async (request, reply) => {
      return fastify.lookups.socialPlatform
    },
  })

  fastify.route({
    method: 'GET',
    url: '/roles',
    schema: {
      tags: ['lookups'],
      description: 'Returns available user roles.',
      response: {
        200: {
          type: 'array',
          items: lookupSchema,
        },
      },
    },
    handler: async (request, reply) => {
      return fastify.lookups.userRole
    },
  })
}
