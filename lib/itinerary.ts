export type FlightSegment = { from: string; to: string; date: string };
export type LocalTrip = { id: string; name: string; type: 'one-way' | 'round-trip' | 'multi-city'; passengers: number; segments: FlightSegment[]; savedAt: string };
export const TRIPS_KEY = 'exjet.trip-plans.v1';
export function itineraryError(segments: FlightSegment[], passengers: number, today: string): string | null {
  if (!Number.isInteger(passengers) || passengers < 1 || passengers > 100) return 'Choose between 1 and 100 passengers.';
  if (!segments.length || segments.length > 6) return 'Add between one and six flights.';
  for (let i = 0; i < segments.length; i++) {
    const flight = segments[i];
    if (!flight.from.trim() || !flight.to.trim()) return `Add both airports for flight ${i + 1}.`;
    if (flight.from.trim().toLowerCase() === flight.to.trim().toLowerCase()) return `Choose different airports for flight ${i + 1}.`;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(flight.date) || Number.isNaN(Date.parse(flight.date)) || new Date(flight.date).toISOString().slice(0, 10) !== flight.date || flight.date < today) return `Choose a valid upcoming date for flight ${i + 1}.`;
    if (i && flight.date < segments[i - 1].date) return 'Flights must be in date order.';
  }
  return null;
}
export function readLocalTrips(): LocalTrip[] {
  const raw: unknown = JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');
  if (!Array.isArray(raw)) return [];
  return raw.filter((t): t is LocalTrip => Boolean(t && typeof t.id === 'string' && typeof t.name === 'string' && ['one-way', 'round-trip', 'multi-city'].includes(t.type) && Number.isInteger(t.passengers) && t.passengers > 0 && t.passengers <= 100 && Array.isArray(t.segments) && t.segments.length > 0 && t.segments.length <= 6 && t.segments.every((s: FlightSegment) => s && typeof s.from === 'string' && typeof s.to === 'string' && typeof s.date === 'string'))).slice(0, 50);
}
export function tripText(trip: Pick<LocalTrip, 'segments' | 'passengers'>) {
  return `EXJET charter itinerary\n${trip.segments.map((s, i) => `${i + 1}. ${s.from} → ${s.to} · ${s.date}`).join('\n')}\n${trip.passengers} passengers\nPlease advise on aircraft options, availability and total pricing.`;
}
