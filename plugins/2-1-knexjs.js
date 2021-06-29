"use strict";

const fp = require("fastify-plugin");

/**
 * This plugin handles favicon service.
 *
 * @see https://github.com/smartiniOnGitHub/fastify-knexjs
 */
module.exports = fp(async function (fastify, opts) {
  fastify.log.info("loading fastify-knexjs");
  fastify.register(
    require("fastify-knexjs"),
    {
      client: "pg",
      debug: true,
      version: "8.6",
      connection: process.env.DATABASE_URL,
    },
    (err) => {
      fastify.log.error(err);
    }
  );
});
