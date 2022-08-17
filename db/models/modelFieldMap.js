

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

module.exports = {
  authorColumns,
  authorTableName,
  actionTableName,
  actionColumns,
}
