exports.up = function (knex) {
  return knex('users')
    .returning(['id', 'alias'])
    .insert({
      public_id: 'd25a4ac6-b1f2-4cc0-85f0-f85b9e5a703e',
      alias: 'Zanzibar',
      email: 'zanzibar@happyspiritpublishing.com',
    })
    .onConflict('public_id')
    .merge()
    .then(async (userRow) => {
      const zanzibar = userRow[0]
      const codeRow = await knex('system_codes')
        .where('code', '=', 'bypass')
        .select('id')
      const pid = codeRow[0].id
      console.log('pid code', pid)

      const profile = await knex('social_profiles')
        .returning(['user_id', 'social_platform_id', 'social_id', 'created_at'])
        .insert({
          user_id: zanzibar.id,
          social_platform_id: pid,
          social_id: 'blargyblargypants',
          access_token: 'openthedoorandletmein-notbythehairofmychinnychinchin',
        })
      console.log('profile', profile)
    })
}

exports.down = function (knex) {
  return async () => {
    await knex('social_profiles')
      .where(
        'access_token',
        '=',
        'openthedoorandletmein-notbythehairofmychinnychinchin'
      )
      .del()

    await knex('user_sessions')
      .where('user_public_id', '=', 'd25a4ac6-b1f2-4cc0-85f0-f85b9e5a703e')
      .del()

    await knex('users')
      .where('public_id', '=', 'd25a4ac6-b1f2-4cc0-85f0-f85b9e5a703e')
      .del()
  }
}
