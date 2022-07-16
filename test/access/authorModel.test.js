'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const authorModel = require('../../db/access/authorModel.js')

test('authorModel creates author', async (t) => {
  const fastify = Fastify()
  fastify.register(lookups)

  await fastify.ready()
  console.log('** Codes ** ==>', JSON.stringify(fastify.lookups.all))
  t.equal(fastify.lookups.all.length, 12)
})

// You can also use plugin with opts in fastify v2
//
// test('support works standalone', (t) => {
//   t.plan(2)
//   const fastify = Fastify()
//   fastify.register(Support)
//
//   fastify.ready((err) => {
//     t.error(err)
//     t.equal(fastify.someSupport(), 'hugs')
//   })
// })
