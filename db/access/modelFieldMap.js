const userColumns = [
  'id',
  'public_id as userKey',
  'alias',
  'email',
  'created_at as createdAt',
  'updated_at as updatedAt',
  'terms_accepted_at as termsAcceptedAt',
  'cookies_accepted_at as cookiesAcceptedAt',
  'email_comms_accepted_at as emailCommsAcceptedAt',
  'account_status_id',
]

const inquiryColumns = [
  'inquiries.id',
  'inquiries.user_id as userId',
  'inquiries.created_at as createdAt',
  'inquiries.relates_to as relatesTo',
  'purpose',
  'message',
]

const actionColumns = [
  'created_at as createdAt',
  'action_code as actionCode',
  'user_public_id as userKey',
  'details',
]

module.exports = {
  userColumns,
  inquiryColumns,
  actionColumns,
}
