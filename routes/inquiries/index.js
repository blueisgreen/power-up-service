'use strict'

const support = require('../../db/support')
const identity = require('../../db/identity')

const ERROR_MESSAGE =
  'Oh my, something went dreadfully wrong. This was not your fault.'

module.exports = async function (fastify, opts) {
  /**
   * Get all inquiries. TODO: needs to limit return set
   */
  fastify.get('/', async (request, reply) => {
    const inquiries = await support.getInquiries(fastify)
    reply.send(inquiries)
  })

  /**
   * Get all inquiries. TODO: needs to limit return set
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
          console.log('weird, logged in user not found');
        }
      }
      const inquiry = await support.createInquiry(fastify, request.body, userId)
      reply.send(inquiry)
    }
  )

  /**
   * Create a new inquiry record.
   */
  fastify.get('/:id', async (request, reply) => {
    const id = request.params.id
    const inquiry = await support.getInquiry(fastify, id)
    if (!inquiry) {
      reply.code(404).send()
    }
    reply.send(inquiry)
  })
}
