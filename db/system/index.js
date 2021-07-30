const getCodes = async (fastify, category) => {
    const { knex, log } = fastify
    const codeRecords = await knex('system_codes')
        .select(['public_id', 'display_name'])
        .where('category_id', '=', category)  // convert category public id to system_codes.id

    return codeRecords
}

const getCategories = async (fastify) => {
    const { knex, log } = fastify
    const codeRecords = await knex('system_codes')
        .select(['public_id', 'display_name'])
        .whereIsNull('category_id')

    return codeRecords
}
