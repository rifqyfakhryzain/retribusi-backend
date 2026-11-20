const qrcodeService = require("./qrcode.service");

/**
 * Controller untuk menerbitkan QR Code lapak pedagang baru
 * Akses: Khusus Role ADMIN (UPTD Pasar)
 */
const generateKiosQr = async (req, res) => {
  try {
    const result = await qrcodeService.generateKiosQr(req.body);
    res.status(201).json({
      status: "success",
      message: "QR Code kios berhasil diterbitkan",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Controller untuk memverifikasi keaslian QR Code saat dipindai kamera petugas
 * Akses: PETUGAS & ADMIN
 */
const verifyKiosQr = async (req, res) => {
  try {
    const { qr_token } = req.body;
    const result = await qrcodeService.verifyKiosQr(qr_token);
    res.json({
      status: "success",
      message: "QR Code valid dan terverifikasi",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Controller untuk mengambil seluruh daftar kios beserta gambar QR Code-nya
 * Akses: ADMIN & PETUGAS
 */
const listKios = async (req, res) => {
  try {
    const result = await qrcodeService.listAllKios();
    res.json({
      status: "success",
      message: "Daftar kios berhasil diambil",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Controller untuk mengambil detail kios berdasarkan ID
 */
const getKiosDetail = async (req, res) => {
  try {
    const result = await qrcodeService.getKiosById(req.params.id);
    res.json({
      status: "success",
      message: "Data kios berhasil diambil",
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  generateKiosQr,
  verifyKiosQr,
  listKios,
  getKiosDetail,
};
