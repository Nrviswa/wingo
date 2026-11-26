import { AUTO_DRIVERS } from '../data/locals';
import type {
  AutoDriver,
  DayOfWeek,
  ExperienceCategory,
  PaymentMethod,
  TownId,
  TripBooking,
} from '../types/tourism';
import { withMockLatency } from './apiClient';

export interface CreateBookingPayload {
  townId: TownId;
  category: ExperienceCategory;
  day: DayOfWeek;
  placeIds: string[];
  totalDurationMin: number;
  entryFeesInr: number;
  needAuto: boolean;
  autoMode: 'perLeg' | 'fullDay';
  autoFareInr: number;
  driver: AutoDriver | null;
  paymentMethod: PaymentMethod;
}

/**
 * Mock `/api/booking` service — returns confirmed booking + local driver assignment.
 */
export const bookingService = {
  async getAssignedDriver(townId: TownId): Promise<AutoDriver> {
    return withMockLatency(() => {
      const townDrivers = AUTO_DRIVERS.filter((d) => d.townId === townId);
      return townDrivers[0] ?? AUTO_DRIVERS[0];
    }, 80);
  },

  async createBooking(payload: CreateBookingPayload): Promise<TripBooking> {
    return withMockLatency(() => {
      const rand = Math.floor(1000 + Math.random() * 9000);
      const townCode = payload.townId === 'madurai' ? 'MDU' : 'KMU';
      const totalPaidInr = payload.entryFeesInr + (payload.needAuto ? payload.autoFareInr : 0);

      return {
        bookingId: `WNG-${townCode}-${rand}`,
        createdAt: new Date().toISOString(),
        townId: payload.townId,
        category: payload.category,
        day: payload.day,
        placeIds: payload.placeIds,
        totalDurationMin: payload.totalDurationMin,
        entryFeesInr: payload.entryFeesInr,
        needAuto: payload.needAuto,
        autoMode: payload.autoMode,
        autoFareInr: payload.needAuto ? payload.autoFareInr : 0,
        driver: payload.needAuto ? payload.driver : null,
        paymentMethod: payload.paymentMethod,
        totalPaidInr,
        status: 'confirmed',
        cachedOffline: true,
      };
    }, 240);
  },
};
