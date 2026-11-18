const authService = require("./auth.service");

const loginPetugas = async (req, res) => {
  try {
    const { username, password } = req.body;
    const token = await authService.prosesLogin(username, password);
    res.json({ status: "success", message: "Login berhasil", data: { token } });
  } catch (error) {
    res.status(401).json({ status: "error", message: error.message });
  }
};

module.exports = { loginPetugas };
