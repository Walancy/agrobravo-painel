import { Event } from "@/types/itinerary";

export const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return null;

    const startParts = start.split(':').map(Number);
    const endParts = end.split(':').map(Number);

    if (startParts.length !== 2 || endParts.length !== 2 || startParts.some(isNaN) || endParts.some(isNaN)) {
        return null;
    }

    const [startH, startM] = startParts;
    const [endH, endM] = endParts;

    let diffM = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffM < 0) diffM += 24 * 60; // Handle midnight crossing

    const h = Math.floor(diffM / 60);
    const m = diffM % 60;

    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
};

export const formatTime = (time: string | undefined) => {
    if (!time) return "";
    // Remove seconds if present (e.g., "09:50:00" -> "09:50")
    const parts = time.split(':');
    if (parts.length >= 2) {
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return time;
};

// Helper to parse currency string to number
export const parseCurrency = (value: string | undefined) => {
    if (!value) return 0;
    let priceStr = value.replace(/[R$\s]/g, '');
    const lastComma = priceStr.lastIndexOf(',');
    const lastDot = priceStr.lastIndexOf('.');

    if (lastComma > lastDot) {
        priceStr = priceStr.replace(/\./g, '').replace(',', '.');
    } else if (lastDot > lastComma) {
        priceStr = priceStr.replace(/,/g, '');
    }
    return parseFloat(priceStr) || 0;
};

export const formatTotalPrice = (price: string | undefined, passengers: any[] | undefined) => {
    if (!price) return "";
    const unitPrice = parseCurrency(price);
    const passengerCount = passengers?.length || 1;
    const total = unitPrice * passengerCount;

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0
    }).format(total);
};

// Helper to get totals by category
export const getCategoryTotals = (events: Event[]) => {
    const totals: Record<string, number> = {};
    events.forEach(event => {
        if (event.price) {
            const unitPrice = parseCurrency(event.price);
            const passengerCount = event.type === 'flight' ? (event.passengers?.length || 1) : 1;
            const amount = unitPrice * passengerCount;

            if (amount > 0) {
                const category = event.type === 'flight' ? 'Voo' :
                    event.type === 'hotel' ? 'Hospedagem' :
                        event.type === 'visit' ? 'Visita' :
                            event.type === 'food' || event.type === 'meal' ? 'Alimentação' :
                                event.type === 'transfer' || event.type === 'return' ? 'Transporte' :
                                    event.type === 'leisure' ? 'Lazer' : 'Outros';

                totals[category] = (totals[category] || 0) + amount;
            }
        }
    });
    return totals;
};

export const hasTripConflicts = (events: Event[]) => {
    if (events.length < 2) return false;

    const parseTime = (t: string) => {
        if (!t) return 0;
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

    // Sort events by time
    const sortedEvents = [...events].sort((a, b) => parseTime(a.fromTime || a.time) - parseTime(b.fromTime || b.time));

    for (let i = 0; i < sortedEvents.length - 1; i++) {
        const event = sortedEvents[i];
        const nextEvent = sortedEvents[i + 1];

        let currentEndTimeMin = 0;
        const endTimeStr = event.toTime || event.endTime;

        if (endTimeStr) {
            currentEndTimeMin = parseTime(endTimeStr);
        } else {
            const startTimeMin = parseTime(event.time);
            let durationMin = 0;
            if (event.duration) {
                const match = event.duration.match(/(\d+)\s*h\s*(\d+)?|(\d+)\s*h|(\d+)\s*min/);
                if (match) {
                    if (match[4]) durationMin = parseInt(match[4]);
                    else if (match[3]) durationMin = parseInt(match[3]) * 60;
                    else {
                        const h = parseInt(match[1] || '0');
                        const m = parseInt(match[2] || '0');
                        durationMin = h * 60 + m;
                    }
                }
            }
            currentEndTimeMin = startTimeMin + durationMin;
        }

        const nextStartMin = parseTime(nextEvent.fromTime || nextEvent.time);

        if (nextStartMin < currentEndTimeMin) {
            return true;
        }
    }

    return false;
};
