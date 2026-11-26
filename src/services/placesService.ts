import { PLACES } from '../data/places';
import { TOWNS } from '../data/towns';
import type { ExperienceCategory, Place, TownId, TownInfo } from '../types/tourism';
import { readOfflineCache, withMockLatency, writeOfflineCache } from './apiClient';

/**
 * Mock `/api/places` service — structured for drop-in replacement with fetch('/api/places').
 */
export const placesService = {
  async listTowns(): Promise<TownInfo[]> {
    return withMockLatency(() => {
      writeOfflineCache('towns', TOWNS);
      return TOWNS;
    }, 90);
  },

  async listPlaces(townId?: TownId, category?: ExperienceCategory): Promise<Place[]> {
    const cacheKey = `places:${townId ?? 'all'}:${category ?? 'all'}`;
    try {
      return await withMockLatency(() => {
        const result = PLACES.filter((place) => {
          if (townId && place.townId !== townId) return false;
          if (category && place.category !== category) return false;
          return true;
        });
        writeOfflineCache(cacheKey, result);
        return result;
      }, 120);
    } catch {
      return readOfflineCache<Place[]>(cacheKey) ?? [];
    }
  },
};
