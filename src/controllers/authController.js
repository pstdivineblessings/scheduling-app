const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { authService, userService } = require("../services");

const signin = catchAsync(async (req, res) => {
  const { username, password } = req.body;

  const result = await authService.signin(username, password);

  res.json(result);
});

const signup = catchAsync(async (req, res) => {
  const result = await userService.signup(req.body);

  res.status(httpStatus.CREATED).send(result);
});

const refreshToken = catchAsync(async (req, res) => {
  const accessToken = await authService.refreshToken(req.body.refreshToken);

  res.json({ accessToken });
});

const signout = catchAsync(async (req, res) => {
  await authService.signout(req.body.refreshToken);

  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  signin,
  signup,
  signout,
  refreshToken,
};
