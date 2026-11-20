const authService = require("./auth.service");

const loginPetugas = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await authService.prosesLogin(username, password);
    res.json({ status: "success", message: "Login berhasil", data: result });
  } catch (error) {
    res.status(401).json({ status: "error", message: error.message });
  }
};

const getProfile = async (req, res) => {
  res.json({
    status: "success",
    message: "Profil pengguna berhasil diambil",
    data: {
      user: req.user,
    },
  });
};

module.exports = { loginPetugas, getProfile };
