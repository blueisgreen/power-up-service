const fp = require('fastify-plugin')
const oauthPlugin = require('fastify-oauth2')

const https = require('https')

const clientId = process.env.OAUTH_GITHUB_CLIENT_ID
const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET
const port = process.env.PORT

module.exports = fp(async function (fastify, opts) {
  fastify.log.info('loading fastify-oauth2')

  fastify.register(oauthPlugin, {
    name: 'githubOAuth2',
    credentials: {
      client: {
        id: clientId,
        secret: clientSecret,
      },
      auth: oauthPlugin.GITHUB_CONFIGURATION,
    },
    startRedirectPath: '/login/github',
    callbackUri: `http://localhost:3000/login/github/callback`,
  })

  // set up more OAuth providers below
})
