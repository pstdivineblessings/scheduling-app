const config = require('../config/config');

const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.mysql.db, config.mysql.user, config.mysql.password, {
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
});



const User = require("./userModel")(sequelize);
const Role = require("./roleModel")(sequelize);
const Schedule = require("./scheduleModel")(sequelize);

User.belongsToMany(Role, { through: "UserRoles", foreignKey: "userId" });
Role.belongsToMany(User, { through: "UserRoles", foreignKey: "roleId" });

User.hasMany(Schedule, {
  foreignKey: {
    allowNull: false,
  },
});
Schedule.belongsTo(User);

let db = {};
const models = Object.assign({}, {
  User,
  Role,
  Schedule,
});

db = Object.assign({}, models);

db.models = models;
db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;
