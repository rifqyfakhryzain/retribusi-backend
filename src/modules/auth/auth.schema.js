const { z } = require("zod");

const login = z.object({
  username: z.string().min(1, "Username tidak boleh kosong"),
  password: z.string().min(6, "Password harus memiliki minimal 6 karakter!"),
});

module.exports = { login };
