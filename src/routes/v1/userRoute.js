const express = require("express");
const validate = require("../../middlewares/validate");
const userController = require("../../controllers/userController");
const ROLES = require("../../config/roles");
const checkRoles = require("../../middlewares/checkRoles");
const verifyJWT = require("../../middlewares/verifyJWT");
const userValidation = require("../../validations/userValidation");

const router = express.Router();

// routes
router
  .route("/")
  .get(
    verifyJWT,
    checkRoles(ROLES.Admin),
    validate(userValidation.getUsers),
    userController.findAll
  )
  .post(
    verifyJWT,
    checkRoles(ROLES.Admin),
    validate(userValidation.createUser),
    userController.create
  );

router
  .route("/:id")
  .get(
    verifyJWT,
    checkRoles(ROLES.Admin),
    validate(userValidation.getUser),
    userController.findOne
  )
  .delete(
    verifyJWT,
    checkRoles(ROLES.Admin),
    validate(userValidation.deleteUser),
    userController.deleteOne
  )
  .patch(
    verifyJWT,
    checkRoles(ROLES.Admin),
    validate(userValidation.updateUser),
    userController.update
  )
  ;

module.exports = router;
