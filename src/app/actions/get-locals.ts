"use server"

export async function getLocals(params: any) {
    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
        console.error("SERPAPI_KEY is not defined");
        return { local_results: [] };
    }

    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.append("engine", "google_local");
    url.searchParams.append("q", params.query);
    if (params.location) {
        url.searchParams.append("location", params.location);
    }
    url.searchParams.append("google_domain", "google.com.br");
    url.searchParams.append("gl", "br");
    url.searchParams.append("hl", "pt");
    url.searchParams.append("api_key", apiKey);

    try {
        const response = await fetch(url.toString(), { cache: 'no-store' });
        if (!response.ok) {
            console.error("SerpApi Error:", await response.text());
            return { local_results: [] };
        }
        const data = await response.json();

        // Map SerpApi response
        if (data.local_results) {
            data.local_results = data.local_results.map((p: any) => ({
                ...p,
                place_id: p.place_id || p.place_id_search || Math.random().toString(36),
                address: p.address || p.vicinity,
                price_level: p.price ? p.price.length : 0, // Convert "$$$" to number if needed, or keep as string if component handles it
                // VisitForm uses p.type directly
            }));
        }

        return data;
    } catch (error) {
        console.error("Failed to fetch locals:", error);
        return { local_results: [] };
    }
}
