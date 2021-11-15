'use strict'

const support = require('../../db/access/support')
const identity = require('../../db/access/identity')

const ERROR_MESSAGE =
  'Oh my, something went dreadfully wrong. This was not your fault.'

module.exports = async function (fastify, opts) {
  /**
   * Get all inquiries.
   */
  fastify.get('/', async (request, reply) => {
    const inquiries = await support.getInquiries(fastify)
    reply.send(inquiries)
  })

  /**
   * Get inquiries for a given user.
   */
  fastify.get('/user/:id', async (request, reply) => {
    const id = request.params.id
    const inquiries = await support.getInquiriesByUser(fastify, id)
    reply.send(inquiries)
  })

  /**
   * Create an inquiry.
   */
  fastify.post(
    '/',
    {
      preValidation: fastify.preValidation,
    },
    async (request, reply) => {
      let userId = null
      if (request.user) {
        const user = await identity.getUser(fastify, request.user.publicId)
        if (user) {
          userId = user.id
        } else {
          console.log('weird, logged in user not found')
        }
      }
      const inquiry = await support.createInquiry(fastify, request.body, userId)
      reply.send(inquiry)
    }
  )

  /**
   * Get a specific inquiry.
   */
  fastify.get('/:id', async (request, reply) => {
    const inquiry = await support.getInquiry(fastify, request.params.id)
    if (!inquiry) {
      reply.code(404).send()
    }
    reply.send(inquiry)
  })

  /**
   * Get responses to a given inquiry.
   */
  fastify.get(
    '/related/:id',
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
}
