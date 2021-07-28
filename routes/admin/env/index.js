'use strict'

// example of verifying jwt

module.exports = async function (fastify, opts) {
  fastify.get(
    "/",
    {
      preValidation: [fastify.authenticate]
    },
    async function(request, reply) {
      return request.user
    }
  )
}
