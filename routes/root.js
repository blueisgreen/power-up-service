"use strict";
const path = require("path");
const fs = require("fs");

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    return { root: true };
  });
};

module.exports.options = {
  https: {
    key: fs.readFileSync(path.join(__dirname, "../../local/server.key")),
    cert: fs.readFileSync(path.join(__dirname, "../../local/server.cert")),
  },
};
