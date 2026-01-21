
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const COUNTRIES_BY_REGION: Record<string, string[]> = {
    // Same list...
    "África": [
        "África do Sul", "Angola", "Argélia", "Benin", "Botsuana", "Burkina Faso", "Burundi", "Camarões", "Cabo Verde",
        "Chade", "Comores", "Congo", "Costa do Marfim", "Egito", "Eritreia", "Etiópia", "Gabão", "Gana", "Guiné", "Guiné-Bissau",
        "Guiné Equatorial", "Lesoto", "Libéria", "Líbia", "Madagascar", "Malawi", "Mali", "Marrocos", "Maurício", "Mauritânia",
        "Moçambique", "Namíbia", "Níger", "Nigéria", "Quênia", "República Centro-Africana", "República Democrática do Congo",
        "Ruanda", "São Tomé e Príncipe", "Senegal", "Serra Leoa", "Seychelles", "Somália", "Suazilândia", "Sudão", "Sudão do Sul",
        "Tanzânia", "Togo", "Tunísia", "Uganda", "Zâmbia", "Zimbábue"
    ],
    "América Central": [
        "Belize", "Costa Rica", "El Salvador", "Guatemala", "Honduras", "Nicarágua", "Panamá"
    ],
    "América do Norte": [
        "Canadá", "Estados Unidos", "México"
    ],
    "América do Sul": [
        "Argentina", "Bolívia", "Brasil", "Chile", "Colômbia", "Equador", "Guiana", "Paraguai", "Peru", "Suriname", "Uruguai", "Venezuela"
    ],
    "Ásia": [
        "Afeganistão", "Bangladesh", "Brunei", "Butão", "Camboja", "China", "Coreia do Norte", "Coreia do Sul", "Filipinas",
        "Índia", "Indonésia", "Japão", "Laos", "Malásia", "Maldivas", "Mongólia", "Myanmar", "Nepal", "Paquistão", "Cazaquistão",
        "Quirguistão", "Singapura", "Sri Lanka", "Tajiquistão", "Tailândia", "Timor-Leste", "Turcomenistão", "Uzbequistão", "Vietnã"
    ],
    "Caribe": [
        "Antígua e Barbuda", "Bahamas", "Barbados", "Cuba", "Dominica", "Granada", "Haiti", "Jamaica", "República Dominicana",
        "Santa Lúcia", "São Cristóvão e Neves", "São Vicente e Granadinas", "Trinidad e Tobago"
    ],
    "Europa": [
        "Albânia", "Alemanha", "Andorra", "Armênia", "Áustria", "Azerbaijão", "Bélgica", "Bielorrússia", "Bósnia e Herzegovina",
        "Bulgária", "Chipre", "Croácia", "Dinamarca", "Eslováquia", "Eslovênia", "Espanha", "Estônia", "Finlândia", "França",
        "Geórgia", "Grécia", "Hungria", "Irlanda", "Islândia", "Itália", "Kosovo", "Letônia", "Liechtenstein", "Lituânia",
        "Luxemburgo", "Macedônia do Norte", "Malta", "Moldávia", "Mônaco", "Montenegro", "Noruega", "Países Baixos", "Polônia",
        "Portugal", "Reino Unido", "República Checa", "Romênia", "Rússia", "San Marino", "Sérvia", "Suécia", "Suíça", "Turquia",
        "Ucrânia", "Vaticano"
    ],
    "Oceania": [
        "Austrália", "Fiji", "Ilhas Marshall", "Ilhas Salomão", "Kiribati", "Micronésia", "Nauru", "Nova Zelândia", "Palau",
        "Papua Nova Guiné", "Samoa", "Tonga", "Tuvalu", "Vanuatu"
    ],
    "Oriente Médio": [
        "Arábia Saudita", "Bahrein", "Catar", "Emirados Árabes Unidos", "Iêmen", "Irã", "Iraque", "Israel", "Jordânia", "Kuwait",
        "Líbano", "Omã", "Síria", "Palestina"
    ],
}

async function seedPaises() {
    console.log('Seeding paises v2...')

    // Check if table is empty first
    const { count } = await supabase.from('paises').select('*', { count: 'exact', head: true })
    if (count && count > 0) {
        console.log(`Table 'paises' already has ${count} rows.`)
        // Check one row to see ID
        const { data } = await supabase.from('paises').select('id, pais').limit(1)
        console.log('Sample row:', data)
        // return
    } else {
        console.log("Table is empty.")
    }

    const rows = []
    let idCounter = 1;

    for (const [region, countries] of Object.entries(COUNTRIES_BY_REGION)) {
        for (const country of countries) {
            rows.push({
                pais: country,
                continente: region,
                ddi: '+00',
                bandeira: '-'
            })
        }
    }

    // Insert in smaller batches and try to capture error better
    // Using upsert based on 'pais' if possible? No unique constraint on 'pais' known? 
    // Just insert.

    const batchSize = 100
    for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize)
        console.log(`Inserting batch ${i}...`)
        const { error } = await supabase.from('paises').insert(batch)
        if (error) {
            console.error('Error inserting batch:', error)
            // Try to insert one by one to find the culprit
            for (const row of batch) {
                const { error: singleError } = await supabase.from('paises').insert(row)
                if (singleError) {
                    console.error("Failed row:", row, singleError)
                    break; // Stop after first failure
                }
            }
            break;
        }
    }

    console.log('Seed completed.')
}

seedPaises()
