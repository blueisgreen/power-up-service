const loginParams = {
  type: 'object',
  properties: {
    pid: { enum: ['github', 'google', 'linkedin'] },
  },
}

module.exports = {
  loginParams,
}
