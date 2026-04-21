import * as Location from 'expo-location';

export const getAddressFromCoordinates = async (
  lat: number,
  lon: number,
): Promise<string | null> => {
  if (!lat || !lon) return null;

  try {
    const results = await Location.reverseGeocodeAsync({
      latitude: parseFloat(String(lat)),
      longitude: parseFloat(String(lon)),
    });

    if (results && results.length > 0) {
      const address = results[0];
      const parts = [
        address.name ?? address.streetNumber,
        address.street,
        address.district ?? address.subregion,
        address.city ?? address.region,
      ].filter((part): part is string => !!part && part !== 'Unnamed Road');

      if (parts.length > 0) return parts.join(', ');
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SoiToaDoApp/1.0',
        'Accept-Language': 'vi',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.address) {
        const { house_number, road, suburb, quarter, village, town, city, state } = data.address;
        const parts = [house_number, road, quarter ?? suburb ?? village, town ?? city ?? state].filter(
          (p): p is string => !!p,
        );
        return parts.join(', ');
      }
      return (data.display_name as string) ?? null;
    }

    return null;
  } catch (error) {
    console.error('Error fetching address:', error);
    return null;
  }
};
