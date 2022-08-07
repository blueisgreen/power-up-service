'use strict'

module.exports = async function (fastify, opts) {
  const { log } = fastify

  // handle security for all workbench routes
  //  - restricted to author, editor, editor-in-chief
  //  - different access based on role
  //
  fastify.all(
    '/',
    {
      // FIXME: make sure user is author or editor, and reject if not. also make it clear in request
      preValidation: [fastify.preValidation],
    },
    (request, reply) => {
    }
  )
}
