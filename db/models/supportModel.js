const inquiryTableName = 'inquiries'
const inquiryColumns = [
  'inquiries.id',
  'inquiries.user_id as userId',
  'inquiries.created_at as createdAt',
  'inquiries.relates_to as relatesTo',
  'inquiries.about_article_id as articleId',
  'inquiries.purpose',
  'inquiries.message',
]
const articleMessageColumns = [
  'inquiries.id',
  'inquiries.created_at as createdAt',
  'inquiries.purpose',
  'inquiries.message',
  'articles.public_id as articleKey',
]

module.exports = (fastify) => {
  const { knex, log } = fastify

  const getInquiries = async () => {
    log.debug('supportModel.getInquiries')
    const inquiries = await knex(inquiryTableName)
      .select(inquiryColumns)
      .orderBy('created_at', 'desc')
    return inquiries
  }

  const getInquiriesByUser = async (userPublicId) => {
    log.debug('supportModel.getInquiriesByUser')
    const inquiries = await knex(inquiryTableName)
      .select(inquiryColumns)
      .join('users', 'users.id', '=', 'inquiries.user_id')
      .where('users.public_id', '=', userPublicId)
      .whereNull('relates_to')
      .orderBy('inquiries.created_at', 'desc')
    return inquiries
  }

  const getRelatedInquiries = async (relatedId) => {
    log.debug('supportModel.getRelatedInquiries')
    const related = await knex(inquiryTableName)
      .select(inquiryColumns)
      .where('relates_to', '=', relatedId)
      .orderBy('inquiries.created_at', 'asc')
    return related
  }

  const getInquiry = async (id) => {
    log.debug('supportModel.getInquiry')
    const inquiry = await knex(inquiryTableName)
      .select(inquiryColumns)
      .where('id', '=', id)
    return inquiry
  }

  const createInquiry = async (inquiry, user_id, relates_to) => {
    log.debug('supportModel.createInquiry')
    const data = {
      purpose: inquiry.purpose,
      message: inquiry.message,
    }
    if (user_id) {
      data['user_id'] = user_id
    }
    if (relates_to) {
      data['relates_to'] = relates_to
    }
    const inquiryRecord = await knex(inquiryTableName)
      .returning(inquiryColumns)
      .insert(data)
    return inquiryRecord[0]
  }

  const createMessageAboutArticle = async (
    toAuthorId,
    articleId,
    purpose,
    message
  ) => {
    log.debug('supportModel.createMessageAboutArticle')
    const data = {
      user_id: toAuthorId,
      about_article_id: articleId,
      purpose: purpose,
      message: message,
    }
    const record = await knex(inquiryTableName)
      .returning(inquiryColumns)
      .insert(data)
    return record[0]
  }

  return {
    getInquiries,
    getInquiriesByUser,
    getRelatedInquiries,
    getInquiry,
    createInquiry,
    createMessageAboutArticle,
  }
}
