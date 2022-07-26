const fs = require("fs");
const path = require("path");
const config = require("../config/config");
const Sequelize = require("sequelize");
const { DataTypes } = require("sequelize");
const sequelize = new Sequelize(
  config.mysql.db,
  config.mysql.user,
  config.mysql.password,
  {
    host: config.mysql.host,
    dialect: config.mysql.dialect,
    // dialectOptions: {
    //   socketPath: '/var/run/mysqld/mysqld.sock',
    // },
    port: config.mysql.port,
    pool: {
      max: config.mysql.pool.max,
      min: config.mysql.pool.min,
      acquire: config.mysql.pool.acquire,
      idle: config.mysql.pool.idle,
    },
    logging: config.env === "test" ? false : true,
  }
);

let db = {};
const basename = path.basename(__filename);

fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    const modelPath = path.join(__dirname, file);
    const model = require(modelPath)(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
