const fp = require('fastify-plugin')
const models = require('../../db/modelsPlugin')

module.exports = fp(models, {
  fastify: '4.x',
  name: 'powerup-models',
})
