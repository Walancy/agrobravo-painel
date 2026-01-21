'use server'

export async function getFlights(params: {
    departure_id: string;
    arrival_id: string;
    outbound_date: string; // YYYY-MM-DD
    currency?: string;
    hl?: string;
}) {
    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
        console.error("SERPAPI_KEY is not defined in environment variables");
        return null;
    }
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.append("engine", "google_flights");
    url.searchParams.append("departure_id", params.departure_id);
    url.searchParams.append("arrival_id", params.arrival_id);
    url.searchParams.append("outbound_date", params.outbound_date);
    url.searchParams.append("currency", params.currency || "BRL");
    url.searchParams.append("hl", params.hl || "pt");
    url.searchParams.append("api_key", apiKey);
    url.searchParams.append("type", "2"); // One way

    try {
        const response = await fetch(url.toString(), { cache: 'no-store' });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error("SerpApi Error Body:", errorBody);
            throw new Error(`SerpApi error: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch flights:", error);
        return null;
    }
}
