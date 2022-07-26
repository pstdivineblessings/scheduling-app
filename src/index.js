const db = require("./models");
const app = require("./app");
const config = require("./config/config");
const logger = require("./config/logger");

const { truncateDb } = require("./utils/utils");

let server;
db.sequelize.authenticate().then(async () => {
  // db.sequelize.sync({ alter: true }).then(() => {
  // db.sequelize.sync({ force: true }).then(() => {
  // await db.sequelize.truncate({ cascade: true });
  logger.info("Connected to Mysql");

  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port} --latest update`);
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
