const express = require("express");
const router = express.Router();
const retribusiController = require("./retribusi.controller.js");
const { bayarRetribusiSchema } = require("./retribusi.schema.js");
const validate = require("../../middlewares/validator.js");
const { verifyToken, authorizeRole } = require("../../middlewares/auth.middleware.js");

// POST /api/retribusi/bayar - Petugas melakukan pelunasan retribusi
router.post(
  "/bayar",
  verifyToken,
  authorizeRole("PETUGAS", "ADMIN"),
  validate(bayarRetribusiSchema),
  retribusiController.bayarRetribusi
);

// GET /api/retribusi/riwayat - Riwayat penagihan petugas sesi hari ini
router.get(
  "/riwayat",
  verifyToken,
  authorizeRole("PETUGAS", "ADMIN"),
  retribusiController.getRiwayatPetugas
);

// GET /api/retribusi/semua - Seluruh transaksi untuk Dasbor Monitoring Real-Time
router.get(
  "/semua",
  verifyToken,
  retribusiController.getAllTransactions
);

// GET /api/retribusi/statistik - Statistik akumulasi harian
router.get(
  "/statistik",
  verifyToken,
  retribusiController.getStatistikHariIni
);

module.exports = router;
