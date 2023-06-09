const authResolver = require("./auth");
const bookingResolver = require("./booking");
const event = require("./event");

const rootResolver = {
  ...authResolver,
  ...bookingResolver,
  ...event,
};

module.exports = rootResolver;
