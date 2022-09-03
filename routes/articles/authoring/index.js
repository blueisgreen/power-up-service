const {
  articleAllMeta,
  articleAll,
  articleNewIn,
  articleUpdateIn,
  publicKeyParam,
  articleActionParams,
} = require('../schema')

/**
 * For creating, modifying, and managing articles.
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
      tags: ['articles', 'contribution'],
      description: 'Get cover information for all articles created by user.',
      response: {
        200: {
          type: 'array',
          items: articleAllMeta,
        },
      },
    },
    preHandler: [fastify.guard.role('author', 'editor')],
    handler: async (request, reply) => {
      const { userId } = request.userContext
      const articles = await fastify.data.article.getMyArticles(userId)
      const articleIds = articles.map((item) => item.id)
      const relatedMsgs = await fastify.data.support.findMessagesAboutArticles(
        userId,
        articleIds
      )
      articles.forEach((art) => {
        if (relatedMsgs.find((msg) => msg.articleId === art.id)) {
          art.hasMessage = true
        }
      })
      if (articles) {
        return articles
      } else {
        return fastify.httpErrors.notFound()
      }
    },
  })

  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      tags: ['articles'],
      description: 'Create a new article.',
      body: articleNewIn,
      response: {
        201: articleAll,
      },
    },
    preHandler: [fastify.guard.role('author', 'editor')],
    handler: async (request, reply) => {
      const { headline, byline, synopsis } = request.body
      const { userId, alias } = request.userContext
      const useByline = byline || alias || 'A. Nonymous'
      const articleInfo = await fastify.data.article.createArticle(
        headline,
        userId,
        useByline,
        synopsis
      )
      if (articleInfo) {
        reply.code(201).send(articleInfo)
      } else {
        log.error(err)
        return fastify.httpErrors.internalServerError()
      }
    },
  })

  fastify.route({
    method: 'GET',
    url: '/:publicKey',
    tags: ['articles'],
    description: 'Get full article for editing.',
    schema: {
      params: publicKeyParam,
      response: {
        200: articleAll,
      },
    },
    preHandler: [fastify.guard.role('author', 'editor')],
    handler: async (request, reply) => {
      const { publicKey } = request.params
      const { userId, hasRoles } = request.userContext

      const article = hasRoles.editor
        ? await fastify.data.article.getArticleContentForEditor(publicKey)
        : await fastify.data.article.getArticleContent(publicKey, userId)

      if (article) {
        return article
      } else {
        return fastify.httpErrors.notFound()
      }
    },
  })

  fastify.route({
    method: 'PUT',
    url: '/:publicKey',
    schema: {
      tags: ['articles'],
      description: 'Create a new article.',
      params: publicKeyParam,
      body: articleUpdateIn,
      response: {
        200: articleAll,
      },
    },
    preHandler: [fastify.guard.role('author', 'editor')],
    handler: async (request, reply) => {
      const { publicKey } = request.params
      const { headline, byline, synopsis, content } = request.body
      try {
        const changes = {
          headline,
          byline,
          synopsis,
          content,
        }
        const result = await fastify.data.article.updateArticle(
          publicKey,
          changes
        )
        if (result) {
          return result
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
    method: 'PUT',
    url: '/:publicKey/:action',
    schema: {
      tags: ['articles'],
      description:
        'Change state of article: publish / retract, archive / revive.',
      params: articleActionParams,
      response: {
        200: articleAllMeta,
      },
    },
    preHandler: [fastify.guard.role('author', 'editor')],
    handler: async (request, reply) => {
      try {
        const { publicKey, action } = request.params
        const { hasRoles, authorStatus } = request.userContext

        let result = []
        switch (action) {
          case 'publish':
            if (
              hasRoles.editor ||
              (hasRoles.author && authorStatus === 'trusted')
            ) {
              result = await fastify.data.article.publishArticle(publicKey)
            } else {
              result = await fastify.data.article.requestToPublishArticle(
                publicKey
              )
            }
            break

          case 'retract':
            result = await fastify.data.article.retractArticle(publicKey)
            break

          case 'archive':
            result = await fastify.data.article.archiveArticle(publicKey)
            break

          case 'revive':
            result = await fastify.data.article.reviveArticle(publicKey)
            break

          default:
            log.warn('Unsupported action. Not sure how we got here.')
            break
        }

        if (result) {
          return result
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
    method: 'DELETE',
    url: '/:publicKey',
    schema: {
      tags: ['articles'],
      description: 'Delete an article forever. Sayonara.',
      params: publicKeyParam,
      response: {
        204: { type: 'string', default: 'No Content' },
      },
    },
    preHandler: [fastify.guard.role('author', 'editor')],
    handler: async (request, reply) => {
      const { publicKey } = request.params
      try {
        await fastify.data.article.purgeArticle(publicKey)
        reply.code(204).send()
      } catch (err) {
        log.error(err)
        return fastify.httpErrors.internalServerError()
      }
    },
  })
}
