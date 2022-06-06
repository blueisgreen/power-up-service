exports.up = function (knex) {
  return knex.schema
    .createTable('system_codes', function (table) {
      table.increments()
      table.string('code').notNullable()
      table.string('display_name').notNullable()
      table.integer('parent_id').references('id').inTable('system_codes')
    })
    .then(() => {
      return knex('system_codes')
        .insert(
          [
            { code: 'userRole', display_name: 'User Role' },
            { code: 'accountStatus', display_name: 'Account Status' },
            { code: 'socialPlatform', display_name: 'Authentication Platform' },
          ],
          ['id', 'code']
        )
        .then((rows) => {
          const userRoleCat = rows.find((cat) => cat.code === 'userRole')
          const accountStatusCat = rows.find(
            (cat) => cat.code === 'accountStatus'
          )
          const socialPlatformCat = rows.find(
            (cat) => cat.code === 'socialPlatform'
          )
          return knex('system_codes').insert([
            {
              code: 'admin',
              display_name: 'System Administrator',
              parent_id: userRoleCat.id,
            },
            {
              code: 'support',
              display_name: 'Member Support',
              parent_id: userRoleCat.id,
            },
            {
              code: 'producer',
              display_name: 'Producer',
              parent_id: userRoleCat.id,
            },
            {
              code: 'editor',
              display_name: 'Editor',
              parent_id: userRoleCat.id,
            },
            {
              code: 'member',
              display_name: 'Member',
              parent_id: userRoleCat.id,
            },
            {
              code: 'author',
              display_name: 'Contributor',
              parent_id: userRoleCat.id,
            },
            {
              code: 'moderator',
              display_name: 'Moderator',
              parent_id: userRoleCat.id,
            },
            {
              code: 'active',
              display_name: 'Active',
              parent_id: accountStatusCat.id,
            },
            {
              code: 'suspended',
              display_name: 'Suspended',
              parent_id: accountStatusCat.id,
            },
            {
              code: 'canceled',
              display_name: 'Canceled',
              parent_id: accountStatusCat.id,
            },
            {
              code: 'archived',
              display_name: 'Archived',
              parent_id: accountStatusCat.id,
            },
            {
              code: 'github',
              display_name: 'GitHub',
              parent_id: socialPlatformCat.id,
            },
            {
              code: 'google',
              display_name: 'Google',
              parent_id: socialPlatformCat.id,
            },
            {
              code: 'linkedin',
              display_name: 'Linked In',
              parent_id: socialPlatformCat.id,
            },
            {
              code: 'twitter',
              display_name: 'Twitter',
              parent_id: socialPlatformCat.id,
            },
          ])
        })
    })
}

exports.down = function (knex) {
  return knex.schema.dropTable('system_codes')
}
