const Joi = require("joi");
const { password } = require("./customValidation");

const signup = {
  body: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
  }),
};

const signin = {
  body: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const signout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshToken = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

module.exports = {
  signup,
  signin,
  signout,
  refreshToken,
};
