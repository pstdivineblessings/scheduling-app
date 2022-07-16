const db = require("../../src/models");
const bcrypt = require("bcryptjs");
const faker = require("faker");
const { adminRole, staffRole } = require("../fixtures/role.fixture");
const { User, Role } = require("../../src/models");

const password = "Password@22";
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

const admin = await User.create({
  id: 1,
  name: "Admin User",
  username: "admin",
  password,
});
await admin.addRole(adminRole);
await admin.addRole(adminRole);


const staff1 = User.create({
  id: 2,
  name: faker.name.findName(),
  username: "staff1",
  password,
});

const insertUsers = async (users) => {
  await User.insertMany(
    users.map((user) => ({ ...user, password: hashedPassword }))
  );
};

module.exports = {
  userOne,
  userTwo,
  admin,
  insertUsers,
};
