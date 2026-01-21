"use server"

interface GetHotelsParams {
    location: string
    checkIn?: string
    checkOut?: string
    adults?: number
    children?: number
}

export async function getHotels({
    location,
    checkIn = "2026-03-07",
    checkOut = "2026-03-12",
    adults = 2,
    children = 0
}: GetHotelsParams) {
    const apiKey = process.env.SERPAPI_KEY

    if (!apiKey) {
        console.error("SERPAPI_KEY not found in environment variables")
        throw new Error("API key not configured")
    }

    // Normalize location string for SerpApi
    const normalizedLocation = location
        .replace(/\bBrasil\b/g, "Brazil")
        .replace(/\bEUA\b/g, "United States")
        .replace(/\bItália\b/g, "Italy")
        .replace(/\bFrança\b/g, "France")
        .replace(/\bEspanha\b/g, "Spain")
        .replace(/\bAlemanha\b/g, "Germany")
        .replace(/\bJapão\b/g, "Japan")
        .replace(/\bReino Unido\b/g, "United Kingdom")
        .replace(/\bEmirados Árabes\b/g, "United Arab Emirates")
        .replace(/\bHolanda\b/g, "Netherlands")
        .replace(/\bAustrália\b/g, "Australia");

    const params = new URLSearchParams({
        engine: "google_hotels",
        q: normalizedLocation,
        check_in_date: checkIn,
        check_out_date: checkOut,
        adults: adults.toString(),
        children: children.toString(),
        currency: "BRL",
        gl: "br",
        hl: "pt",
        api_key: apiKey,
    })

    try {
        const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`)

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("SerpApi Error Body:", errorBody);
            throw new Error(`SerpApi error: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch hotels:", error)
        throw error
    }
}
