const express = require("express");
const router = express.Router();

const authController = require("./auth.controller.js");
const authSchema = require("./auth.schema.js");
const validate = require("../../middlewares/validator.js");
const { verifyToken } = require("../../middlewares/auth.middleware.js");

// POST /api/auth/login - Publik (Login Petugas & Admin)
router.post("/login", validate(authSchema.login), authController.loginPetugas);

// GET /api/auth/me - Terproteksi (Cek token & ambil info akun saat ini)
router.get("/me", verifyToken, authController.getProfile);

module.exports = router;
