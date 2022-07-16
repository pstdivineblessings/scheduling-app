const Joi = require("joi");
const { password, dateFormat } = require("./customValidation");

const userData = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required().custom(password),
  name: Joi.string().required(),
  roles: Joi.array().items(Joi.string().valid("staff", "admin")),
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
