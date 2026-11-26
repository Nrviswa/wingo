import { getPlaceById } from '../data/places';
import type { DayOfWeek, TempleOpenStatus, TownId, WeatherStatus } from '../types/tourism';
import { withMockLatency } from './apiClient';

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Mock `/api/weather` & `/api/temple-status` services.
 */
export const liveStatusService = {
  async getWeather(townId: TownId): Promise<WeatherStatus> {
    return withMockLatency(() => {
      const hour = new Date().getHours();
      const conditionKey: WeatherStatus['conditionKey'] =
        hour < 8
          ? 'pleasantDawn'
          : hour < 16
            ? 'warmSunny'
            : hour < 19
              ? 'breezyEvening'
              : 'partlyCloudy';

      return {
        townId,
        tempC: townId === 'madurai' ? (hour < 9 ? 26 : 33) : hour < 9 ? 25 : 31,
        conditionKey,
        humidityPercent: townId === 'madurai' ? 58 : 68,
        sunrise: '06:04',
        sunset: '18:12',
        updatedAt: new Date().toISOString(),
      };
    }, 80);
  },

  async getPlaceOpenStatus(
    placeId: string,
    slotTime: string,
    day: DayOfWeek
  ): Promise<TempleOpenStatus> {
    return withMockLatency(() => {
      const place = getPlaceById(placeId);
      if (!place) {
        return { placeId, statusKey: 'openNow', nextWindow: '06:00 – 20:00' };
      }
      if (place.openHours.closedDays?.includes(day)) {
        return {
          placeId,
          statusKey: 'closedToday',
          nextWindow: `${place.openHours.morningOpen} – ${place.openHours.morningClose}`,
        };
      }

      const slotMin = toMinutes(slotTime);
      const mOpen = toMinutes(place.openHours.morningOpen);
      const mClose = toMinutes(place.openHours.morningClose);
      const eOpen = place.openHours.eveningOpen ? toMinutes(place.openHours.eveningOpen) : null;
      const eClose = place.openHours.eveningClose ? toMinutes(place.openHours.eveningClose) : null;

      if (slotMin >= mOpen && slotMin <= mClose) {
        return {
          placeId,
          statusKey: 'openNow',
          nextWindow: `${place.openHours.morningOpen} – ${place.openHours.morningClose}`,
        };
      }
      if (eOpen !== null && eClose !== null) {
        if (slotMin >= eOpen && slotMin <= eClose) {
          return {
            placeId,
            statusKey: 'openNow',
            nextWindow: `${place.openHours.eveningOpen} – ${place.openHours.eveningClose}`,
          };
        }
        if (slotMin > mClose && slotMin < eOpen) {
          return {
            placeId,
            statusKey: 'noonBreak',
            nextWindow: `${place.openHours.eveningOpen} – ${place.openHours.eveningClose}`,
          };
        }
      }

      return {
        placeId,
        statusKey: 'opensSoon',
        nextWindow: `${place.openHours.morningOpen} – ${place.openHours.morningClose}`,
      };
    }, 60);
  },
};
