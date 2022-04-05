const { actionColumns } = require('./modelFieldMap')

module.exports = (fastify) => {
  const { knex, log } = fastify

  const capture = async (code, details, userKey) => {
    log.debug('actionModel.capture')
    await knex('actions').insert({
      action_code: code,
      details,
      user_public_id: userKey,
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

    // FIXME: deal properly with dates
    let startTS, endTS
    if (start) {
      try {
        startTS = new Date(start)
      } catch (err) {
        console.log(err)
        startTS
      }
    }
    if (end) {
      try {
        endTS = new Date(end)
      } catch (err) {
        console.log(err)
        endTS
      }
    }

    const results = await knex('actions')
      .select('created_at', 'action_code', 'details', 'user_public_id')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .modify((builder) => {
        if (startTS) {
          builder.where('created_at', '>=', startTS.toISOString)
        }
        if (endTS) {
          builder.where('created_at', '<', endTS.toISOString)
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
