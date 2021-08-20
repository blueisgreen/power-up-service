const rowToPayload = (row) => {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    relatesTo: row.relates_to,
    purpose: row.purpose,
    message: row.message,
  }
}

const getInquiries = async (fastify) => {
  const { knex } = fastify
  const userRecord = await knex('inquiries').select()
  let result = []
  if (userRecord.length > 0) {
    result = userRecord.map((row) => rowToPayload(row))
  }
  return result
}

const getInquiry = async (fastify, id) => {
  const { knex } = fastify
  const userRecord = await knex('inquiries').select().where('id', '=', id)
  let result = null
  if (userRecord.length > 0) {
    result = rowToPayload(userRecord[0])
  }
  return result
}

const createInquiry = async (fastify, inquiry, user_id, relates_to) => {
  const { knex } = fastify
  const data = {
    purpose: inquiry.purpose,
    message: inquiry.message,
  }
  if (user_id) {
    data[user_id] = user_id
  }
  if (relates_to) {
    data[relates_to] = relates_to
  }
  const inquiryRecord = await knex('inquiries')
    .returning([
      'id',
      'user_id',
      'created_at',
      'relates_to',
      'purpose',
      'message',
    ])
    .insert(data)

  return rowToPayload(inquiryRecord[0])
}

module.exports = {
  getInquiries,
  getInquiry,
  createInquiry,
}
