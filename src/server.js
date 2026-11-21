require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app.js");

const PORT = process.env.PORT || 3000;

// Buat HTTP server yang membungkus Express
const server = http.createServer(app);

// Inisialisasi Socket.io server dengan konfigurasi CORS
const io = new Server(server, {
  cors: {
    origin: "*", // Mengizinkan akses dari Vite dev & Vercel production
    methods: ["GET", "POST"],
  },
});

// Sematkan instance io ke Express app agar dapat diakses dari controller
app.set("io", io);

// Lifecycle listener koneksi WebSocket
io.on("connection", (socket) => {
  console.log(`[Socket.io] Client terhubung secara real-time: ${socket.id}`);

  socket.on("disconnect", (reason) => {
    console.log(`[Socket.io] Client terputus: ${socket.id} (${reason})`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server HTTP & Socket.io aktif di http://localhost:${PORT}`);
});
