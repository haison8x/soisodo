import * as Location from 'expo-location';

/**
 * Reverse geocoding using expo-location (Native services)
 * Falls back to Nominatim if native fails or is unavailable
 * 
 * @param {number} lat Latitude
 * @param {number} lon Longitude
 * @returns {Promise<string|null>} Formatted address or null if failed
 */
export const getAddressFromCoordinates = async (lat, lon) => {
    if (!lat || !lon) return null;

    try {
        // Try Native Geocoding first (Expo Location)
        const results = await Location.reverseGeocodeAsync({
            latitude: parseFloat(lat),
            longitude: parseFloat(lon)
        });

        if (results && results.length > 0) {
            const address = results[0];

            // Construct address components based on Vietnamese address patterns
            // Fields: name, streetNumber, street, district, city, subregion, region, country
            const parts = [
                address.name || address.streetNumber,
                address.street,
                address.district || address.subregion,
                address.city || address.region
            ].filter(part => part && part !== 'Unnamed Road');

            if (parts.length > 0) {
                return parts.join(', ');
            }
        }

        // Fallback to OSM Nominatim if native fails or returns no data
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'SoiToaDoApp/1.0',
                'Accept-Language': 'vi'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.address) {
                const { house_number, road, suburb, quarter, village, town, city, state } = data.address;
                const parts = [
                    house_number,
                    road,
                    quarter || suburb || village,
                    town || city || state
                ].filter(part => part);
                return parts.join(', ');
            }
            return data.display_name || null;
        }

        return null;
    } catch (error) {
        console.error('Error fetching address:', error);
        return null;
    }
};
