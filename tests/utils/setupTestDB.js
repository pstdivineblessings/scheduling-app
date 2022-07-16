const config = require("../../src/config/config");
const db = require("../../src/models");
// const config = require("../../config/config");

const truncateDb = async () => {
  for (const key in db.models) {
    await db.models[key].destroy({ where: {}, force: true });
  }
};

const setupTestDB = () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    console.log("Connected to Mysql on test database");
  });
  beforeEach(async () => {
    await truncateDb();
  });
  afterAll(async () => {
    await db.sequelize.close();
  });
};

module.exports = setupTestDB;
