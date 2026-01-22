import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const mode = searchParams.get('mode') || 'driving';
    const departureTime = searchParams.get('departure_time');

    if (!origin || !destination) {
        return NextResponse.json({ error: 'Origin and destination are required' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    try {
        let url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&mode=${mode}&key=${apiKey}`;

        if (departureTime) {
            url += `&departure_time=${departureTime}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK') {
            throw new Error(data.error_message || 'Google API Error');
        }

        const element = data.rows[0].elements[0];

        if (element.status !== 'OK') {
            return NextResponse.json({ error: 'No route found' }, { status: 404 });
        }

        // Use duration_in_traffic if available and mode is driving
        const duration = (mode === 'driving' && element.duration_in_traffic)
            ? element.duration_in_traffic
            : element.duration;

        return NextResponse.json({
            durationText: duration.text,
            durationValue: duration.value,
            distanceText: element.distance.text
        });
    } catch (error: any) {
        console.error('Distance Matrix API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
