const express = require("express");
const validate = require("../../middlewares/validate");
const scheduleController = require("../../controllers/scheduleController");
const ROLES = require("../../config/roles");
const checkRoles = require("../../middlewares/checkRoles");
const verifyJWT = require("../../middlewares/verifyJWT");
const scheduleValidation = require("../../validations/scheduleValidation");

const router = express.Router();

router
  .route("/")
  .get(
    verifyJWT,
    checkRoles(ROLES.Staff, ROLES.Admin),
    validate(scheduleValidation.getUserSchedules),
    scheduleController.findAll
  )
  .post(
    verifyJWT,
    checkRoles(ROLES.Admin),
    validate(scheduleValidation.createSchedule),
    scheduleController.create
  );

router
  .route("/:id")
  .get(
    verifyJWT,
    checkRoles(ROLES.Admin),
    validate(scheduleValidation.getUserScheduleById),
    scheduleController.findOne
  )
  .delete(
    verifyJWT,
    checkRoles(ROLES.Admin),
    validate(scheduleValidation.deleteSchedule),
    scheduleController.deleteOne
  )
  .patch(
    verifyJWT,
    checkRoles(ROLES.Admin),
    validate(scheduleValidation.updateSchedule),
    scheduleController.update
  );

module.exports = router;
