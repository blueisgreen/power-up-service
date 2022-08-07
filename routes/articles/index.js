'use strict'

const { articleCover } = require('./schema')

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

  fastify.log.debug(articleCover)
  const genericErrorMsg = {
    error: 'Bad news, kiddies. Something went wrong with the database.',
  }

  fastify.addSchema({
    $id: 'http://powerupmagazine.com',
    type: 'object',
    properties: {
      articleCover,
    },
  })

  fastify.get('/blah', {
    handler: async (request, reply) => {
      return await fastify.data.article.getPublishedArticleCovers()
    },
    schema: {
      tags: ['Articles'],
      description: 'Get cover information for published articles.',
      response: {
        200: {
          type: 'array',
          items: articleCover,
          // items: {
          //   $ref: 'http://powerupmagazine.com#/properties/articleCover',
          // },
        },
      },
    },
  })
  fastify.route({
    method: 'GET',
    url: '/published',
    schema: {
      tags: ['Articles'],
      description: 'Get cover information for published articles.',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              publicKey: {
                type: 'string',
                description: 'Unique identifier for the article.',
              },
              headline: {
                type: 'string',
                description: 'Description that draws readers attention.',
              },
              byline: {
                type: 'string',
                description: 'Who gets credit for writing the article.',
              },
              synopsis: {
                type: 'string',
                description: 'Brief summary of what the article is about.',
              },
              coverArtUrl: {
                type: 'string',
                format: 'uri',
                description: 'Where to find the cover art.',
              },
              publishedAt: {
                type: 'string',
                format: 'date-time',
                description:
                  'When the article became generally available to readers.',
              },
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      return await fastify.data.article.getPublishedArticleCovers()
    },
  })

  // fastify.route({
  //   method: 'GET',
  //   url: '/published/:publicKey',
  //   schema: {
  //     tags: ['Articles'],
  //     description: 'Get content of published article',
  //     response: {
  //       200: articleContent,
  //     },
  //   },
  //   handler: async (request, reply) => {
  //     const publicKey = request.params.key
  //     return await fastify.data.article.getPublishedContent(publicKey)
  //   },
  // })

  // fastify.route({
  //   method: 'GET',
  //   url: '/published/:publicKey/full',
  //   schema: {
  //     tags: ['Articles'],
  //     description: 'Get everything about published article',
  //     response: {
  //       200: articleComplete,
  //     },
  //   },
  //   handler: async (request, reply) => {
  //     const publicKey = request.params.key
  //     return await fastify.data.article.getPublishedArticle(publicKey)
  //   },
  // })

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
