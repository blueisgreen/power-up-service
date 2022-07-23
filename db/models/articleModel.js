const { generateRandomKey } = require('./util')

const articleTableName = 'articles'
const fullArticleInfoColumns = [
  'articles.public_id as articleKey',
  'articles.headline',
  'articles.byline',
  'articles.cover_art_url as coverArtUrl',
  'articles.synopsis',
  'articles.created_at as createdAt',
  'articles.updated_at as updatedAt',
  'articles.published_at as publishedAt',
  'articles.archived_at as archivedAt',
  'articles.requested_to_publish_at as requestedToPublishAt',
  'users.alias as author',
  'users.public_id as authorKey',
]
const articleInfoColumns = [
  'public_id as articleKey',
  'headline',
  'byline',
  'cover_art_url as coverArtUrl',
  'synopsis',
  'created_at as createdAt',
  'updated_at as updatedAt',
  'published_at as publishedAt',
  'archived_at as archivedAt',
  'requested_to_publish_at as requestedToPublishAt',
]
const articleFullColumns = [
  'public_id as articleKey',
  'headline',
  'byline',
  'cover_art_url as coverArtUrl',
  'synopsis',
  'content',
  'created_at as createdAt',
  'updated_at as updatedAt',
  'published_at as publishedAt',
  'archived_at as archivedAt',
  'requested_to_publish_at as requestedToPublishAt',
]
const articleContentColumns = ['public_id as articleKey', 'content']

