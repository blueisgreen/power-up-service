
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
  await knex(systemCodesTableName).insert(
    [
      { public_id: 'role', display_name: 'Role' },
      { public_id: 'accountStatus', display_name: 'Account Status' },
      { public_id: 'socialPlatform', display_name: 'Social Platform' },
    ]
  )
  log.info(`loaded codes into ${systemCodesTableName}`)
}

const rebuildSchema = async (fastify) => {
  await createSystemCodesTable(fastify)
}

module.exports = {
  rebuildSchema,
}
