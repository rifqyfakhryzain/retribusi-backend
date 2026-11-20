const jwt = require("jsonwebtoken");

/**
 * Middleware untuk memverifikasi token JWT dari header Authorization
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      message: "Akses ditolak: Token otentikasi tidak ditemukan",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, nama, role, iat, exp }
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Akses ditolak: Token tidak valid atau telah kedaluwarsa",
    });
  }
};

/**
 * Middleware untuk membatasi akses berdasarkan peran (Role-Based Access Control)
 * @param  {...string} allowedRoles - Contoh: "ADMIN", "PETUGAS"
 */
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Akses dilarang: Anda tidak memiliki hak akses untuk resource ini",
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRole,
};
