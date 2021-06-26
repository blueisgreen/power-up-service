"use strict";

const fp = require("fastify-plugin");

/**
 * This plugin handles favicon service.
 *
 * @see https://github.com/smartiniOnGitHub/fastify-knexjs
 */
module.exports = fp(async function (fastify, opts) {
  const { PG_HOST, PG_USER, PG_PASS, PG_DB } = fastify.config
  fastify.log.info("loading fastify-knexjs");
  fastify.register(
    require("fastify-knexjs"),
    {
      client: "pg",
      debug: true,
      version: "8.6",
      connection: {
        host: PG_HOST,
        user: PG_USER,
        password: PG_PASS,
        database: PG_DB,
      },
    },
    (err) => {
      fastify.log.error(err);
    }
  );
});
