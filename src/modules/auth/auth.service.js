const bcrypt = require("bcrypt");
const prisma = require("../../config/prisma.js");
const jwt = require("jsonwebtoken");

const prosesLogin = async (username, password) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new Error("Username tidak ditemukan");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Password salah");
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      nama: user.nama,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  return {
    token,
    user: {
      id: user.id,
      nama: user.nama,
      username: user.username,
      role: user.role,
    },
  };
};

module.exports = { prosesLogin };
