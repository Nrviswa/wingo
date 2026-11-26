import { getPlaceById } from '../data/places';
import { TRANSIT_HUBS } from '../data/transit';
import type { Place, TownId, TransitHub, TransitRecommendation } from '../types/tourism';
import { withMockLatency } from './apiClient';
import { haversineKm } from './fareService';

function findNearestHub(hubs: TransitHub[], target: Place | undefined): {
  hub: TransitHub;
  distanceKm: number;
  travelMin: number;
} {
  if (!target) {
    return { hub: hubs[0], distanceKm: 1.5, travelMin: 8 };
  }
  let best = hubs[0];
  let bestDist = Infinity;
  for (const hub of hubs) {
    const dist = haversineKm(hub.coordinates, target.coordinates);
    if (dist < bestDist) {
      bestDist = dist;
      best = hub;
    }
  }
  return {
    hub: best,
    distanceKm: bestDist,
    travelMin: Math.max(5, Math.round((bestDist / 20) * 60)),
  };
}

/**
 * Mock `/api/transit` service — matches nearest bus stand / railway station to
 * the first and last place in the user's itinerary.
 */
export const transitService = {
  async getTransitGuidance(
    townId: TownId,
    orderedPlaceIds: string[]
  ): Promise<TransitRecommendation> {
    return withMockLatency(() => {
      const hubs = TRANSIT_HUBS.filter((h) => h.townId === townId);
      const firstPlace = orderedPlaceIds.length ? getPlaceById(orderedPlaceIds[0]) : undefined;
      const lastPlace = orderedPlaceIds.length
        ? getPlaceById(orderedPlaceIds[orderedPlaceIds.length - 1])
        : undefined;

      const arrival = findNearestHub(hubs, firstPlace);
      const departure = findNearestHub(hubs, lastPlace);

      return {
        arrivalHub: arrival.hub,
        arrivalDistanceKm: arrival.distanceKm,
        arrivalTravelMin: arrival.travelMin,
        departureHub: departure.hub,
        departureDistanceKm: departure.distanceKm,
        departureTravelMin: departure.travelMin,
        allHubs: hubs,
      };
    }, 110);
  },
};
