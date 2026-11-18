const express = require("express");
const router = express.Router();

const authController = require("./auth.controller.js");
const authSchema = require("./auth.schema.js");
const validate = require("../../middlewares/validator.js");

router.post("/login", validate(authSchema.login), authController.loginPetugas);

module.exports = router;
