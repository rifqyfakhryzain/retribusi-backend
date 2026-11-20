const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Pendaftaran Router Modul
const authRoute = require("./modules/auth/auth.route.js");
const qrcodeRoute = require("./modules/qrcode/qrcode.route.js");

app.use("/api/auth", authRoute);
app.use("/api/qrcode", qrcodeRoute);

app.get("/", (req, res) => {
  res.json({ status: "success", message: "API retribusi Pasar Aktif" });
});

module.exports = app;
