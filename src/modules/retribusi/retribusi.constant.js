/**
 * Konfigurasi Geospasial Pasar Cicalengka
 * Sumber: Pemetaan Wilayah Pasar Sehat Sabilulungan Cicalengka, Kab. Bandung
 */

// Poligon Batas Fisik Gedung Pasar Cicalengka [Latitude, Longitude]
const PASAR_CICALENGKA_POLYGON = [
  [-6.986800, 107.838500],
  [-6.986800, 107.840200],
  [-6.988300, 107.840200],
  [-6.988300, 107.838500],
];

// Titik Pusat Pasar Cicalengka untuk acuan kalkulasi jarak (Haversine)
const PASAR_CENTER = {
  latitude: -6.987550,
  longitude: 107.839350,
};

// Toleransi buffer perluasan batas poligon (meter) untuk antisipasi pergeseran sinyal satelit
const BUFFER_TOLERANCE_METERS = 15;

// Batas toleransi akurasi maksimum GPS ponsel (meter)
const DEFAULT_MAX_ACCURACY = Number(process.env.MAX_GPS_ACCURACY_METERS) || 50;

// Mode Pengujian / Simulasi Meja Kerja (Indoor Testing)
const GEOFENCE_DEV_MODE = process.env.GEOFENCE_DEV_MODE === "true";

// Titik Uji Coba Simulasi (Lokasi saat petugas menguji dari meja kerja/kamar Android)
const DEV_TEST_LOCATION = {
  latitude: -7.050403,
  longitude: 107.759690,
  radiusMeters: 200, // Radius toleransi uji coba meja kerja
};

module.exports = {
  PASAR_CICALENGKA_POLYGON,
  PASAR_CENTER,
  BUFFER_TOLERANCE_METERS,
  DEFAULT_MAX_ACCURACY,
  GEOFENCE_DEV_MODE,
  DEV_TEST_LOCATION,
};
