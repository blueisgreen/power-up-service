'use strict'

// TODO: restrict access to editors

module.exports = async function (fastify, opts) {
  const { log } = fastify
  const genericErrorMsg = {
    error: 'Bad news, kiddies. Something went wrong.',
  }

  fastify.get('/', async (req, reply) => {
    const { user, status, limit, offset } = req.query
    const queryParams = {
      user,
      status,
      limit: limit || 20,
      offset: offset || 0,
    }
    const articles = await fastify.data.article.getArticlesInfoOnly(queryParams)
    if (articles) {
      reply.send(articles)
    } else {
      reply.code(404).send('No articles found')
    }
  })

  fastify.get('/:key', async (req, reply) => {
    const { key } = req.params
    const article = req.userContext.roles.editor
      ? await fastify.data.article.getArticleContentForEditor(key)
      : await fastify.data.article.getArticleContent(
          key,
          req.userContext.userId
        )
    if (article) {
      reply.send(article)
    } else {
      reply.code(404).send()
    }
  })

  fastify.put('/:key', async (req, reply) => {
    const { params, body } = req
    const { key } = params
    try {
      const changes = {
        headline: body.headline,
        byline: body.byline,
        coverArtUrl: body.coverArtUrl,
        synopsis: body.synopsis,
        content: body.content,
      }
      const result = await fastify.data.article.updateArticle(key, changes)
      if (result.length > 0) {
        reply.send(result[0])
      } else {
        reply.code(404).send()
      }
    } catch (err) {
      log.error(err)
      reply.code(500).send(genericErrorMsg)
    }
  })

  fastify.put('/:key/publish', async (req, reply) => {
    const { key } = req.params
    try {
      let result
      if (
        req.userContext.hasRoles.editor ||
        (req.userContext.hasRoles.author &&
          req.userContext.authorStatus === 'trusted')
      ) {
        result = await fastify.data.article.publishArticle(key)
      } else {
        result = await fastify.data.article.requestToPublishArticle(key)
      }

      if (result.length > 0) {
        reply.send(result[0])
      } else {
        reply.code(404).send()
      }
    } catch (err) {
      log.error(err)
      reply.code(500).send(genericErrorMsg)
    }
  })

  fastify.put('/:key/denyToPublish', async (req, reply) => {
    const { key } = req.params
    const { message } = req.body
    try {
      const articleSnapshot = await fastify.data.article.retractArticle(key)
      await fastify.data.support.createMessageAboutArticle(
        articleSnapshot.author_id,
        articleSnapshot.id,
        'deniedToPublish',
        message
      )
      reply.send(articleSnapshot)
    } catch (err) {
      fastify.log.error(err)
      reply.code(500).send(genericErrorMsg)
    }
  })

  fastify.put('/:key/revive', async (req, reply) => {
    const { key } = req.params
    try {
      const result = await fastify.data.article.reviveArticle(key)
      if (result) {
        reply.send(result)
      } else {
        reply.code(404).send()
      }
    } catch (err) {
      fastify.log.error(err)
      reply.code(500).send(genericErrorMsg)
    }
  })

  fastify.delete('/:key', async (req, reply) => {
    const { key } = req.params
    try {
      const result = await fastify.data.article.archiveArticle(key)
      if (result) {
        reply.send(result)
      } else {
        reply.code(404).send()
      }
    } catch (err) {
      fastify.log.error(err)
      reply.code(500).send(genericErrorMsg)
    }
  })

  fastify.delete('/:key/purge', async (req, reply) => {
    const { key } = req.params
    try {
      await fastify.data.article.purgeArticle(key)
      reply.code(204).send()
    } catch (err) {
      fastify.log.error(err)
      reply.code(500).send(genericErrorMsg)
    }
  })
}
