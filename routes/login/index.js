'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/github/callback', async function (request, reply) {
    const token =
      await this.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
    fastify.log.info(token.access_token)

    // try to get user info from GitHub
    const userInfo = await fastify.axios.request({
      url: 'https://api.github.com/user',
      method: 'get',
      headers: {
        Authorization: `token ${token.access_token}`,
      },
    })
    fastify.log.info('found user info')
    fastify.log.info(JSON.stringify(userInfo.data))

    // to refresh token at some point, use
    // const newToken = await this.getNewAccessTokenUsingRefreshToken(token.refresh_token)

    reply.header('x-access-blargy', token.access_token)
    reply.send({ message: 'Hello, Blargy' })
    // reply.redirect('http://localhost:8080/')

    // use access_token to create jwt
  })
}
