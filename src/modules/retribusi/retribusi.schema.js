const { z } = require("zod");

const bayarRetribusiSchema = z.object({
  qr_token: z
    .string({
      required_error: "Token QR Code wajib dikirimkan",
    })
    .min(1, "Token QR Code tidak boleh kosong"),

  latitude: z
    .number({
      required_error: "Koordinat latitude wajib dikirimkan",
      invalid_type_error: "Latitude harus bertipe angka desimal",
    })
    .min(-90)
    .max(90),

  longitude: z
    .number({
      required_error: "Koordinat longitude wajib dikirimkan",
      invalid_type_error: "Longitude harus bertipe angka desimal",
    })
    .min(-180)
    .max(180),

  accuracy: z
    .number({
      required_error: "Nilai akurasi GPS wajib dikirimkan",
      invalid_type_error: "Akurasi GPS harus bertipe angka",
    })
    .min(0, "Akurasi GPS tidak boleh negatif"),
});

module.exports = {
  bayarRetribusiSchema,
};
