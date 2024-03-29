const { dateIsValid } = require('../util')

const actionTableName = 'actions'
const actionColumns = [
  'created_at as createdAt',
  'action_code as actionCode',
  'user_public_id as userKey',
  'details',
]
module.exports = (fastify) => {
  const { knex, log } = fastify

  const capture = async (userKey, code, details) => {
    log.debug('actionModel.capture')
    await knex(actionTableName).insert({
      action_code: code,
      user_public_id: userKey,
      details,
    })
    return
  }

  /*
  == FILTER AND SORT
  select * from actions
  where created_at >= '03-18-2022' and created_at < '04-04-2022'
  and user_public_id = '127c9a89-8dc9-4ed9-a5b4-05c00e058f57'
  order by created_at desc
  limit(N)
  offset(N*Y)

  == COUNT
  select count(id) from actions
  where created_at >= '03-18-2022' and created_at < '04-04-2022'
  and user_public_id = '127c9a89-8dc9-4ed9-a5b4-05c00e058f57'

  == UNIQUE USERS
  select distinct user_public_id from actions
  where created_at >= '03-18-2022' and created_at < '04-04-2022'

  */

  /**
   * Return all activities records that match given filters.
   * @param {*} on Date to restrict view or unrestricted if not passed
   * @returns
   */
  const getActions = async (queryParams) => {
    log.debug('actionModel.getActions')
    // figure out the right format for date in query

    const { start, end, user, action, limit, offset } = queryParams

    const results = await knex(actionTableName)
      .select(actionColumns)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .modify((builder) => {
        if (start && dateIsValid(start)) {
          builder.where('created_at', '>=', start)
        }
        if (end && dateIsValid(end)) {
          builder.where('created_at', '<', end)
        }
        if (action) {
          builder.where('action_code', '=', action)
        }
        if (user) {
          builder.where('user_public_id', '=', user)
        }
        return builder
      })

    return results
  }

  return {
    capture,
    getActions,
  }
}
