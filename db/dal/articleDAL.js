/**
 * trying an idea from a tutorial - what i already have is better
 */

const { generateRandomKey } = require('./util')

const articleInfo = [
  'id',
  'public_id as publicKey',
  'author_id',
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

const ArticleDAL = (knex, log) => {
  const createArticle = async (headline, authorId) => {
    log.debug('createArticle by author ' + authorId + ': ' + headline)
    const newKey = generateRandomKey()
    const row = {
      public_id: newKey,
      headline,
      author_id: authorId,
    }
    const article = await knex('articles').insert(row, articleInfo)
  }

  return { createArticle }
}

module.exports = {
  ArticleDAL
}
