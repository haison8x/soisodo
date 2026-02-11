/**
 * Reverse geocoding using OpenStreetMap Nominatim API
 * 
 * @param {number} lat Latitude
 * @param {number} lon Longitude
 * @returns {Promise<string|null>} Formatted address or null if failed
 */
export const getAddressFromCoordinates = async (lat, lon) => {
    if (!lat || !lon) return null;

    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

        // Nominatim requires a User-Agent header
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'SoiToaDoApp/1.0',
                'Accept-Language': 'vi' // Request Vietnamese results
            }
        });

        if (!response.ok) {
            throw new Error(`Nominatim API Error: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.address) {
            const { house_number, road, suburb, quarter, village, town, city, state, country } = data.address;

            // Construct address components in order of specificity
            const parts = [
                house_number,
                road,
                quarter || suburb || village,
                town || city || state
            ].filter(part => part); // Remove undefined/null/empty strings

            return parts.join(', ');
        }

        return data.display_name || null;
    } catch (error) {
        console.error('Error fetching address:', error);
        return null;
    }
};
