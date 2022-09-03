const {
  articleAllMeta,
  articleFilters,
  publicKeyParam,
  articleDenialIn,
} = require('../schema')

/**
 * Actions that are suitable for an editor.
 *
 * @param {*} fastify
 * @param {*} opts
 */
module.exports = async function (fastify, opts) {
  const { log } = fastify

  const genericErrorMsg = {
    error: 'Bad news, kiddies. Something went wrong.',
  }

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['articles', 'editor'],
      description:
        'Get articles that match given filters. Limited to 20 results by default.',
      query: articleFilters,
      response: {
        200: {
          type: 'array',
          items: articleAllMeta,
        },
      },
    },
    preHandler: [fastify.guard.role('editor')],
    handler: async (request, reply) => {
      const { status, limit, offset } = request.query
      try {
        const queryParams = {
          status,
          limit: limit || 20,
          offset: offset || 0,
        }
        const articles = await fastify.data.article.getArticlesInfoOnly(
          queryParams
        )
        return articles
      } catch (err) {
        log.error(err)
        return fastify.httpErrors.internalServerError()
      }
    },
  })

  fastify.route({
    method: 'PUT',
    url: '/:publicKey/deny-to-publish',
    schema: {
      tags: ['articles', 'editor'],
      description:
        'Deny a pending request to publish article, and leave a message to explain why.',
      params: publicKeyParam,
      body: articleDenialIn,
      response: {
        200: articleAllMeta,
      },
    },
    preHandler: [fastify.guard.role('editor')],
    handler: async (request, reply) => {
      const { publicKey } = request.params
      const { message } = request.body
      try {
        const articleSnapshot = await fastify.data.article.retractArticle(
          publicKey
        )
        await fastify.data.support.createMessageAboutArticle(
          articleSnapshot.author_id,
          articleSnapshot.id,
          'deniedToPublish',
          message
        )
        return articleSnapshot
      } catch (err) {
        log.error(err)
        return fastify.httpErrors.internalServerError()
      }
    },
  })
}
