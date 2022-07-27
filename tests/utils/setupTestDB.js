const config = require("../../src/config/config");
const db = require("../../src/models");
const mysql = require('mysql2/promise');

const { truncateDb } = require("../../src/utils/utils");

const setupTestDB = () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });
  beforeEach(async () => {
    await truncateDb(db);
  });
  afterAll(async () => {
    // await db.sequelize.close();
  });
};

module.exports = setupTestDB;
