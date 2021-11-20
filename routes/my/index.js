'use strict'

const identity = require('../../db/access/identity')
const support = require('../../db/access/support')

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
      const user = await identity.getUser(fastify, request.user.publicId)
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
        await identity.agreeToTerms(fastify, request.user.publicId)
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
        await identity.agreeToCookies(fastify, request.user.publicId)
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
        await identity.agreeToEmailComms(fastify, request.user.publicId)
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
      const inquiries = await support.getInquiriesByUser(
        fastify,
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
      const inquiries = await support.getRelatedInquiries(
        fastify,
        request.params.id
      )
      reply.send(inquiries)
    }
  )

  fastify.get(
    '/cookies',
    {
      preValidation: fastify.preValidation,
    },
    async (request, reply) => {
      console.log(request.cookies)
      console.log('hostname', request.hostname)
      const cookieOptions = {
        path: '/',
        sameSite: 'Strict',
      }

      reply.setCookie('last-contact', new Date(), cookieOptions)
      reply.send(request.cookies)
    }
  )
}
