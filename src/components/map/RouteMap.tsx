import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import type { MapAdapterConfig } from '../../services/map/MapAdapter';

interface RouteMapProps {
  config: MapAdapterConfig;
}

/**
 * Leaflet + OpenStreetMap implementation of the abstracted MapAdapterConfig.
 * Replacing this component with a Google Maps JS API wrapper requires zero changes
 * in MapPage or route optimization services.
 */
export const RouteMap: React.FC<RouteMapProps> = ({ config }) => {
  const { t: tPlaces } = useTranslation('places');
  const { t: tBooking } = useTranslation('booking');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center: [config.center.lat, config.center.lng],
        zoom: config.zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear previous markers and polylines
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    if (config.routePath.length > 1) {
      const latLngs = config.routePath.map((c) => [c.lat, c.lng] as [number, number]);
      L.polyline(latLngs, {
        color: '#5C1324',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 6',
      }).addTo(map);
    }

    const bounds: [number, number][] = [];

    config.markers.forEach((m) => {
      const pos: [number, number] = [m.place.coordinates.lat, m.place.coordinates.lng];
      bounds.push(pos);

      const icon = L.divIcon({
        className: 'wingo-numbered-marker',
        html: `<div style="width:32px;height:32px;border-radius:9999px;background:#5C1324;color:#FBF7F0;border:2px solid #E5BE73;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;box-shadow:0 4px 10px rgba(0,0,0,0.3);">${m.orderNumber}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const title = tPlaces(`items.${m.place.id}.name`);
      const stopLabel = tBooking('stopNumber', { num: m.orderNumber });

      L.marker(pos, { icon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:inherit;min-width:160px;">
            <div style="font-size:11px;font-weight:600;color:#5C1324;">${stopLabel}</div>
            <div style="font-size:13px;font-weight:700;margin-top:2px;">${title}</div>
          </div>`
        );
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    }
  }, [config, tPlaces, tBooking]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gold/30 shadow-lg">
      <div
        ref={containerRef}
        className="h-72 w-full bg-ivory-warm sm:h-80 dark:bg-night-card"
        aria-label={tBooking('mapTitle')}
      />
      <div className="border-t border-gold/20 bg-ivory/90 px-3 py-1.5 text-[11px] font-medium text-muted dark:bg-night-card/90 dark:text-ivory/65">
        {tBooking('providerBadge')}
      </div>
    </div>
  );
};
