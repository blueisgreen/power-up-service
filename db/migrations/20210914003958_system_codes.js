exports.up = function (knex) {
  return knex.schema
    .createTable('system_codes', function (table) {
      table.increments()
      table.string('public_id').notNullable()
      table.string('display_name').notNullable()
      table.integer('parent_id').references('id').inTable('system_codes')
    })
    .then(() => {
      return knex('system_codes')
        .insert(
          [
            { public_id: 'role', display_name: 'Role' },
            { public_id: 'accountStatus', display_name: 'Account Status' },
            { public_id: 'socialPlatform', display_name: 'Social Platform' },
          ],
          ['id', 'public_id']
        )
        .then((rows) => {
          const roleCat = rows.find((cat) => cat.public_id === 'role')
          const accountStatusCat = rows.find(
            (cat) => cat.public_id === 'accountStatus'
          )
          const socialPlatformCat = rows.find(
            (cat) => cat.public_id === 'socialPlatform'
          )
          return knex('system_codes').insert([
            {
              public_id: 'admin',
              display_name: 'System Administrator',
              parent_id: roleCat.id,
            },
            {
              public_id: 'editorInChief',
              display_name: 'Editor in Chief',
              parent_id: roleCat.id,
            },
            {
              public_id: 'member',
              display_name: 'Member',
              parent_id: roleCat.id,
            },
            {
              public_id: 'author',
              display_name: 'Author',
              parent_id: roleCat.id,
            },
            {
              public_id: 'editor',
              display_name: 'Editor',
              parent_id: roleCat.id,
            },
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
        })
    })
}

exports.down = function (knex) {
  return knex.schema.dropTable('system_codes')
}
