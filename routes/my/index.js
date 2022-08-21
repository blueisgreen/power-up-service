'use strict'

const ERROR_MESSAGE =
  'Oh my, something went dreadfully wrong. This was not your fault.'

module.exports = async function (fastify, opts) {

  /**
   * Get profile for the logged in user.
   */
  fastify.get(
    '/profile',
    {
      preValidation: fastify.preValidation,
    },
    async (request, reply) => {
      fastify.log.info(`look up profile of user: ${request.userKey}`)
      const user = await fastify.data.identity.getUser(
        request.userKey
      )
      reply.send(user)
    }
  )
  /**
   * Update profile of the logged in user.
   */
  fastify.put(
    '/profile',
    {
      preValidation: fastify.preValidation,
    },
    async (request, reply) => {
      const userKey = request.userKey
      const updates = request.body

      if (userKey === null) {
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
      } else if (updates.userId && updates.userId !== userKey) {
        reply.code(400).send({
          error: {
            message: 'User must be changing own profile',
          },
        })
      }

      const user = await fastify.data.identity.updateUser(userKey, updates)
      reply.send(user)
    }
  )
  /**
   * Set flag to agree to terms and conditions.
   */
  fastify.put(
    '/termsOK',
    {
      preValidation: fastify.preValidation,
    },
    async (request, reply) => {
      try {
        await fastify.data.identity.agreeToTerms(request.userContext.who)
        reply.code(204).send()
      } catch (err) {
        fastify.log.error(err)
        reply.code(500).send({ error: ERROR_MESSAGE })
      }
    }
  )
  /**
   * Set flag to agree to cookies.
   */
  fastify.put(
    '/cookiesOK',
    {
      preValidation: fastify.preValidation,
    },
    async (request, reply) => {
      try {
        await fastify.data.identity.agreeToCookies(request.userKey)
        reply.code(204).send()
      } catch (err) {
        reply.code(500).send({ error: ERROR_MESSAGE })
      }
    }
  )
  /**
   * Set flag to agree to receive email communication.
   */
  fastify.put(
    '/emailCommsOK',
    {
      preValidation: fastify.preValidation,
    },
    async (request, reply) => {
      try {
        fastify.log.debug('user wants to get more email -- well, okay then!')
        await fastify.data.identity.agreeToEmailComms(
          request.userContext.who
        )
        reply.code(204).send()
      } catch (err) {
        reply.code(500).send({ error: ERROR_MESSAGE })
      }
    }
  )

  fastify.get(
    '/inquiries',
    {
      preValidation: fastify.preValidation,
    },
    async (request, reply) => {
      const inquiries = await fastify.data.support.getInquiriesByUser(
        request.userContext.who
      )
      reply.send(inquiries)
    }
  )

  fastify.get(
    '/inquiries/related/:id',
    {
      preValidation: fastify.preValidation,
    },
    async (request, reply) => {
      const inquiries = await fastify.data.support.getRelatedInquiries(
        request.params.id
      )
      reply.send(inquiries)
    }
  )

  fastify.get(
    '/roles',
    {
      preValidation: fastify.preValidation,
    },
    async (request, reply) => {
      const roles = await fastify.data.identity.getUserRolesWithPublicId(
        request.userContext.who
      )
      reply.send(roles)
    }
  )
}
