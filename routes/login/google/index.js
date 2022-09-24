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
      const authToken =
        await this.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
      const accessToken = authToken.token.access_token
      log.debug(accessToken)

      const userInfo = await fastify.axios.request({
        url: 'https://openidconnect.googleapis.com/v1/userinfo',
        method: 'get',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        json: true,
      })
      log.debug(userInfo.data)

      return await fastify.auth.finishLogin(reply, {
        pid: 'google',
        socialId: userInfo.data.sub,
        accessToken,
        tokenExpiration: authToken.expires_in,
        socialUserInfo: userInfo.data,
      })
    },
  })
}
