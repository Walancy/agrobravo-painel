export interface Airport {
    code: string;
    name: string;
    city: string;
    country: string;
}

export const airports: Airport[] = [
    // Brazil - Major
    { code: "GRU", name: "Aeroporto Internacional de Guarulhos", city: "São Paulo", country: "Brasil" },
    { code: "CGH", name: "Aeroporto de Congonhas", city: "São Paulo", country: "Brasil" },
    { code: "VCP", name: "Aeroporto Internacional de Viracopos", city: "Campinas", country: "Brasil" },
    { code: "BSB", name: "Aeroporto Internacional de Brasília", city: "Brasília", country: "Brasil" },
    { code: "GIG", name: "Aeroporto Internacional do Rio de Janeiro-Galeão", city: "Rio de Janeiro", country: "Brasil" },
    { code: "SDU", name: "Aeroporto Santos Dumont", city: "Rio de Janeiro", country: "Brasil" },
    { code: "CNF", name: "Aeroporto Internacional de Confins", city: "Belo Horizonte", country: "Brasil" },
    { code: "SSA", name: "Aeroporto Internacional de Salvador", city: "Salvador", country: "Brasil" },
    { code: "REC", name: "Aeroporto Internacional do Recife", city: "Recife", country: "Brasil" },
    { code: "POA", name: "Aeroporto Internacional Salgado Filho", city: "Porto Alegre", country: "Brasil" },
    { code: "CWB", name: "Aeroporto Internacional Afonso Pena", city: "Curitiba", country: "Brasil" },
    { code: "FLN", name: "Aeroporto Internacional de Florianópolis", city: "Florianópolis", country: "Brasil" },
    { code: "FOR", name: "Aeroporto Internacional de Fortaleza", city: "Fortaleza", country: "Brasil" },
    { code: "GYN", name: "Aeroporto de Goiânia", city: "Goiânia", country: "Brasil" },
    { code: "VIX", name: "Aeroporto de Vitória", city: "Vitória", country: "Brasil" },
    { code: "CGB", name: "Aeroporto Internacional Marechal Rondon", city: "Cuiabá", country: "Brasil" },
    { code: "MAO", name: "Aeroporto Internacional Eduardo Gomes", city: "Manaus", country: "Brasil" },
    { code: "NAT", name: "Aeroporto Internacional de Natal", city: "Natal", country: "Brasil" },
    { code: "BEL", name: "Aeroporto Internacional de Belém", city: "Belém", country: "Brasil" },
    { code: "IGU", name: "Aeroporto Internacional de Foz do Iguaçu", city: "Foz do Iguaçu", country: "Brasil" },
    { code: "NVT", name: "Aeroporto Internacional de Navegantes", city: "Navegantes", country: "Brasil" },
    { code: "MCZ", name: "Aeroporto Internacional Zumbi dos Palmares", city: "Maceió", country: "Brasil" },
    { code: "CAC", name: "Aeroporto de Cascavel", city: "Cascavel", country: "Brasil" },
    { code: "LDB", name: "Aeroporto de Londrina", city: "Londrina", country: "Brasil" },
    { code: "MGF", name: "Aeroporto Regional de Maringá", city: "Maringá", country: "Brasil" },

    // USA - Major
    { code: "ATL", name: "Hartsfield-Jackson Atlanta International Airport", city: "Atlanta", country: "USA" },
    { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "USA" },
    { code: "ORD", name: "O'Hare International Airport", city: "Chicago", country: "USA" },
    { code: "DFW", name: "Dallas/Fort Worth International Airport", city: "Dallas", country: "USA" },
    { code: "DEN", name: "Denver International Airport", city: "Denver", country: "USA" },
    { code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "USA" },
    { code: "SFO", name: "San Francisco International Airport", city: "San Francisco", country: "USA" },
    { code: "LAS", name: "Harry Reid International Airport", city: "Las Vegas", country: "USA" },
    { code: "SEA", name: "Seattle-Tacoma International Airport", city: "Seattle", country: "USA" },
    { code: "CLT", name: "Charlotte Douglas International Airport", city: "Charlotte", country: "USA" },
    { code: "MCO", name: "Orlando International Airport", city: "Orlando", country: "USA" },
    { code: "MIA", name: "Miami International Airport", city: "Miami", country: "USA" },
    { code: "PHX", name: "Phoenix Sky Harbor International Airport", city: "Phoenix", country: "USA" },
    { code: "EWR", name: "Newark Liberty International Airport", city: "Newark", country: "USA" },
    { code: "IAH", name: "George Bush Intercontinental Airport", city: "Houston", country: "USA" },
    { code: "BOS", name: "Logan International Airport", city: "Boston", country: "USA" },
    { code: "MSP", name: "Minneapolis-Saint Paul International Airport", city: "Minneapolis", country: "USA" },
    { code: "DTW", name: "Detroit Metropolitan Airport", city: "Detroit", country: "USA" },
    { code: "PHL", name: "Philadelphia International Airport", city: "Philadelphia", country: "USA" },
    { code: "LGA", name: "LaGuardia Airport", city: "New York", country: "USA" },

    // Europe - Major
    { code: "LHR", name: "Heathrow Airport", city: "London", country: "UK" },
    { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France" },
    { code: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands" },
    { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany" },
    { code: "MAD", name: "Adolfo Suárez Madrid-Barajas Airport", city: "Madrid", country: "Spain" },
    { code: "BCN", name: "Josep Tarradellas Barcelona-El Prat Airport", city: "Barcelona", country: "Spain" },
    { code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey" },
    { code: "MUC", name: "Munich Airport", city: "Munich", country: "Germany" },
    { code: "FCO", name: "Leonardo da Vinci-Fiumicino Airport", city: "Rome", country: "Italy" },
    { code: "LGW", name: "Gatwick Airport", city: "London", country: "UK" },
    { code: "LIS", name: "Humberto Delgado Airport", city: "Lisbon", country: "Portugal" },

    // Asia - Major
    { code: "HND", name: "Tokyo Haneda Airport", city: "Tokyo", country: "Japan" },
    { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "UAE" },
    { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore" },
    { code: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea" },
    { code: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand" },
    { code: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "Hong Kong" },
    { code: "DOH", name: "Hamad International Airport", city: "Doha", country: "Qatar" },

    // Others
    { code: "SYD", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia" },
    { code: "YYZ", name: "Toronto Pearson International Airport", city: "Toronto", country: "Canada" },
    { code: "MEX", name: "Mexico City International Airport", city: "Mexico City", country: "Mexico" },
    { code: "JNB", name: "O.R. Tambo International Airport", city: "Johannesburg", country: "South Africa" },
    { code: "EZE", name: "Ministro Pistarini International Airport", city: "Buenos Aires", country: "Argentina" },
];
