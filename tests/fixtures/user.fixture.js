const bcrypt = require("bcrypt");
const faker = require("faker");
const { User } = require("../../src/models");

const password = "Password@22";
let salt, hashedPassword;
(async () => {
  salt = await bcrypt.genSalt(10);
  hashedPassword = await bcrypt.hash(password, salt);
})();
// const salt = bcrypt.genSaltSync(8);
// const hashedPassword = bcrypt.hashSync(password, salt);

const admin = {
  id: 1,
  name: "Admin User",
  username: "admin",
  role: "admin",
  password,
};

const staff1 = {
  id: 2,
  name: faker.name.findName(),
  username: "staff1",
  role: "staff",
  password,
};

const staff2 = {
  id: 3,
  name: faker.name.findName(),
  username: "staff2",
  role: "staff",
  password,
};

const staff3 = {
  id: 4,
  name: faker.name.findName(),
  username: "staff3",
  role: "staff",
  password,
};

const insertUsers = async (users) => {
  await User.bulkCreate(
    users.map((user) => ({ ...user, password: hashedPassword }))
  );
};

const insertUser = async (user) => {
  return await User.create({ ...user, password: hashedPassword });
};

module.exports = {
  admin,
  staff1,
  staff2,
  staff3,
  insertUsers,
  insertUser,
};
