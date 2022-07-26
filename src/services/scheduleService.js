const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const db = require("../models");
const { User, Schedule } = db;
// const ROLES = require("../config/roles");
const {
  isUptoOneYear,
  getPagination,
  getPagingData,
} = require("../utils/utils");
const sq = db.sequelize;
const { Op } = require("sequelize");

const createSchedule = async (scheduleData) => {
  if (!scheduleData?.completed) {
    scheduleData.completed = true;
  }

  //Getting the user
  const user = await User.findOne({
    where: {
      username: scheduleData.username,
    },
  });

  if (!user) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `The user with username = ${scheduleData.username} is not found`
    );
  }

  // check for existing schedule
  const duplicate = await Schedule.findOne({
    where: {
      userId: user.id,
      workDate: scheduleData.workDate,
    },
  });

  if (duplicate) {
    throw new ApiError(
      httpStatus.CONFLICT,
      `A schedule has already been added for ${user.username} on ${scheduleData.workDate}`
    );
  }

  const schedule = await Schedule.create({
    ...scheduleData,
    UserId: user.id,
  });

  return schedule;
};

const updateScheduleById = async (id, scheduleData) => {
  //Getting the schedule by id
  const scheduleToUpdate = await Schedule.findByPk(id);

  if (!scheduleToUpdate) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `No schedule found with this id = ${id}`
    );
  }

  scheduleToUpdate.set(scheduleData);
  await scheduleToUpdate.save();

  return scheduleToUpdate;
};

const querySchedules = async (options) => {
  let { userId, startDate, endDate, page, size } = options;

  if (!isUptoOneYear(startDate, endDate)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "The maximum period of time is one year."
    );
  }

  const { limit, offset } = getPagination(page, size);

  // console.log({ startDate, endDate, page, limit });

  const schedules = await Schedule.findAndCountAll({
    where: {
      UserId: userId,
      completed: true,
      workDate: {
        [Op.between]: [startDate, endDate],
      },
    },
    offset,
    limit,
  });

  return getPagingData(schedules.rows, schedules.count, page, limit);
};

const getScheduleById = async (id) => {
  return await Schedule.findOne({ where: { id } });
};

const deleteScheduleById = async (id) => {
  const result = await Schedule.destroy({
    where: { id: id },
  });

  if (result === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot delete Schedule with id=${id}. Maybe Schedule was not found!`
    );
  }
};

module.exports = {
  createSchedule,
  updateScheduleById,
  querySchedules,
  getScheduleById,
  deleteScheduleById,
};
