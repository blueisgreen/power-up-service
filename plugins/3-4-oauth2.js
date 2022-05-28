const fp = require('fastify-plugin')
const oauthPlugin = require('@fastify/oauth2')

/**
 * @see https://github.com/fastify/fastify-oauth2
 */
module.exports = fp(async function (fastify, opts) {
  const { log, register } = fastify
  log.info('loading fastify-oauth2')

  log.debug('setup github ID provider')
  register(oauthPlugin, {
    name: 'githubOAuth2',
    credentials: {
      client: {
        id: process.env.OAUTH_GITHUB_CLIENT_ID,
        secret: process.env.OAUTH_GITHUB_CLIENT_SECRET,
      },
      auth: oauthPlugin.GITHUB_CONFIGURATION,
    },
    startRedirectPath: '/login/github',
    callbackUri: `${process.env.OAUTH_CALLBACK_URL_BASE}/login/github/callback`,
  })

  log.debug('setup google ID provider')
  register(oauthPlugin, {
    name: 'googleOAuth2',
    scope: ['profile', 'email'],
    credentials: {
      client: {
        id: process.env.OAUTH_GOOGLE_CLIENT_ID,
        secret: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
      },
      auth: oauthPlugin.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: '/login/google',
    callbackUri: `${process.env.OAUTH_CALLBACK_URL_BASE}/login/google/callback`,
    callbackUriParams: {
      access_type: 'offline',
    },
  })

  log.debug('setup linkedin ID provider')
  register(oauthPlugin, {
    name: 'linkedInOAuth2',
    scope: ['r_liteprofile', 'r_emailaddress'],
    credentials: {
      client: {
        id: process.env.OAUTH_LINKEDIN_CLIENT_ID,
        secret: process.env.OAUTH_LINKEDIN_CLIENT_SECRET,
      },
      auth: oauthPlugin.LINKEDIN_CONFIGURATION,
    },
    startRedirectPath: '/login/linkedin',
    callbackUri: `${process.env.OAUTH_CALLBACK_URL_BASE}/login/linkedin/callback`,
    callbackUriParams: {
      access_type: 'offline',
    },
  })

  // TODO: set up more OAuth2 providers below
})
