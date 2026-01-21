"use server"

export async function getHotels(params: any) {
    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
        console.error("SERPAPI_KEY is not defined");
        return null;
    }

    const formatDate = (date: string) => {
        if (!date) return "";
        const cleanDate = date.replace(/\s/g, '');
        if (cleanDate.includes("/")) {
            const [day, month, year] = cleanDate.split("/");
            return `${year}-${month}-${day}`;
        }
        return cleanDate;
    };

    const checkIn = formatDate(params.checkIn);
    const checkOut = formatDate(params.checkOut);

    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.append("engine", "google_hotels");
    url.searchParams.append("q", params.location);
    url.searchParams.append("check_in_date", checkIn);
    url.searchParams.append("check_out_date", checkOut);
    url.searchParams.append("adults", String(params.adults || 2));
    url.searchParams.append("currency", "BRL");
    url.searchParams.append("gl", "br");
    url.searchParams.append("hl", "pt");
    url.searchParams.append("api_key", apiKey);

    console.log("Fetching hotels from SerpApi:", url.toString().replace(apiKey, "HIDDEN_KEY"));

    try {
        const response = await fetch(url.toString(), { cache: 'no-store' });
        if (!response.ok) {
            console.error("SerpApi Error:", await response.text());
            return null;
        }
        const data = await response.json();

        // Map SerpApi response to expected structure if needed, 
        // or return as is if the component handles it.
        // HotelForm expects: property_token, name, location, thumbnail, stars, rating, reviews, price

        if (data.properties) {
            data.properties = data.properties.map((p: any) => ({
                ...p,
                property_token: p.property_token || p.link || Math.random().toString(36),
                thumbnail: p.images?.[0]?.thumbnail || p.thumbnail,
                price: p.rate_per_night?.lowest,
                rating: p.overall_rating,
                stars: p.hotel_class
            }));
        }

        return data;
    } catch (error) {
        console.error("Failed to fetch hotels:", error);
        return null;
    }
}
