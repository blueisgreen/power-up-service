
exports.up = function(knex) {
  return knex.schema.table('social_profiles', (table) => {
    table.string('access_token', 512).alter()
    table.integer('access_token_exp')
  })
};

exports.down = function(knex) {
  return knex.schema.table('social_profiles', (table) => {
    table.string('access_token', 255).alter()
    table.dropColumn('access_token_exp')
  })
};
