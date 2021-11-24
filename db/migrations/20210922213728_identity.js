const USERS = 'users'
const SOCIAL_PROFILES = 'social_profiles'
const USER_ROLES = 'user_roles'
const USER_SESSIONS = 'user_sessions'

exports.up = function (knex) {
  return knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"').then(() => {
    return knex.schema
      .createTable(USERS, (table) => {
        table.increments('id') // never expose this
        table.uuid('public_id').defaultTo(knex.raw('uuid_generate_v4()')) // use externally to identify user
        table.string('screen_name') // nicer way to identify, enforce uniqueness in code?
        table.string('email') // need more around verification
        table.string('avatar_url')
        table.text('session_token') // FIXME move to separate table for indexing and to keep it out of user profile
        table.timestamps(true, true)
        table.timestamp('terms_accepted_at')
        table.timestamp('cookies_accepted_at')
        table.timestamp('email_comms_accepted_at')
        table.integer('account_status_id') // foreign key to system_codes
      })
      .createTable(USER_SESSIONS, (table) => {
        table.uuid('user_public_id')
        table.text('auth_token') // FIXME or specify string length bigger than default
        table.timestamps(true, true)
        table.primary('user_public_id')
      })
      .createTable(SOCIAL_PROFILES, (table) => {
        table.uuid('user_id') // foreign key to users FIXME rename to user_public_id or use a contraint to make the connection obvious
        table.uuid('user_public_id') // foreign key to users FIXME transition queries to this; clean up above
        table.string('social_id')
        table.integer('social_platform_id') // foreign key to system_codes
        table.string('access_token') // keep this handy; might want to check freshness
        table.text('social_user_info') // public user info from id provider
        table.timestamps(true, true)
        table.primary(['user_id', 'social_platform_id'])
      })
      .createTable(USER_ROLES, (table) => {
        table.integer('user_id') // foreign key to users
        table.integer('role_id') // foreign key to system_codes
        table.timestamp('granted_at').defaultTo(knex.fn.now())
        table.primary(['user_id', 'role_id'])
      })
  })
}

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists(USER_ROLES)
    .dropTableIfExists(SOCIAL_PROFILES)
    .dropTableIfExists(USER_SESSIONS)
    .dropTableIfExists(USERS)
}
