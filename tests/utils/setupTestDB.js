const config = require("../../src/config/config");
const db = require("../../src/models");
const { truncateDb } = require("../../src/utils/utils");

const setupTestDB = () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    // console.log("Connected to Mysql on test database");
  });
  beforeEach(async () => {
    await truncateDb(db);
  });
  afterAll(async () => {
    // await db.sequelize.close();
  });
};

module.exports = setupTestDB;
