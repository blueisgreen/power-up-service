'use strict'

module.exports = async function (fastify, opts) {
  const { log } = fastify
  const uuidv4 = require('uuid').v4

  fastify.get('/callback', async function (request, reply) {
    const authToken =
      await this.linkedInOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
    const accessToken = authToken.token.access_token
    log.debug(accessToken)

    /**
     * endpoints
     * /me
     * /emailAddress
     */

    const userInfo = await fastify.axios.request({
      url: 'https://api.linkedin.com/v2/me',
      method: 'get',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      json: true,
    })
    log.debug(JSON.stringify(userInfo.data))

    return await fastify.auth.finishLogin(reply, {
      pid: 'linkedin',
      socialId: userInfo.data.id,
      accessToken,
      tokenExpiration: authToken.expires_in,
      socialUserInfo: userInfo.data,
    })
  })
}
