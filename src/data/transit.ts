import type { TransitHub } from '../types/tourism';

export const TRANSIT_HUBS: TransitHub[] = [
  // Madurai
  {
    id: 'mdu-junction',
    townId: 'madurai',
    type: 'railwayStation',
    tamilName: 'மதுரை சந்திப்பு இரயில் நிலையம்',
    coordinates: { lat: 9.9196, lng: 78.1102 },
    firstService: '04:10',
    lastService: '23:45',
    approxLocalBusFareInr: 15,
    approxAutoFareInr: 90,
  },
  {
    id: 'mdu-periyar-bus',
    townId: 'madurai',
    type: 'busStand',
    tamilName: 'பெரியார் பேருந்து நிலையம்',
    coordinates: { lat: 9.9147, lng: 78.1128 },
    firstService: '04:00',
    lastService: '23:30',
    approxLocalBusFareInr: 12,
    approxAutoFareInr: 80,
  },
  {
    id: 'mdu-mattuthavani-bus',
    townId: 'madurai',
    type: 'busStand',
    tamilName: 'மாட்டுத்தாவணி (எம்.ஜி.ஆர்) ஒருங்கிணைந்த பேருந்து நிலையம்',
    coordinates: { lat: 9.9394, lng: 78.1525 },
    firstService: '04:00',
    lastService: '23:55',
    approxLocalBusFareInr: 20,
    approxAutoFareInr: 160,
  },

  // Kumbakonam
  {
    id: 'kmu-bus-stand',
    townId: 'kumbakonam',
    type: 'busStand',
    tamilName: 'கும்பகோணம் புதிய பேருந்து நிலையம்',
    coordinates: { lat: 10.9562, lng: 79.3894 },
    firstService: '04:30',
    lastService: '23:15',
    approxLocalBusFareInr: 12,
    approxAutoFareInr: 80,
  },
  {
    id: 'kmu-railway-station',
    townId: 'kumbakonam',
    type: 'railwayStation',
    tamilName: 'கும்பகோணம் இரயில் நிலையம்',
    coordinates: { lat: 10.9539, lng: 79.3926 },
    firstService: '04:15',
    lastService: '23:30',
    approxLocalBusFareInr: 15,
    approxAutoFareInr: 90,
  },
];
