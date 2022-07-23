'use strict'

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
  fastify.get('/published', async (req, reply) => {
    log.debug('get articles.published')
    try {
      const articles = await fastify.data.article.getPublishedArticleCovers()
      reply.send(articles)
    } catch (error) {
      log.error(error)
      reply.code(500).send(genericErrorMsg)
    }
  })

  fastify.get('/:key', async (req, reply) => {
    try {
      const articleKey = req.params.key
      const article = await fastify.data.article.getPublishedArticle(articleKey)
      if (article) {
        reply.send(article)
      } else {
        reply.code(404).send()
      }
    } catch (err) {
      log.error(err)
      reply.code(500).send(genericErrorMsg)
    }
  })
}
