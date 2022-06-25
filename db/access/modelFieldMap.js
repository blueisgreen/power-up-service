const userTableName = 'users'
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
  'account_status_id as accountStatusId',
]

const inquiryTableName = 'inquiries'
const inquiryColumns = [
  'inquiries.id',
  'inquiries.user_id as userId',
  'inquiries.created_at as createdAt',
  'inquiries.relates_to as relatesTo',
  'purpose',
  'message',
]

const articleTableName = 'articles'
const articleInfoColumns = [
  'id',
  'headline',
  'author_alias as authorAlias',
  'byline',
  'cover_art_url as coverArtUrl',
  'synopsis',
  'created_at as createdAt',
  'updated_at as updatedAt',
  'published_at as publishedAt',
  'archived_at as archivedAt',
]
const articleContentColumns = ['id', 'content', 'updated_at as updatedAt']

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
  articleTableName,
  articleInfoColumns,
  articleContentColumns,
  inquiryTableName,
  inquiryColumns,
  actionTableName,
  actionColumns,
  systemCodeTableName,
  systemCodeColumns,
}
