'use strict'

module.exports = async function (fastify, opts) {
  const { log } = fastify

  fastify.route({
    method: 'GET',
    url: '/callback',
    schema: {
      tags: ['authentication'],
      description: 'Handle post-authentication processing.',
    },
    handler: async (request, reply) => {
      log.debug('login.github')

      const authToken =
        await this.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
      const accessToken = authToken.token.access_token
      log.debug(accessToken)

      const userInfo = await fastify.axios.request({
        url: 'https://api.github.com/user',
        method: 'get',
        headers: {
          Authorization: `token ${accessToken}`,
        },
      })
      log.debug(userInfo.data)

      return await fastify.auth.finishLogin(reply, {
        pid: 'github',
        socialId: userInfo.data.id,
        accessToken,
        tokenExpiration: authToken.expires_in,
        socialUserInfo: userInfo.data,
      })
    },
  })
}
