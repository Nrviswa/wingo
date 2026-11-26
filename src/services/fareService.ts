import { getPlaceById } from '../data/places';
import type { AutoFareLeg, AutoFareQuote, Coordinates, Place, TownId } from '../types/tourism';
import { withMockLatency } from './apiClient';

const EARTH_RADIUS_KM = 6371;

export function haversineKm(a: Coordinates, b: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  const straightLine = 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
  // Road factor (~1.28x straight line in historic Tamil Nadu town grids)
  return Math.max(0.8, Number((straightLine * 1.28).toFixed(1)));
}

/**
 * Nearest-neighbor heuristic starting from the earliest stop to minimize backtracking.
 */
export function optimizeStopOrder(places: Place[]): Place[] {
  if (places.length <= 2) return places;
  const remaining = [...places];
  const ordered: Place[] = [remaining.shift()!];

  while (remaining.length > 0) {
    const current = ordered[ordered.length - 1];
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const dist = haversineKm(current.coordinates, remaining[i].coordinates);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    ordered.push(remaining.splice(bestIdx, 1)[0]);
  }
  return ordered;
}

const TOWN_RATE_CARD: Record<
  TownId,
  { baseFareInr: number; perKmInr: number; waitingPerStopInr: number; fullDayInr: number }
> = {
  madurai: {
    baseFareInr: 45,
    perKmInr: 18,
    waitingPerStopInr: 35,
    fullDayInr: 950, // Verify before launch
  },
  kumbakonam: {
    baseFareInr: 40,
    perKmInr: 16,
    waitingPerStopInr: 30,
    fullDayInr: 850, // Verify before launch
  },
};

/**
 * Mock `/api/fare` service — calculates transparent per-leg auto fare breakdown
 * plus optional full-day package pricing.
 */
export const fareService = {
  async calculateFare(
    townId: TownId,
    selectedPlaceIds: string[],
    mode: 'perLeg' | 'fullDay'
  ): Promise<AutoFareQuote> {
    return withMockLatency(() => {
      const places = selectedPlaceIds
        .map((id) => getPlaceById(id))
        .filter((p): p is Place => Boolean(p));

      const ordered = optimizeStopOrder(places);
      const rate = TOWN_RATE_CARD[townId];

      const legs: AutoFareLeg[] = [];
      let totalDistanceKm = 0;
      let totalTravelMinutes = 0;
      let baseTotalInr = 0;
      let distanceTotalInr = 0;
      let waitingTotalInr = 0;

      if (ordered.length === 1) {
        // Single-stop local pickup estimate
        const legTotal = rate.baseFareInr + Math.round(2.0 * rate.perKmInr);
        legs.push({
          fromPlaceId: 'town-center',
          toPlaceId: ordered[0].id,
          distanceKm: 2.0,
          travelMinutes: 10,
          baseFareInr: rate.baseFareInr,
          distanceFareInr: Math.round(2.0 * rate.perKmInr),
          waitingChargeInr: 0,
          legTotalInr: legTotal,
        });
        totalDistanceKm = 2.0;
        totalTravelMinutes = 10;
        baseTotalInr = rate.baseFareInr;
        distanceTotalInr = Math.round(2.0 * rate.perKmInr);
      } else {
        for (let i = 0; i < ordered.length - 1; i++) {
          const from = ordered[i];
          const to = ordered[i + 1];
          const distanceKm = haversineKm(from.coordinates, to.coordinates);
          const travelMinutes = Math.max(6, Math.round((distanceKm / 22) * 60));
          const baseFareInr = i === 0 ? rate.baseFareInr : 25;
          const distanceFareInr = Math.round(distanceKm * rate.perKmInr);
          const waitingChargeInr = rate.waitingPerStopInr;
          const legTotalInr = baseFareInr + distanceFareInr + waitingChargeInr;

          legs.push({
            fromPlaceId: from.id,
            toPlaceId: to.id,
            distanceKm,
            travelMinutes,
            baseFareInr,
            distanceFareInr,
            waitingChargeInr,
            legTotalInr,
          });

          totalDistanceKm = Number((totalDistanceKm + distanceKm).toFixed(1));
          totalTravelMinutes += travelMinutes;
          baseTotalInr += baseFareInr;
          distanceTotalInr += distanceFareInr;
          waitingTotalInr += waitingChargeInr;
        }
      }

      const perLegSum = baseTotalInr + distanceTotalInr + waitingTotalInr;
      const grandTotalInr = mode === 'fullDay' ? rate.fullDayInr : perLegSum;

      return {
        mode,
        totalDistanceKm,
        totalTravelMinutes,
        legs,
        baseTotalInr,
        distanceTotalInr,
        waitingTotalInr,
        fullDayPackageInr: rate.fullDayInr,
        grandTotalInr,
        orderedPlaceIds: ordered.map((p) => p.id),
      };
    }, 110);
  },
};
