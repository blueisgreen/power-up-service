const identity = require('../identity')

/**
 * This will recreate the database table 'users'. Any existing data will be lost.
 */
const createUsersTable = async (fastify) => {
  const usersTableName = 'users'
  const { knex, log } = fastify
  await knex.schema.dropTableIfExists(usersTableName)
  await knex.schema.createTable(usersTableName, (table) => {
    table.increments('id') // never expose this
    table.uuid('public_id').defaultTo(knex.raw('uuid_generate_v4()'))  // use externally to identify user
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
  log.info(`created ${usersTableName}`)
}

const createSocialProfileTable = async (fastify) => {
  const socialProfilesTableName = 'social_profiles'
  const { knex, log } = fastify
  await knex.schema.dropTableIfExists(socialProfilesTableName)
  await knex.schema.createTable(socialProfilesTableName, (table) => {
    table.uuid('user_id') // foreign key to users FIXME rename to user_public_id or use a contraint to make the connection obvious
    table.string('social_id')
    table.integer('social_platform_id') // foreign key to system_codes
    table.string('access_token') // keep this handy; might want to check freshness
    table.text('social_user_info') // public user info from id provider
    table.timestamps(true, true)
  })
  log.info(`created ${socialProfilesTableName}`)
}

const createUserRolesTable = async (fastify) => {
  const userRolesTable = 'user_roles'
  const { knex, log } = fastify
  await knex.schema.dropTableIfExists(userRolesTable)
  await knex.schema.createTable(userRolesTable, (table) => {
    table.integer('user_id')  // foreign key to users
    table.integer('role_id')  // foreign key to system_codes
    table.timestamp('granted_at').defaultTo(knex.fn.now())
    table.primary(['user_id', 'role_id'])
  })
}

const loadAdminUser = async (fastify) => {
  const user = await identity.registerUser(fastify, 'github', 'fakeAccessToken', sampleFromGithub)
  await identity.grantRoles(fastify, user.public_id, ['admin', 'editor'])

}

const rebuildSchema = async (fastify) => {
  await createUsersTable(fastify)
  await createUserRolesTable(fastify)
  await createSocialProfileTable(fastify)
  await loadAdminUser(fastify)
}

module.exports = {
  rebuildSchema,
}

const sampleFromGithub = {
  login: 'blueisgreen',
  id: 74470787,
  node_id: 'MDQ6VXNlcjc0NDcwNzg3',
  avatar_url: 'https://avatars.githubusercontent.com/u/74470787?v=4',
  gravatar_id: '',
  url: 'https://api.github.com/users/blueisgreen',
  html_url: 'https://github.com/blueisgreen',
  followers_url: 'https://api.github.com/users/blueisgreen/followers',
  following_url:
    'https://api.github.com/users/blueisgreen/following{/other_user}',
  gists_url: 'https://api.github.com/users/blueisgreen/gists{/gist_id}',
  starred_url:
    'https://api.github.com/users/blueisgreen/starred{/owner}{/repo}',
  subscriptions_url: 'https://api.github.com/users/blueisgreen/subscriptions',
  organizations_url: 'https://api.github.com/users/blueisgreen/orgs',
  repos_url: 'https://api.github.com/users/blueisgreen/repos',
  events_url: 'https://api.github.com/users/blueisgreen/events{/privacy}',
  received_events_url:
    'https://api.github.com/users/blueisgreen/received_events',
  type: 'User',
  site_admin: false,
  name: 'Dave Mount',
  company: 'Happy Spirit Publishing',
  blog: 'https://www.happyspiritpublishing.com',
  location: 'San Ramon, CA',
  email: null,
  hireable: null,
  bio: 'Getting a clean start for my new project to educate the world about Gen IV nuclear power generation. \r\na.k.a. @ajeGames, @happyspiritgames',
  twitter_username: 'ZanzibarNuclear',
  public_repos: 5,
  public_gists: 0,
  followers: 0,
  following: 1,
  created_at: '2020-11-14T20:14:24Z',
  updated_at: '2021-07-24T00:08:07Z',
}
