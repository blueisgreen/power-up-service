'use strict'

const identity = require('../../db/identity')

const ERROR_MESSAGE =
  'Oh my, something went dreadfully wrong. This was not your fault.'

module.exports = async function (fastify, opts) {
  fastify.get(
    '/',
    {
      preValidation: fastify.preValidation,
    },
    async (request, reply) => {
      const user = request.user
      // const user = await identity.getUser(fastify, publicId)
      return request.user
    }
  )
  fastify.get(
    '/profile',
    {
      preValidation: fastify.preValidation,
    },
    async (request, reply) => {
      const user = await identity.getUser(fastify, request.user.publicId)
      reply.send(user)
    }
  )
  fastify.put(
    '/profile',
    {
      preValidation: fastify.preValidation,
    },
    async (request, reply) => {
      const userId = request.user.publicId
      const updates = request.body

      if (userId === null) {
        reply.code(400).send({
          error: {
            message: 'User must be making the request',
          },
        })
      } else if (updates === null) {
        reply.code(400).send({
          error: {
            message: 'Profile updates are required',
          },
        })
      } else if (updates.userId && updates.userId !== userId) {
        reply.code(400).send({
          error: {
            message: 'User must be changing own profile',
          },
        })
      }

      const user = await identity.updateUser(fastify, userId, updates)
      reply.send(user)
    }
  )
  fastify.put(
    '/termsOK',
    {
      preValidation: fastify.preValidation,
    },
    async (request, reply) => {
      try {
        await identity.agreeToTerms(fastify, request.user.publicId)
        reply.code(204).send()
      } catch (err) {
        fastify.log.error(err)
        reply.code(500).send({ error: ERROR_MESSAGE })
      }
    }
  )
  fastify.put(
    '/cookiesOK',
    {
      preValidation: fastify.preValidation,
    },
    async (request, reply) => {
      try {
        await identity.agreeToCookies(fastify, request.user.publicId)
        reply.code(204).send()
      } catch (err) {
        reply.code(500).send({ error: ERROR_MESSAGE })
      }
    }
  )
  fastify.put(
    '/emailCommsOK',
    {
      preValidation: fastify.preValidation,
    },
    async (request, reply) => {
      try {
        await identity.agreeToEmailComms(fastify, request.user.publicId)
        reply.code(204).send()
      } catch (err) {
        reply.code(500).send({ error: ERROR_MESSAGE })
      }
    }
  )
}
