"use strict";

const fp = require("fastify-plugin");

/**
 * This plugin handles favicon service.
 *
 * @see https://github.com/smartiniOnGitHub/fastify-favicon
 */
module.exports = fp(async function (fastify, opts) {
  fastify.log.info("loading fastify-favicon");
  fastify.register(require("fastify-favicon"), {
    errorHandler: false,
  });
});
