const userTableName = 'users'
const userColumns = [
  'id',
  'public_id as userKey',
  'alias',
  'email',
  'avatar_url as avatarUrl',
  'created_at as createdAt',
  'updated_at as updatedAt',
  'terms_accepted_at as termsAcceptedAt',
  'cookies_accepted_at as cookiesAcceptedAt',
  'email_comms_accepted_at as emailCommsAcceptedAt',
  'account_status_id as accountStatusId',
]

const authorTableName = 'authors'
const authorColumns = [
  'pen_name as penName',
  'status',
  'created_at as createdAt',
  'updated_at as updatedAt',
]

const actionTableName = 'actions'
const actionColumns = [
  'created_at as createdAt',
  'action_code as actionCode',
  'user_public_id as userKey',
  'details',
]

const systemCodeTableName = 'system_codes'
const systemCodeColumns = [
  'id',
  'code',
  'display_name as displayName',
  'parent_id',
]

module.exports = {
  userColumns,
  userTableName,
  authorColumns,
  authorTableName,
  actionTableName,
  actionColumns,
  systemCodeTableName,
  systemCodeColumns,
}
