const {
  articleTableName,
  articleInfoColumns,
  articleContentColumns,
  articleFullColumns,
} = require('./modelFieldMap')

const fullArticleInfoColumns = [
  'articles.id',
  'articles.headline',
  'articles.byline',
  'users.alias as author',
  'users.public_id as authorKey',
  'articles.cover_art_url as coverArtUrl',
  'articles.synopsis',
  'articles.created_at as createdAt',
  'articles.updated_at as updatedAt',
  'articles.published_at as publishedAt',
  'articles.archived_at as archivedAt',
  'articles.requested_to_publish_at as requestedToPublishAt',
]

module.exports = (fastify) => {
  const { knex, log } = fastify

  /**
   * Creates a new article, mostly a shell to be filled in by its author.
   *
   * @param {string} headline - main title of the article
   * @param {number} authorId - system id of article's author
   * @param {string} byline - text description of the author, a.k.a. pen name
   * @returns ArticleInfo everything about the article except the content
   */
  const createArticle = async (headline, authorId, byline) => {
    const row = {
      headline,
      author_id: authorId,
      byline,
    }
    try {
      const result = await knex(articleTableName).insert(
        row,
        articleInfoColumns
      )
      return result.length > 0 ? result[0] : null
    } catch (err) {
      fastify.log.error(err)
      return null
    }
  }

  /**
   * Get metadata for articles owned by the user, presumed to be an author.
   *
   * @param {number} userId - system ID of the presumed author with articles
   * @returns [ArticleInfo] list of articles owned by user
   */
  const getArticles = async (userId) => {
    log.debug('articleModel.getMyArticles')
    const myArticles = await knex(articleTableName)
      .select(articleInfoColumns)
      .where('author_id', userId)
    fastify.log.debug('Found ' + myArticles.length + ' articles by ' + userId)
    return myArticles
  }

  const getArticlesFullInfo = async () => {
    log.debug('articleModel.getArticlesFullInfo')
    const myArticles = await knex('articles')
      .join('users', 'users.id', 'articles.author_id')
      .select(fullArticleInfoColumns)
    return myArticles
  }

  /**
   * Get the content of a specific article that is owned by the given user,
   * regardless of status (draft, archived, etc.).
   *
   * @param {number} articleId - system ID of the article being requested
   * @param {number} userId - system ID of the article's author
   * @returns ArticleContent the content of the article, plus minimal identifying info
   */
  const getArticleContent = async (articleId, userId) => {
    log.debug('articleModel.getArticleContent')
    const conditions = {
      id: articleId,
      author_id: userId,
    }
    const myArticle = await knex(articleTableName)
      .select(articleContentColumns)
      .where(conditions)
    return myArticle.length > 0 ? myArticle[0] : null
  }

  /**
   * Get the content of a specific article regardless of status
   * for an editor to review.
   *
   * @param {number} articleId - system ID of the article being requested
   * @returns ArticleContent the content of the article, plus minimal identifying info
   */
  const getArticleContentForEditor = async (articleId) => {
    // TODO: refactor this, should be able to consolidate with getArticleContent
    log.debug('articleModel.getArticleContent')
    const conditions = {
      id: articleId,
    }
    const myArticle = await knex(articleTableName)
      .select(articleContentColumns)
      .where(conditions)
    return myArticle.length > 0 ? myArticle[0] : null
  }

  const updateArticle = async (articleId, changes) => {
    log.debug('articleModel.updateArticle')
    const now = new Date()
    // TODO: should map details to expected columns
    const result = await knex(articleTableName)
      .where('id', articleId)
      .update({
        headline: changes.headline,
        byline: changes.byline,
        cover_art_url: changes.coverArtUrl,
        synopsis: changes.synopsis,
        content: changes.content,
        updated_at: now,
      })
      .returning(articleFullColumns)
    return result
  }

  const publishArticle = async (articleId) => {
    const now = new Date()
    const result = await knex(articleTableName)
      .where('id', articleId)
      .update({
        published_at: now,
        requested_to_publish_at: null,
      })
      .returning(articleInfoColumns)
    return result
  }

  const retractArticle = async (articleId) => {
    const result = await knex(articleTableName)
      .where('id', articleId)
      .update({
        published_at: null,
        requested_to_publish_at: null,
      })
      .returning(articleInfoColumns)
    return result
  }

  const requestToPublishArticle = async (articleId) => {
    const now = new Date()
    const result = await knex(articleTableName)
      .where('id', articleId)
      .update({
        requested_to_publish_at: now,
      })
      .returning(articleInfoColumns)
    return result
  }

  const retractRequestToPublishArticle = async (articleId) => {
    const now = new Date()
    const result = await knex(articleTableName)
      .where('id', articleId)
      .update({
        requested_to_publish_at: null,
      })
      .returning(articleInfoColumns)
    return result
  }

  const getArticlesPendingReview = async () => {
    const result = await knex(articleTableName)
      .select(fullArticleInfoColumns)
      .whereNotNull('requested_to_publish_at')
      .join('users', 'users.id', 'articles.author_id')
    return result
  }

  return {
    createArticle,
    getArticles,
    getArticlesFullInfo,
    getArticleContent,
    getArticleContentForEditor,
    updateArticle,
    publishArticle,
    retractArticle,
    requestToPublishArticle,
    retractRequestToPublishArticle,
    getArticlesPendingReview,
  }
}
