const catchAsync = require("../utils/catchAsync");
const httpStatus = require("http-status");
const { userService } = require("../services");

const create = catchAsync(async (req, res) => {
  const user = await userService.create(req.body);
  res.status(httpStatus.CREATED).send({ user });
});

const update = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.id, req.body);
  res.send({ message: "User updated successfully", user });
});

const findAll = catchAsync(async (req, res) => {
  const options = ({ startDate, endDate, page, size } = req.query);
  const result = await userService.queryUsers(options);
  res.send(result);
});

const findOne = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.send(user);
});

const deleteOne = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  create,
  findOne,
  findAll,
  deleteOne,
  update,
};
