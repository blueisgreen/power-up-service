const { articleTableName, articleColumns } = require('./modelFieldMap')

module.exports = (fastify) => {
  const { knex, log } = fastify

  const createArticle = async (headline, authorId) {

  }
  
  const getMyArticles = async (userId) => {
    log.debug('articleWriterModel.getMyArticles')
    const myArticles = await knex(articleTableName)
      .where('')
  }
}