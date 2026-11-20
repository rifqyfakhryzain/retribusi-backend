const express = require("express");
const router = express.Router();

const qrcodeController = require("./qrcode.controller");
const qrcodeSchema = require("./qrcode.schema");
const validate = require("../../middlewares/validator");
const { verifyToken, authorizeRole } = require("../../middlewares/auth.middleware");

// POST /api/qrcode/generate - Khusus ADMIN (UPTD Pasar)
router.post(
  "/generate",
  verifyToken,
  authorizeRole("ADMIN"),
  validate(qrcodeSchema.generate),
  qrcodeController.generateKiosQr
);

// POST /api/qrcode/verify - Terproteksi (PETUGAS & ADMIN)
router.post(
  "/verify",
  verifyToken,
  validate(qrcodeSchema.verify),
  qrcodeController.verifyKiosQr
);

// GET /api/qrcode/kios - Terproteksi (Daftar semua kios dan gambar QR-nya)
router.get(
  "/kios",
  verifyToken,
  qrcodeController.listKios
);

// GET /api/qrcode/kios/:id - Terproteksi (Detail kios & gambar QR)
router.get(
  "/kios/:id",
  verifyToken,
  qrcodeController.getKiosDetail
);

module.exports = router;
