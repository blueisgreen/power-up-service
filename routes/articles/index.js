const {
  articleCover,
  articleContent,
  articleAllPublic,
  publicKeyParam,
} = require('./schema')

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

  fastify.route({
    method: 'GET',
    url: '/',
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
      try {
        return await fastify.data.article.getPublishedArticleCovers()
      } catch (err) {
        log.error(err)
        return fastify.httpErrors.internalServerError()
      }
    },
  })

  fastify.route({
    method: 'GET',
    url: '/:publicKey',
    schema: {
      tags: ['articles'],
      description: 'Get content of published article.',
      params: publicKeyParam,
      response: {
        200: articleContent,
      },
    },
    handler: async (request, reply) => {
      const { publicKey } = request.params
      try {
        const article = await fastify.data.article.getPublishedContent(
          publicKey
        )
        if (article) {
          return article
        } else {
          return fastify.httpErrors.notFound()
        }
      } catch (err) {
        log.error(err)
        return fastify.httpErrors.internalServerError()
      }
    },
  })

  fastify.route({
    method: 'GET',
    url: '/:publicKey/full',
    schema: {
      tags: ['articles'],
      description: 'Get everything about published article.',
      params: publicKeyParam,
      response: {
        200: articleAllPublic,
      },
    },
    handler: async (request, reply) => {
      const { publicKey } = request.params
      try {
        const article = await fastify.data.article.getPublishedArticle(
          publicKey
        )
        if (article) {
          return article
        } else {
          return fastify.httpErrors.notFound()
        }
      } catch (err) {
        log.error(err)
        return fastify.httpErrors.internalServerError()
      }
    },
  })
}
