const {
  PASAR_CICALENGKA_POLYGON,
  PASAR_CENTER,
  BUFFER_TOLERANCE_METERS,
  DEFAULT_MAX_ACCURACY,
  GEOFENCE_DEV_MODE,
  DEV_TEST_LOCATION,
} = require("./retribusi.constant.js");

/**
 * Menghitung jarak antara dua koordinat geografis menggunakan Rumus Haversine (dalam meter)
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius bumi dalam meter
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Hasil dalam meter
}

/**
 * Algoritma Point-in-Polygon (Ray Casting / Even-Odd Rule)
 * Menentukan apakah titik koordinat berada di dalam area batas poligon.
 *
 * @param {[number, number]} point [latitude, longitude]
 * @param {Array<[number, number]>} polygon Array koordinat sudut poligon [[lat, lng], ...]
 * @returns {boolean} true jika di dalam poligon
 */
function isPointInPolygon(point, polygon) {
  const [lat, lng] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect =
      yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Evaluasi Lengkap Validasi Geofencing:
 * Pengecekan Ray Casting poligon Pasar Cicalengka
 * Pengecekan toleransi penyangga jarak (Buffer Haversine)
 * Dukungan Mode Pengujian Meja Kerja (DEV_MODE)
 */
function validateGeofence(latitude, longitude) {
  const point = [latitude, longitude];

  // Uji Poligon Resmi Pasar Cicalengka
  const inMarketPolygon = isPointInPolygon(point, PASAR_CICALENGKA_POLYGON);
  if (inMarketPolygon) {
    return {
      isValid: true,
      reason:
        "Koordinat berada tepat di dalam poligon fisik Gedung Pasar Cicalengka",
      distanceToCenter: calculateHaversineDistance(
        latitude,
        longitude,
        PASAR_CENTER.latitude,
        PASAR_CENTER.longitude,
      ),
    };
  }

  // Uji Toleransi Buffer di Sekitar Batas Luar Pasar
  const distToCenter = calculateHaversineDistance(
    latitude,
    longitude,
    PASAR_CENTER.latitude,
    PASAR_CENTER.longitude,
  );

  // Jika masih dalam radius toleransi pasar (misal ~120 meter dari titik tengah gedung)
  if (distToCenter <= 120 + BUFFER_TOLERANCE_METERS) {
    return {
      isValid: true,
      reason: `Koordinat berada dalam zona penyangga (+${BUFFER_TOLERANCE_METERS}m) Pasar Cicalengka`,
      distanceToCenter: distToCenter,
    };
  }

  // Uji Mode Development / Meja Kerja Uji Coba Mahasiswa
  if (GEOFENCE_DEV_MODE) {
    const distToDev = calculateHaversineDistance(
      latitude,
      longitude,
      DEV_TEST_LOCATION.latitude,
      DEV_TEST_LOCATION.longitude,
    );

    if (distToDev <= DEV_TEST_LOCATION.radiusMeters) {
      return {
        isValid: true,
        reason: `[DEV_MODE] Koordinat disahkan melalui zona simulasi pengujian meja kerja (Jarak: ${distToDev.toFixed(1)}m)`,
        distanceToCenter: distToCenter,
        isDevMode: true,
      };
    }
  }

  // Gagal: Berada di Luar Radius
  return {
    isValid: false,
    reason: `Peringatan Fraud: Lokasi Anda berjarak ${(distToCenter / 1000).toFixed(2)} km dari Pasar Cicalengka!`,
    distanceToCenter: distToCenter,
  };
}

module.exports = {
  calculateHaversineDistance,
  isPointInPolygon,
  validateGeofence,
};
