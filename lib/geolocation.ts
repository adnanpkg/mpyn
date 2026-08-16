/**
 * Get user's location via browser Geolocation API
 * Returns { latitude, longitude } or null if denied/unavailable
 */
export function getGeoLocation(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        // User denied or error occurred
        resolve(null);
      },
      { timeout: 5000 }
    );
  });
}

/**
 * Reverse geocode coordinates to get country, state, city using free API (nominatim)
 * Returns { country, state, city } or null if lookup fails
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{ country: string; state: string; city: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'Accept': 'application/json',
          // Nominatim requires a User-Agent
          'User-Agent': 'multiply-app',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const address = data.address || {};

    // Try to extract country, state, and city from OSM address format
    const country = address.country || null;
    const state = address.state || address.province || address.region || null;
    const city = address.city || address.town || address.village || null;

    if (!country) return null;

    return {
      country,
      state: state || '',
      city: city || '',
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
}
