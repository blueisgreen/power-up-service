const finishLogin = async (
  fastify,
  reply,
  pid,
  authToken,
  authId,
  authUserData
) => {
  let goTo = 'home'

  let user = await fastify.data.identity.findUserFromSocialProfile(
    pid,
    userInfo.data.id
  )

  // user not found; set up new user
  if (!user) {
    const publicId = uuidv4()
    user = await fastify.data.identity.registerUser(
      pid,
      authToken.access_token,
      userInfo.data,
      publicId,
      authToken.expires_in
    )
    goTo = 'register'
  }

  // record login activity - capture user browser context
  const browserContext = `${request.headers['user-agent']} | ${request.headers['referer']}`
  fastify.data.action.capture(
    'login',
    request.tracker,
    user.userKey,
    browserContext
  )

  // refresh token
  const roles = await fastify.data.identity.getUserRoles(user.id)
  const token = fastify.jwt.sign({
    who: user.userKey,
    alias: user.alias,
    roles,
  })
  await fastify.data.identity.setSessionToken(user.userKey, token)
  reply.setCookie('token', token, fastify.secretCookieOptions)
  reply.redirect(`${process.env.SPA_LANDING_URL}?goTo=${goTo}&token=${token}`)
}

module.exports = {
  finishLogin,
}
