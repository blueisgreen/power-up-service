const USERS = 'users'
const SOCIAL_PROFILES = 'social_profiles'
const USER_ROLES = 'user_roles'
const USER_SESSIONS = 'user_sessions'
const SYSTEM_CODES = 'system_codes'

exports.up = function (knex) {
  return knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"').then(() => {
    return knex.schema
      .createTable(USERS, (table) => {
        table.increments('id') // for internal use
        table
          .uuid('public_id')
          .defaultTo(knex.raw('uuid_generate_v4()'))
          .unique()
        table.string('alias', 42)
        table.string('email', 254)
        table.text('avatar_url')
        table.timestamps(true, true)
        table.timestamp('terms_accepted_at')
        table.timestamp('cookies_accepted_at')
        table.timestamp('email_comms_accepted_at')
        table.integer('account_status_id')
        table
          .foreign('account_status_id')
          .references('id')
          .inTable(SYSTEM_CODES)
      })
      .createTable(SOCIAL_PROFILES, (table) => {
        table.integer('user_id')
        table.integer('social_platform_id')
        table.string('social_id')
        table.string('access_token', 512) // from auth provider; hold for future processing
        table.integer('access_token_exp')
        table.text('social_user_info') // public user info from id provider
        table.timestamps(true, true)
        table.primary(['user_id', 'social_platform_id'])
        table.foreign('user_id').references('id').inTable(USERS)
        table
          .foreign('social_platform_id')
          .references('id')
          .inTable(SYSTEM_CODES)
      })
      .createTable(USER_ROLES, (table) => {
        table.integer('user_id') // foreign key to users
        table.integer('role_id') // foreign key to system_codes
        table.timestamp('granted_at').defaultTo(knex.fn.now())
        table.primary(['user_id', 'role_id'])
        table.foreign('user_id').references('id').inTable(USERS)
        table.foreign('role_id').references('id').inTable(SYSTEM_CODES)
      })
      .createTable(USER_SESSIONS, (table) => {
        table.uuid('user_public_id')
        table.text('auth_token')  // created and managed by app
        table.timestamps(true, true)
        table.primary('user_public_id')
        table.foreign('user_public_id').references('public_id').inTable(USERS)
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
