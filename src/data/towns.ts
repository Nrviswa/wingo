import type { TownInfo } from '../types/tourism';

export const TOWNS: TownInfo[] = [
  {
    id: 'madurai',
    tamilName: 'மதுரை',
    heroImage: '/images/madurai-meenakshi-800.jpg',
    heroSrcSet: '/images/madurai-meenakshi-800.jpg 800w, /images/madurai-meenakshi.jpg 1600w',
    coordinates: { lat: 9.9195, lng: 78.1193 },
    regionTag: 'Vaigai Heritage Basin',
  },
  {
    id: 'kumbakonam',
    tamilName: 'கும்பகோணம்',
    heroImage: '/images/kumbakonam-mahamaham-800.jpg',
    heroSrcSet: '/images/kumbakonam-mahamaham-800.jpg 800w, /images/kumbakonam-mahamaham.jpg 1600w',
    coordinates: { lat: 10.9597, lng: 79.3834 },
    regionTag: 'Cauvery Delta Temple Circuit',
  },
];

export function getTownById(id: string): TownInfo {
  return TOWNS.find((t) => t.id === id) ?? TOWNS[0];
}
