const USERS = 'users'
const SOCIAL_PROFILES = 'social_profiles'
const USER_ROLES = 'user_roles'

exports.up = function (knex) {
  return knex.schema
    .createTable(USERS, (table) => {
      table.increments('id') // never expose this
      table.uuid('public_id').defaultTo(knex.raw('uuid_generate_v4()')) // use externally to identify user
      table.string('screen_name') // nicer way to identify, enforce uniqueness in code?
      table.string('email') // need more around verification
      table.string('avatar_url')
      table.string('session_token') // jwt; might want to index
      table.timestamps(true, true)
      table.timestamp('terms_accepted_at')
      table.timestamp('cookies_accepted_at')
      table.timestamp('email_comms_accepted_at')
      table.integer('account_status_id') // foreign key to system_codes
    })
    .createTable(SOCIAL_PROFILES, (table) => {
      table.uuid('user_id') // foreign key to users FIXME rename to user_public_id or use a contraint to make the connection obvious
      table.string('social_id')
      table.integer('social_platform_id') // foreign key to system_codes
      table.string('access_token') // keep this handy; might want to check freshness
      table.text('social_user_info') // public user info from id provider
      table.timestamps(true, true)
    })
    .createTable(USER_ROLES, (table) => {
      table.integer('user_id') // foreign key to users
      table.integer('role_id') // foreign key to system_codes
      table.timestamp('granted_at').defaultTo(knex.fn.now())
      table.primary(['user_id', 'role_id'])
    })
}

exports.down = function (knex) {
  knex.schema.dropTable(USER_ROLES).dropTable(SOCIAL_PROFILES).dropTable(USERS)
}
