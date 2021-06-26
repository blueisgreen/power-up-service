"use strict";

const fp = require("fastify-plugin");

const options = {
  dotenv: true,
  schema: {
    type: "object",
    required: [
      "PORT",
      "PG_HOST",
      "PG_USER",
      "PG_PASS",
      "PG_DB",
      "PG_CONNECTION",
    ],
    properties: {
      PORT: {
        type: "string",
        default: 3000,
      },
      PG_HOST: {
        type: "string",
      },
      PG_USER: {
        type: "string",
      },
      PG_PASS: {
        type: "string",
      },
      PG_DB: {
        type: "string",
      },
      PG_CONNECTION: {
        type: "string",
      },
    },
  },
};

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
module.exports = fp(async function (fastify, opts) {
  fastify.log.info("loading fastify-env");
  fastify.register(require("fastify-env"), options);
});
