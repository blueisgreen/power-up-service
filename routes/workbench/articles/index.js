'use strict'

module.exports = async function (fastify, opts) {
  const { log } = fastify
  const genericErrorMsg = {
    error: 'Bad news, kiddies. Something went wrong.',
  }

  fastify.get('/', async (req, reply) => {
    const articles = await fastify.data.article.getMyArticles(
      req.userContext.userId
    )
    const articleIds = articles.map((item) => item.id)
    const relatedMsgs = await fastify.data.support.findMessagesAboutArticles(
      req.userContext.userId,
      articleIds
    )
    articles.forEach(art => {
      if (relatedMsgs.find(msg => msg.articleId === art.id)) {
        art.hasMessage = true
      }
    })
    if (articles) {
      reply.send(articles)
    } else {
      reply.code(404).send('No articles found')
    }
  })

  fastify.get('/full', async (req, reply) => {
    const articles = await fastify.data.article.getArticlesFullInfo()
    if (articles) {
      reply.send(articles)
    } else {
      reply.code(404).send('No articles found')
    }
  })

  fastify.post('/', async (req, reply) => {
    const { headline } = req.body
    const { userId, alias } = req.userContext
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

  fastify.put('/:key/publish', async (req, reply) => {
    try {
      const { key } = req.params
      let result
      if (
        req.userContext.roles.editor ||
        (req.userContext.roles.author &&
          req.userContext.authorStatus === 'trusted')
      ) {
        result = await fastify.data.article.publishArticle(key)
      } else {
        result = await fastify.data.article.requestToPublishArticle(key)
      }

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

  fastify.put('/:key/retract', async (req, reply) => {
    const { key } = req.params
    try {
      const result = await fastify.data.article.retractArticle(key)
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
