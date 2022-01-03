'use strict'

module.exports = async function (fastify, opts) {
  /**
   * Get all inquiries.
   */
  fastify.get('/', async (request, reply) => {
    const inquiries = await fastify.data.support.getInquiries()
    reply.send(inquiries)
  })

  /**
   * Get inquiries for a given user.
   */
  fastify.get('/user/:id', async (request, reply) => {
    const id = request.params.id
    const inquiries = await fastify.data.support.getInquiriesByUser(id)
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
        const user = await fastify.data.identity.getUserWithPublicId(
          request.userKey
        )
        if (user) {
          userId = user.id
        } else {
          console.log('weird, logged in user not found')
        }
      }
      fastify.log.debug(JSON.stringify(request.body))
      const inquiry = await fastify.data.support.createInquiry(
        request.body,
        userId
      )
      reply.send(inquiry)
    }
  )

  /**
   * Get a specific inquiry.
   */
  fastify.get('/:id', async (request, reply) => {
    const inquiry = await fastify.data.support.getInquiry(request.params.id)
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
      const inquiries = await fastify.data.support.getRelatedInquiries(
        request.params.id
      )
      reply.send(inquiries)
    }
  )
}
