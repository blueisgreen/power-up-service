const authorTableName = 'authors'
const authorColumns = [
  'pen_name as penName',
  'status',
  'created_at as createdAt',
  'updated_at as updatedAt',
]
const rawColumns = ['pen_name', 'status', 'created_at', 'updated_at']

module.exports = (fastify) => {
  const { knex, log } = fastify

  const createAuthor = async (userId, penName, status = 'untrusted') => {
    log.debug('identity plugin: becomeAuthor')
    const authorRecord = await knex(authorTableName)
      .returning(authorColumns)
      .insert({
        user_id: userId,
        pen_name: penName,
        status: status,
      })
    return authorRecord
  }

  const getInfo = async (userId) => {
    const authorRecord = await knex(authorTableName)
      .select(authorColumns)
      .where('user_id', userId)
    return authorRecord[0]
  }

  const _get = async (userId) => {
    const authorRecord = await knex(authorTableName)
      .select(rawColumns)
      .where('user_id', userId)
    return authorRecord[0]
  }

  return {
    createAuthor,
    getInfo,
    _get,
  }
}
