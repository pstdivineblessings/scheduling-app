const express = require("express");
const validate = require("../../middlewares/validate");
const authController = require("../../controllers/authController");
const authValidation = require("../../validations/authValidation");

const router = express.Router();

// routes
router.post("/signup", validate(authValidation.signup), authController.signup);
router.post("/signin", validate(authValidation.signin), authController.signin);
router.post(
  "/signout",
  validate(authValidation.signout),
  authController.signout
);
router.post(
  "/refresh-token",
  validate(authValidation.refreshToken),
  authController.refreshToken
);

module.exports = router;
