const db = require("../../src/models");
const Role = require("../../src/models/roleModel");

const adminRole = await Role.create({
  id: 1,
  name: "admin",
  description: "",
});

const staffRole = await Role.create({
  id: 2,
  name: "staff",
  description: "",
});

module.exports = {
  adminRole,
  staffRole,
};
