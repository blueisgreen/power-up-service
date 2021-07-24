const fp = require('fastify-plugin')
const fastify = require('fastify')({ logger: { level: 'trace' } })
const oauthPlugin = require('fastify-oauth2')

const clientId = process.env.OAUTH_GITHUB_CLIENT_ID
const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET
const port = process.env.PORT || 3000

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
    callbackUri: `http://localhost:${port}/login/github/callback`,
  })

  fastify.get('/login/github/callback', async function (request, reply) {
    const token =
      await this.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
    console.log(token.access_token)

    // to refresh token at some point, use
    // const newToken = await this.getNewAccessTokenUsingRefreshToken(token.refresh_token)

    reply.send({ access_token: token.access_token })

    // use access_token to create jwt
  })
})
