'use strict'

module.exports = async function (fastify, opts) {
  const { log } = fastify

  fastify.get('/callback', async function (request, reply) {
    log.debug('login.github')

    const authToken =
      await this.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
    const accessToken = authToken.token.access_token
    log.debug(accessToken)

    // try to get user info from GitHub
    const userInfo = await fastify.axios.request({
      url: 'https://api.github.com/user',
      method: 'get',
      headers: {
        Authorization: `token ${accessToken}`,
      },
    })

    return await fastify.auth.finishLogin(reply, {
      pid: 'github',
      socialId: userInfo.data.id,
      accessToken,
      tokenExpiration: authToken.expires_in,
      socialUserInfo: userInfo.data,
    })
  })
}
