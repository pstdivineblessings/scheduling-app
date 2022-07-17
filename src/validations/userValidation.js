const Joi = require("joi");
const { password, dateFormat } = require("./customValidation");
const ROLES = require("../config/roles");

const userData = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required().custom(password),
  role: Joi.string()
    .required()
    .valid(...Object.values(ROLES)),
  name: Joi.string().required(),
});

const createUser = {
  body: userData,
};

const updateUser = {
  params: Joi.object().keys({
    id: Joi.number().required(),
  }),
  body: userData,
};

const getUsers = {
  query: Joi.object().keys({
    startDate: Joi.string().required().custom(dateFormat),
    endDate: Joi.string().required().custom(dateFormat),
    size: Joi.number(),
    page: Joi.number(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    id: Joi.number().required(),
  }),
};

const deleteUser = {
  params: Joi.object().keys({
    id: Joi.number().required(),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
