const httpStatus = require("http-status");
const { scheduleService } = require("../services");
const catchAsync = require("../utils/catchAsync");

const create = catchAsync(async (req, res) => {
  const schedule = await scheduleService.createSchedule(req.body);
  res.status(httpStatus.CREATED).send({ schedule });
});

const update = catchAsync(async (req, res) => {
  const schedule = await scheduleService.updateScheduleById(
    req.params.id,
    req.body
  );
  res.send({ message: "Schedule updated successfully", schedule });
});

const findAll = catchAsync(async (req, res) => {
  const options = req.query;
  const result = await scheduleService.querySchedules(options);
  res.send(result);
});

const findOne = catchAsync(async (req, res) => {
  const schedule = await scheduleService.getScheduleById(req.params.id);
  res.send(schedule);
});

const deleteOne = catchAsync(async (req, res) => {
  await scheduleService.deleteScheduleById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  create,
  findOne,
  findAll,
  deleteOne,
  update,
};
