const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const authRoute = require("./modules/auth/auth.route.js");
app.use("/api/auth", authRoute);

app.get("/", (req, res) => {
  res.json({ status: "success", message: "API retribusi Pasar Aktif" });
});

module.exports = app;
