const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "success", message: "API retribusi Pasar Aktif" });
});

module.exports = app;
