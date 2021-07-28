"use strict";

const fp = require("fastify-plugin");

const options = {
  dotenv: true,
  schema: {
    type: "object",
    required: [
      "PORT",
      "DATABASE_URL",
      "JWT_SECRET",
    ],
    properties: {
      PORT: {
        type: "string",
        default: 3000,
      },
      DATABASE_URL: {
        type: "string",
        default: 'noDB'
      },
      JWT_SECRET: {
        type: "string"
      }
    },
  },
};

/**
 * @see https://github.com/fastify/fastify-env
 */
module.exports = fp(async function (fastify, opts) {
  fastify.log.info("loading fastify-env");
  fastify.register(require("fastify-env"), options);
});
