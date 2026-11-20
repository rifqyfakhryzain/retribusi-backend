const { z } = require("zod");

const generate = z.object({
  kode_kios: z.string().min(1, "Kode kios tidak boleh kosong"),
  nama_pemilik: z.string().min(1, "Nama pemilik tidak boleh kosong"),
  jenis_dagangan: z.string().min(1, "Jenis dagangan tidak boleh kosong"),
  lantai: z.enum(["BASEMENT", "LANTAI_1", "LANTAI_2"], {
    errorMap: () => ({ message: "Lantai harus BASEMENT, LANTAI_1, atau LANTAI_2" }),
  }),
  tarif_retribusi: z.coerce.number().positive("Tarif retribusi harus berupa angka positif").optional().default(5000),
});

const verify = z.object({
  qr_token: z.string().min(1, "Token QR tidak boleh kosong"),
});

module.exports = {
  generate,
  verify,
};
