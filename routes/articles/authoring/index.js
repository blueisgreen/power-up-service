const {
  articleAllMeta,
  articleAll,
  articleNewIn,
  articleUpdateIn,
  publicKeyParam,
  articleActionParams,
} = require('../schema')

module.exports = async function (fastify, opts) {
  const { log } = fastify
  const genericErrorMsg = {
    error: 'Yabai! Something went wrong.',
  }

  // TODO: prevent users without permission

  // fastify.all(
  //   '/',
  //   {
  //     // FIXME: make sure user is author or editor, and reject if not. also make it clear in request
  //     preValidation: [fastify.preValidation],
  //   },
  //   (request, reply) => {}
  // )

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['articles'],
      description: 'Get cover information for all articles created by user.',
      response: {
        200: {
          type: 'array',
          items: articleAllMeta,
        },
      },
    },
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
        reply.send(articles)
      } else {
        reply.code(404).send('No articles found')
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
    handler: async (request, reply) => {
      const { headline } = request.body
      const { userId, alias } = request.userContext
      const byline = alias || 'A. Nonymous'
      const articleInfo = await fastify.data.article.createArticle(
        headline,
        userId,
        byline
      )
      if (articleInfo) {
        reply.code(201).send(articleInfo)
      } else {
        reply.code(500).send(genericErrorMsg)
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
    handler: async (request, reply) => {
      const { key } = request.params
      const { userId, roles } = request.userContext

      const article = roles.editor
        ? await fastify.data.article.getArticleContentForEditor(key)
        : await fastify.data.article.getArticleContent(key, userId)

      if (article) {
        reply.send(article)
      } else {
        reply.code(404).send()
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
    handler: async (request, reply) => {
      const { publicKey } = request.params
      const { headline, byline, coverArtUrl, synopsis, content } = request.body
      try {
        const changes = {
          headline,
          byline,
          coverArtUrl,
          synopsis,
          content,
        }
        const result = await fastify.data.article.updateArticle(
          publicKey,
          changes
        )
        if (result) {
          reply.send(result)
        } else {
          reply.code(404).send()
        }
      } catch (err) {
        fastify.log.error(err)
        reply.code(500).send(genericErrorMsg)
      }
    },
  })

  fastify.route({
    method: 'PUT',
    url: '/:publicKey/:action',
    schema: {
      tags: ['articles'],
      description: 'Create a new article.',
      params: articleActionParams,
      response: {
        200: articleAllMeta,
      },
    },
    handler: async (request, reply) => {
      try {
        const { publicKey, action } = request.params
        const { roles, authorStatus } = request.userContext

        let result = []
        switch (action) {
          case 'publish':
            if (roles.editor || (roles.author && authorStatus === 'trusted')) {
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

          case 'revive':
            result = await fastify.data.article.reviveArticle(publicKey)
            break

          default:
            log.warn('Unsupported action. Not sure how we got here.')
            break
        }

        if (result) {
          reply.send(result)
        } else {
          reply.code(404).send()
        }
      } catch (err) {
        log.error(err)
        reply.code(500).send(genericErrorMsg)
      }
    },
  })

  fastify.route({
    method: 'DELETE',
    url: '/:publicKey',
    schema: {
      tags: ['articles'],
      description: 'Archive an article.',
      params: publicKeyParam,
      response: {
        200: articleAllMeta,
      },
    },
    handler: async (request, reply) => {
      const { publicKey } = request.params
      try {
        const result = await fastify.data.article.archiveArticle(publicKey)
        if (result) {
          reply.send(result)
        } else {
          reply.code(404).send()
        }
      } catch (err) {
        log.error(err)
        reply.code(500).send(genericErrorMsg)
      }
    },
  })

  fastify.route({
    method: 'DELETE',
    url: '/:publicKey/purge',
    schema: {
      tags: ['articles'],
      description: 'Delete an article forever. Sayonara.',
      params: publicKeyParam,
      response: {
        204: { type: 'string', default: 'No Content' },
      },
    },
    handler: async (request, reply) => {
      const { publicKey } = request.params
      try {
        await fastify.data.article.purgeArticle(publicKey)
        return
      } catch (err) {
        log.error(err)
        reply.code(500).send(genericErrorMsg)
      }
    },
  })
}
