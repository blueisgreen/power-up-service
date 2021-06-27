"use strict";

const fp = require("fastify-plugin");

const options = {
  dotenv: true,
  schema: {
    type: "object",
    required: [
      "PORT",
      "DATABASE_URL",
    ],
    properties: {
      PORT: {
        type: "string",
        default: 3000,
      },
      DATABASE_URL: {
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
