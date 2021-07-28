const fp = require('fastify-plugin')
const oauthPlugin = require('fastify-oauth2')

/**
 * @see https://github.com/fastify/fastify-oauth2
 */
module.exports = fp(async function (fastify, opts) {
  fastify.log.info('loading fastify-oauth2 for github')

  fastify.register(oauthPlugin, {
    name: 'githubOAuth2',
    credentials: {
      client: {
        id: process.env.OAUTH_GITHUB_CLIENT_ID,
        secret: process.env.OAUTH_GITHUB_CLIENT_SECRET,
      },
      auth: oauthPlugin.GITHUB_CONFIGURATION,
    },
    startRedirectPath: '/login/github',
    callbackUri: `${process.env.OAUTH_CALLBACK_BASE}/login/github/callback`,
  })

  // TODO set up more OAuth providers below
})
