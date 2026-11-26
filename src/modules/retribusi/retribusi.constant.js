/**
 * Konfigurasi Geospasial Pasar Cicalengka
 * Sumber: Pemetaan Wilayah Pasar Sehat Sabilulungan Cicalengka, Kab. Bandung
 */

// Poligon Batas Fisik Gedung Pasar Cicalengka [Latitude, Longitude]
// Disesuaikan ke perimeter lokasi saat ini (-7.02347, 107.73834)
const PASAR_CICALENGKA_POLYGON = [
  [-7.02197, 107.73684],
  [-7.02197, 107.73984],
  [-7.02497, 107.73984],
  [-7.02497, 107.73684],
];

// Titik Pusat Pasar Cicalengka untuk acuan kalkulasi jarak (Haversine)
const PASAR_CENTER = {
  latitude: -7.02347,
  longitude: 107.73834,
};

// Toleransi buffer perluasan batas poligon (meter) untuk antisipasi pergeseran sinyal satelit
const BUFFER_TOLERANCE_METERS = 50;

// Batas toleransi akurasi maksimum GPS ponsel (meter)
const DEFAULT_MAX_ACCURACY = Number(process.env.MAX_GPS_ACCURACY_METERS) || 500;

// Mode Pengujian / Simulasi Meja Kerja (Indoor Testing)
const GEOFENCE_DEV_MODE = process.env.GEOFENCE_DEV_MODE === "true";

// Titik Uji Coba Simulasi (Lokasi saat petugas menguji dari meja kerja/kamar Android)
const DEV_TEST_LOCATION = {
  latitude: -7.02347,
  longitude: 107.73834,
  radiusMeters: 1000, // Radius toleransi uji coba meja kerja
};

module.exports = {
  PASAR_CICALENGKA_POLYGON,
  PASAR_CENTER,
  BUFFER_TOLERANCE_METERS,
  DEFAULT_MAX_ACCURACY,
  GEOFENCE_DEV_MODE,
  DEV_TEST_LOCATION,
};
