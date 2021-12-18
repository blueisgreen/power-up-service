const { inquiryColumns } = require('./modelFieldMap')

module.exports = (fastify) => {
  const { knex, log } = fastify

  const getInquiries = async () => {
    const inquiries = await knex('inquiries')
      .select(inquiryColumns)
      .orderBy('created_at', 'desc')
    return inquiries
  }

  const getInquiriesByUser = async (userPublicId) => {
    const inquiries = await knex('inquiries')
      .select(inquiryColumns)
      .join('users', 'users.id', '=', 'inquiries.user_id')
      .where('users.public_id', '=', userPublicId)
      .whereNull('relates_to')
      .orderBy('inquiries.created_at', 'desc')
    return inquiries
  }

  const getRelatedInquiries = async (relatedId) => {
    const related = await knex('inquiries')
      .select(inquiryColumns)
      .where('relates_to', '=', relatedId)
      .orderBy('inquiries.created_at', 'asc')
    return related
  }

  const getInquiry = async (id) => {
    const inquiry = await knex('inquiries')
      .select(inquiryColumns)
      .where('id', '=', id)
    return inquiry
  }

  const createInquiry = async (inquiry, user_id, relates_to) => {
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
    const inquiryRecord = await knex('inquiries')
      .returning(inquiryColumns)
      .insert(data)
    return inquiryRecord[0]
  }

  return {
    getInquiries,
    getInquiriesByUser,
    getRelatedInquiries,
    getInquiry,
    createInquiry,
  }
}
