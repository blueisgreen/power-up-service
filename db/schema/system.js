
const createSystemCodesTable = async (fastify) => {
  const systemCodesTableName = 'system_codes'
  const { knex, log } = fastify
  await knex.schema.dropTableIfExists(systemCodesTableName)
  await knex.schema.createTable(systemCodesTableName, (table) => {
    table.increments('id')
    table.string('public_id')
    table.string('display_name') // someday may want to localize
    table.integer('parent_id') // establish heirarchy of codes
  })
  log.info(`created ${systemCodesTableName}`)
  const categories = await knex(systemCodesTableName).insert(
    [
      { public_id: 'role', display_name: 'Role' },
      { public_id: 'accountStatus', display_name: 'Account Status' },
      { public_id: 'socialPlatform', display_name: 'Social Platform' },
    ], ['id', 'public_id']
  )
  const roleCat = categories.find(cat => cat.public_id === 'role')
  await knex(systemCodesTableName).insert(
    [
      {public_id: 'admin', display_name: 'System Administrator', parent_id: roleCat.id },
      {public_id: 'editorInChief', display_name: 'Editor in Chief', parent_id: roleCat.id },
      {public_id: 'member', display_name: 'Member', parent_id: roleCat.id },
      {public_id: 'author', display_name: 'Author', parent_id: roleCat.id },
      {public_id: 'editor', display_name: 'Editor', parent_id: roleCat.id },
    ]
  )
  const accountStatusCat = categories.find(cat => cat.public_id === 'accountStatus')
  await knex(systemCodesTableName).insert([
    {
      public_id: 'active',
      display_name: 'Active',
      parent_id: accountStatusCat.id,
    },
    {
      public_id: 'suspended',
      display_name: 'Suspended',
      parent_id: accountStatusCat.id,
    },
    {
      public_id: 'canceled',
      display_name: 'Canceled',
      parent_id: accountStatusCat.id,
    },
    {
      public_id: 'archived',
      display_name: 'Archived',
      parent_id: accountStatusCat.id,
    },
  ])
  const socialPlatformCat = categories.find(cat => cat.public_id === 'socialPlatform')
  await knex(systemCodesTableName).insert([
    {
      public_id: 'github',
      display_name: 'GitHub',
      parent_id: socialPlatformCat.id,
    },
    {
      public_id: 'google',
      display_name: 'Google',
      parent_id: socialPlatformCat.id,
    },
    {
      public_id: 'linkedIn',
      display_name: 'Linked In',
      parent_id: socialPlatformCat.id,
    },
    {
      public_id: 'twitter',
      display_name: 'Twitter',
      parent_id: socialPlatformCat.id,
    },
  ])
  log.info(`loaded codes into ${systemCodesTableName}`)
}

const rebuildSchema = async (fastify) => {
  await createSystemCodesTable(fastify)
}

module.exports = {
  rebuildSchema,
}
