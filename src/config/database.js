const fs = require('fs');
const config = require("../config/config");

const dbConfig = {
    username: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.db,
    host: config.mysql.host,
    port: config.mysql.port,
    dialect: config.mysql.dialect,
  };

module.exports = {
  development: {
    ...dbConfig
  },
  test: {
    ...dbConfig
  },
  production: {
    ...dbConfig
  },
};