require('factory-girl-sequelize')();

// Factories:
require("./users");
require("./posts");
require("./user_rates_posts");

module.exports = require('factory-girl');