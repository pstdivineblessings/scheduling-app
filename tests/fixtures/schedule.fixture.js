const { Schedule } = require("../../src/models");
const { staff1, staff2, staff3, admin } = require("./user.fixture");

const staff1Schedule1 = {
  id: 1,
  workDate: "2022-01-01",
  shiftLength: 8,
  UserId: staff1.id,
  completed: true,
};

const staff1Schedule2 = {
  id: 2,
  workDate: "2022-02-01",
  shiftLength: 8,
  UserId: staff1.id,
  completed: true,
};

const staff1Schedule3 = {
  id: 3,
  workDate: "2022-03-01",
  shiftLength: 8,
  UserId: staff1.id,
  completed: true,
};

const staff2Schedule1 = {
  id: 4,
  workDate: "2022-01-01",
  shiftLength: 8,
  UserId: staff2.id,
  completed: true,
};

const staff2Schedule2 = {
  id: 5,
  workDate: "2022-02-01",
  shiftLength: 8,
  UserId: staff2.id,
  completed: true,
};

const staff2Schedule3 = {
  id: 6,
  workDate: "2022-03-01",
  shiftLength: 8,
  UserId: staff2.id,
  completed: true,
};

const staff3Schedule3 = {
  id: 7,
  workDate: "2022-03-01",
  shiftLength: 8,
  UserId: staff3.id,
  completed: true,
};

const insertSchedules = async (schedules) => {
  await Schedule.bulkCreate(schedules.map((schedule) => ({ ...schedule })));
};

module.exports = {
  staff1Schedule1,
  staff1Schedule2,
  staff1Schedule3,
  staff2Schedule1,
  staff2Schedule2,
  staff2Schedule3,
  staff3Schedule3,
  insertSchedules,
};
