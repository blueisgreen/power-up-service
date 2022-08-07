const { articleCover, articleContent, articleAllPublic } = require('./schema')

/**
 * For read-only access to library of articles by any user. Also
 * this will be a good place to receive ratings and feedback
 * about articles.
 *
 * @param {*} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
  const { log } = fastify

  const genericErrorMsg = {
    error: 'Bad news, kiddies. Something went wrong with the database.',
  }

  // fastify.addSchema({
  //   $id: 'http://powerupmagazine.com',
  //   type: 'object',
  //   properties: {
  //     articleCover,
  //   },
  // })

  fastify.route({
    method: 'GET',
    url: '/published',
    schema: {
      tags: ['articles'],
      description: 'Get cover information for published articles.',
      response: {
        200: {
          type: 'array',
          items: articleCover,
        },
      },
    },
    handler: async (request, reply) => {
      return await fastify.data.article.getPublishedArticleCovers()
    },
  })

  // TODO: validate parameter in; handle not found out
  fastify.route({
    method: 'GET',
    url: '/published/:publicKey',
    schema: {
      tags: ['articles'],
      description: 'Get content of published article',
      params: {
        type: 'object',
        properties: {
          publicKey: { type: 'string' },
        },
      },
      response: {
        200: articleContent,
      },
    },
    handler: async (request, reply) => {
      const publicKey = request.params.key
      return await fastify.data.article.getPublishedContent(publicKey)
    },
  })

  // TODO: handle general errors
  // FIXME: different subset for published "all" - don't want to show some fields

  fastify.route({
    method: 'GET',
    url: '/published/:publicKey/full',
    schema: {
      tags: ['articles'],
      description: 'Get everything about published article',
      params: {
        type: 'object',
        properties: {
          publicKey: { type: 'string' },
        },
      },
      response: {
        200: articleAllPublic,
      },
    },
    handler: async (request, reply) => {
      const publicKey = request.params.key
      return await fastify.data.article.getPublishedArticle(publicKey)
    },
  })
}
