
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const COUNTRIES_BY_REGION: Record<string, string[]> = {
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
    console.log('Seeding paises...')

    // Check if table is empty first
    const { count } = await supabase.from('paises').select('*', { count: 'exact', head: true })
    if (count && count > 0) {
        console.log(`Table 'paises' already has ${count} rows. Skipping seed.`)
        // return; 
        // Commenting out return to force seed if needed, but usually we don't want duplicates.
        // For this task, we assume it's empty as per previous check.
    }

    const rows = []
    let idCounter = 1;
    // If ID is not auto-increment, we need to handle it.
    // Let's assume we can provide ID.

    for (const [region, countries] of Object.entries(COUNTRIES_BY_REGION)) {
        for (const country of countries) {
            rows.push({
                // id: idCounter++, // Let's try to let the DB handle ID first. If it fails, we add it.
                pais: country,
                continente: region,
                ddi: '+00', // Placeholder
                bandeira: 'https://placehold.co/40x30' // Placeholder
            })
        }
    }

    // Insert in batches
    const batchSize = 100
    for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize)
        const { error } = await supabase.from('paises').insert(batch)
        if (error) {
            console.error('Error inserting batch:', error)
            // If error is about NULL ID, we retry with IDs.
            if (error.message.includes("null value in column \"id\"")) {
                console.log("Auto-increment missing, retrying with manual IDs...")
                const batchWithIds = batch.map((r, idx) => ({ ...r, id: idCounter++ }))
                // Reset counter for next batches if we were to continue, but simplicity:
                // We need to restart the whole process with IDs if this fails.
                // For now, let's just abort and fix script.
                process.exit(1)
            }
        } else {
            console.log(`Inserted batch ${i} to ${i + batchSize}`)
        }
    }

    console.log('Seed completed.')
}

seedPaises()
