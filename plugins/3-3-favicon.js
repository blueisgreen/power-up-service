"use strict";

const { default: fastifyFavicon } = require("fastify-favicon");
const fp = require("fastify-plugin");

/**
 * This plugin handles favicon service.
 *
 * @see https://github.com/smartiniOnGitHub/fastify-favicon
 */
module.exports = fp(async function (fastify, opts) {
  fastify.log.info("loading fastify-favicon");
  fastify.register(require("fastify-favicon"), {
    path: '../public',
    name: 'favicon.ico',
    errorHandler: false,
  });
});
