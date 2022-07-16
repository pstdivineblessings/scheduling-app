const Joi = require("joi");
const { dateFormat } = require("./customValidation");

const createSchedule = {
  body: Joi.object().keys({
    username: Joi.string().required(),
    workDate: Joi.string().required().custom(dateFormat),
    shiftLength: Joi.number().required(),
  }),
};

const updateSchedule = {
  params: Joi.object().keys({
    id: Joi.number().required(),
  }),
  body: Joi.object().keys({
    workDate: Joi.string().required().custom(dateFormat),
    shiftLength: Joi.number().required(),
  }),
};

const getUserSchedules = {
  query: Joi.object().keys({
    userId: Joi.number().required(),
    startDate: Joi.string().required().custom(dateFormat),
    endDate: Joi.string().required().custom(dateFormat),
    size: Joi.number(),
    page: Joi.number(),
  }),
};

const getUserScheduleById = {
  params: Joi.object().keys({
    id: Joi.number().required(),
  }),
};

const getUserScheduleByUsername = {
  params: Joi.object().keys({
    username: Joi.number().required(),
  }),
};

const deleteSchedule = {
  params: Joi.object().keys({
    id: Joi.number().required(),
  }),
};

module.exports = {
  createSchedule,
  updateSchedule,
  getUserSchedules,
  getUserScheduleById,
  getUserScheduleByUsername,
  deleteSchedule,
};
