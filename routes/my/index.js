'use strict'

const ERROR_MESSAGE =
  'Oh my, something went dreadfully wrong. This was not your fault.'

module.exports = async function (fastify, opts) {
  /**
   * Get all account information for the logged in user.
   */
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
  /**
   * Get profile for the logged in user.
   */
  fastify.get(
    '/profile',
    {
      preValidation: fastify.preValidation,
    },
    async (request, reply) => {
      fastify.log.debug(JSON.stringify(request.user))
      fastify.log.info(`look up profile of user: ${request.user.who}`)
      const user = await fastify.data.identity.getUserWithPublicId(request.user.who)
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
      const userPublicId = request.user.publicId
      const updates = request.body

      if (userPublicId === null) {
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
      } else if (updates.userId && updates.userId !== userPublicId) {
        reply.code(400).send({
          error: {
            message: 'User must be changing own profile',
          },
        })
      }

      const user = await fastify.data.identity.updateUser(userPublicId, updates)
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
        await fastify.data.identity.agreeToTerms(request.user.publicId)
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
        await fastify.data.identity.agreeToCookies(request.user.publicId)
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
        await fastify.data.agreeToEmailComms(request.user.publicId)
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
        request.user.publicId
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

  fastify.get('/cookies', {}, async (request, reply) => {
    reply.setCookie(
      'who',
      '3002a7d3-f58a-4afa-965b-c69b08bf888f',
      fastify.cookieOptions
    )
    reply.send(request.cookies)
  })
}
