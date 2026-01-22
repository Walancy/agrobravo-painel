const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export interface DistanceMatrixResult {
    durationText: string;
    durationValue: number; // in seconds
    distanceText: string;
}

export const googleMapsService = {
    getBusTravelTime: async (origin: string, destination: string, departureTime?: string): Promise<DistanceMatrixResult | null> => {
        if (!GOOGLE_API_KEY || !origin || !destination) return null;

        // Don't call API if origin or destination are URLs
        const isUrl = (str: string) => str.startsWith('http://') || str.startsWith('https://');
        if (isUrl(origin) || isUrl(destination)) return null;

        try {
            let url = `/api/google/distance?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=driving`;

            if (departureTime) {
                url += `&departure_time=${departureTime}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                // Return null instead of throwing to avoid noisy console errors for 404s (no route found)
                return null;
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching travel time:', error);
            return null;
        }
    }
}