module.exports = (fastify) => {
  const { knex, log } = fastify

  /**
   * Creates a new article, mostly a shell to be filled in by its author.
   *
   * @param {string} headline - main title of the article
   * @param {number} authorUserId - system id of article's author
   * @param {string} byline - text description of the author, a.k.a. pen name
   * @returns ArticleInfo everything about the article except the content
   */
  const createArticle = async (headline, authorUserId, byline) => {
    log.debug('articleModel.createArticle')
    const articleKey = generateRandomKey()
    const row = {
      public_id: articleKey,
      headline,
      author_id: authorUserId,
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
  const getMyArticles = async (userId) => {
    log.debug('articleModel.getMyArticles')
    const myArticles = await knex(articleTableName)
      .select(articleInfoColumns)
      .where({ author_id: userId })
    fastify.log.debug('Found ' + myArticles.length + ' articles by ' + userId)
    return myArticles
  }

  const getArticlesInfoOnly = async (queryParams) => {
    log.debug('articleModel.getArticlesInfoOnly')

    const { user, status, limit, offset } = queryParams

    const results = await knex(articleTableName)
      .select(fullArticleInfoColumns)
      .join('users', 'users.id', 'articles.author_id')
      .limit(limit)
      .offset(offset)
      .modify((builder) => {
        if (status === 'pending') {
          builder.whereNotNull('articles.requested_to_publish_at')
        }
        if (status === 'published') {
          builder.whereNotNull('articles.published_at')
        }
        if (status === 'archived') {
          builder.whereNotNull('articles.archived_at')
        }
        if (user) {
          log.warn('asked to filter by user: not implemented')
          // TODO: whenever needed
          //   builder.where('user_public_id', '=', user)
        }
        if (status === 'pending') {
          builder.orderBy('articles.requested_to_publish_at', 'asc')
        } else if (status === 'published') {
          builder.orderBy('articles.published_at', 'desc')
        } else {
          builder.orderBy('articles.created_at', 'desc')
        }
        return builder
      })
    return results
  }

  /**
   * Get all articles that are visible to the public. "Covers" only.
   * Fetch content separately when selected to read.
   *
   * @returns [Article]
   */
  const getPublishedArticleCovers = async () => {
    log.debug('articleModel.getPublishedArticlesInfo')
    return getArticlesInfoOnly({ status: 'published' })
  }

  /**
   * Get metadata for articles owned by the user, presumed to be an author.
   *
   * @param {number} articleKey - system ID of the presumed author with articles
   * @returns Article full article for readers
   */
  const getPublishedArticle = async (articleKey) => {
    log.debug('articleModel.getPublishedArticle')
    const myArticle = await knex(articleTableName)
      .select(articleFullColumns)
      .where({ public_id: articleKey })
      .whereNotNull('articles.published_at')
    return myArticles.length > 0 ? myArticle[0] : null
  }

  /**
   * Get the content of a specific article that is owned by the given user,
   * regardless of status (draft, archived, etc.).
   *
   * @param {string} articleKey - public ID of the article being requested
   * @param {number} userId - system ID of the article's author
   * @returns ArticleContent the content of the article, plus minimal identifying info
   */
  const getArticleContent = async (articleKey, userId) => {
    log.debug('articleModel.getArticleContent')
    const conditions = {
      public_id: articleKey,
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
   * @param {string} articleKey - public ID of the article being requested
   * @returns ArticleContent the content of the article, plus minimal identifying info
   */
  const getArticleContentForEditor = async (articleKey) => {
    log.debug('articleModel.getArticleContent')
    const conditions = {
      public_id: articleKey,
    }
    const myArticle = await knex(articleTableName)
      .select(articleContentColumns)
      .where(conditions)
    return myArticle.length > 0 ? myArticle[0] : null
  }

  /**
   * Change an article using given values.
   *
   * @param {string} articleKey - public ID of the article being requested
   * @param {*} changes
   * @returns Article
   */
  const updateArticle = async (articleKey, changes) => {
    log.debug('articleModel.updateArticle')
    const result = await knex(articleTableName)
      .where('public_id', articleKey)
      .update({
        headline: changes.headline,
        byline: changes.byline,
        cover_art_url: changes.coverArtUrl,
        synopsis: changes.synopsis,
        content: changes.content,
        updated_at: knex.fn.now(),
      })
      .returning(articleFullColumns)
    return result
  }

  /**
   * Change status of article to published.
   *
   * @param {string} articleKey - public ID of the article being requested
   * @returns ArticleInfo
   */
  const publishArticle = async (articleKey) => {
    log.debug('articleModel.publishArticle')
    const result = await knex(articleTableName)
      .where('public_id', articleKey)
      .update({
        published_at: knex.fn.now(),
        requested_to_publish_at: null,
      })
      .returning(articleInfoColumns)
    return result
  }

  /**
   * Change status of article to requested to published.
   *
   * @param {string} articleKey - public ID of the article being requested
   * @returns ArticleInfo
   */
  const requestToPublishArticle = async (articleKey) => {
    log.debug('articleModel.requestToPublishArticle')
    const result = await knex(articleTableName)
      .where('public_id', articleKey)
      .update({
        requested_to_publish_at: knex.fn.now(),
      })
      .returning(articleInfoColumns)
    return result
  }

  /**
   * Un-publishes article.
   *
   * @param {string} articleKey - public ID of the article being requested
   * @returns ArticleInfo
   */
  const retractArticle = async (articleKey) => {
    log.debug('articleModel.retractArticle')
    const result = await knex(articleTableName)
      .where('public_id', articleId)
      .update({
        published_at: null,
        requested_to_publish_at: null,
      })
      .returning(articleInfoColumns)
    return result
  }

  /**
   * Change status of article to archived ("delete" where not really gone).
   *
   * @param {string} articleKey - public ID of the article being requested
   * @returns ArticleInfo
   */
  const archiveArticle = async (articleKey) => {
    log.debug('articleModel.archiveArticle')
    const result = await knex(articleTableName)
      .where('public_id', articleKey)
      .update({
        archived_at: knex.fn.now(),
      })
      .returning(articleInfoColumns)
    return result
  }

  /**
   * Un-archived article.
   *
   * @param {string} articleKey - public ID of the article being requested
   * @returns ArticleInfo
   */
  const reviveArticle = async (articleKey) => {
    log.debug('articleModel.reviveArticle')
    const result = await knex(articleTableName)
      .where('public_id', articleKey)
      .update({
        archived_at: null,
      })
      .returning(articleInfoColumns)
    return result
  }

  /**
   * Deletes article from persistence.
   *
   * @param {string} articleKey - public ID of the article being requested
   */
  const purgeArticle = async (articleKey) => {
    log.debug('articleModel.purgeArticle')
    await knex(articleTableName).where('public_id', articleKey).delete()
  }

  return {
    createArticle,
    getMyArticles,
    getArticlesInfoOnly,
    getPublishedArticleCovers,
    getPublishedArticle,
    getArticleContent,
    getArticleContentForEditor,
    updateArticle,
    publishArticle,
    requestToPublishArticle,
    retractArticle,
    archiveArticle,
    reviveArticle,
    purgeArticle,
  }
}
