const { articleCover, articleContent, articleAllMeta, articleAll } = require('./schema')

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
      tags: ['Articles'],
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

  // TODO: prevent users without permission
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      tags: ['Articles'],
      description: 'Create a new article.',
      response: {
        200: articleAllMeta,
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

  // TODO: validate parameter in; handle not found out

  fastify.route({
    method: 'GET',
    url: '/published/:publicKey',
    schema: {
      tags: ['Articles'],
      description: 'Get content of published article',
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

  fastify.route({
    method: 'GET',
    url: '/published/:publicKey/full',
    schema: {
      tags: ['Articles'],
      description: 'Get everything about published article',
      response: {
        200: articleAll,
      },
    },
    handler: async (request, reply) => {
      const publicKey = request.params.key
      return await fastify.data.article.getPublishedArticle(publicKey)
    },
  })

  // fastify.get('/', async (req, reply) => {
  //   log.debug('get articles.published')
  //   try {
  //     const articles = await fastify.data.article.getPublishedArticleCovers()
  //     reply.send(articles)
  //   } catch (error) {
  //     log.error(error)
  //     reply.code(500).send(genericErrorMsg)
  //   }
  // })

  // fastify.get('/:key', async (req, reply) => {
  //   try {
  //     const articleKey = req.params.key
  //     const article = await fastify.data.article.getPublishedArticle(articleKey)
  //     if (article) {
  //       reply.send(article)
  //     } else {
  //       reply.code(404).send()
  //     }
  //   } catch (err) {
  //     log.error(err)
  //     reply.code(500).send(genericErrorMsg)
  //   }
  // })
}
