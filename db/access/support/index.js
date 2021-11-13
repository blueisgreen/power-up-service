const columnsToReturn = [
  'inquiries.id',
  'inquiries.user_id as userId',
  'inquiries.created_at as createdAt',
  'inquiries.relates_to as relatesTo',
  'purpose',
  'message',
]

const getInquiries = async (fastify) => {
  const { knex } = fastify
  const inquiries = await knex('inquiries')
    .select(columnsToReturn)
    .orderBy('created_at', 'desc')
  return inquiries
}

const getInquiriesByUser = async (fastify, userPublicId) => {
  const { knex } = fastify
  const inquiries = await knex('inquiries')
    .select(columnsToReturn)
    .join('users', 'users.id', '=', 'inquiries.user_id')
    .where('users.public_id', '=', userPublicId)
    .whereNull('relates_to')
    .orderBy('inquiries.created_at', 'desc')
  return inquiries
}

const getRelatedInquiries = async (fastify, relatedId) => {
  const { knex } = fastify
  const related = await knex('inquiries')
    .select(columnsToReturn)
    .where('relates_to', '=', relatedId)
    .orderBy('inquiries.created_at', 'asc')
}

const getInquiry = async (fastify, id) => {
  const { knex } = fastify
  const inquiry = await knex('inquiries')
    .select(columnsToReturn)
    .where('id', '=', id)
  return inquiry
}

const createInquiry = async (fastify, inquiry, user_id, relates_to) => {
  const { knex } = fastify
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
    .returning(columnsToReturn)
    .insert(data)
  return inquiryRecord[0]
}

module.exports = {
  getInquiries,
  getInquiriesByUser,
  getRelatedInquiries,
  getInquiry,
  createInquiry,
}
