"use server"

export async function getFlights(params: any) {
    console.log("Mock getFlights called with:", params);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock data
    return {
        best_flights: [
            {
                departure_token: "mock-best-1",
                price: "1500.00",
                total_duration: 120,
                airline_logo: "https://github.com/shadcn.png",
                flights: [
                    {
                        airline: "Azul",
                        flight_number: "AD1234",
                        departure_airport: { id: params.departure_id || "GRU", time: "2026-05-22 09:00" },
                        arrival_airport: { id: params.arrival_id || "GIG", time: "2026-05-22 11:00" },
                        duration: 120,
                        airplane: "Boeing 737",
                        extensions: ["Wifi", "USB"]
                    }
                ]
            }
        ],
        other_flights: [
            {
                departure_token: "mock-other-1",
                price: "1200.00",
                total_duration: 150,
                airline_logo: "https://github.com/shadcn.png",
                flights: [
                    {
                        airline: "GOL",
                        flight_number: "G31234",
                        departure_airport: { id: params.departure_id || "GRU", time: "2026-05-22 10:00" },
                        arrival_airport: { id: params.arrival_id || "GIG", time: "2026-05-22 12:30" },
                        duration: 150,
                        airplane: "Boeing 737",
                        extensions: ["Snacks"]
                    }
                ]
            }
        ]
    };
}
