import type { Coordinates, Place } from '../../types/tourism';

export interface MapMarkerPoint {
  place: Place;
  orderNumber: number;
  timeSlot: string;
}

export interface MapLegSegment {
  from: Coordinates;
  to: Coordinates;
  distanceKm: number;
  travelMinutes: number;
}

export interface MapAdapterConfig {
  provider: 'leaflet-osm' | 'google-maps';
  center: Coordinates;
  zoom: number;
  markers: MapMarkerPoint[];
  routePath: Coordinates[];
}

/**
 * Abstraction layer for map rendering & route geometry.
 * Currently backed by Leaflet + OpenStreetMap (no API key required).
 * Swap provider implementation to Google Maps SDK when a production key is configured.
 */
export function buildMapAdapterConfig(
  markers: MapMarkerPoint[],
  fallbackCenter: Coordinates
): MapAdapterConfig {
  const center = markers.length > 0 ? markers[0].place.coordinates : fallbackCenter;
  const routePath = markers.map((m) => m.place.coordinates);

  return {
    provider: 'leaflet-osm',
    center,
    zoom: markers.length > 1 ? 13 : 14,
    markers,
    routePath,
  };
}
