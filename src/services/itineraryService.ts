import { buildDayItinerary } from '../data/itineraries';
import type { DayItinerary, DayOfWeek, ExperienceCategory, TownId } from '../types/tourism';
import { readOfflineCache, withMockLatency, writeOfflineCache } from './apiClient';

/**
 * Mock `/api/itinerary` service — caches selected itineraries for offline resilience.
 */
export const itineraryService = {
  async getDayItinerary(
    townId: TownId,
    category: ExperienceCategory,
    day: DayOfWeek
  ): Promise<DayItinerary> {
    const cacheKey = `itinerary:${townId}:${category}:${day}`;
    try {
      return await withMockLatency(() => {
        const itinerary = buildDayItinerary(townId, category, day);
        writeOfflineCache(cacheKey, itinerary);
        return itinerary;
      }, 140);
    } catch {
      const cached = readOfflineCache<DayItinerary>(cacheKey);
      if (cached) return cached;
      return buildDayItinerary(townId, category, day);
    }
  },
};
