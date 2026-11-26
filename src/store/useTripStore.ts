import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DayOfWeek,
  ExperienceCategory,
  PaymentMethod,
  SupportedLocale,
  TownId,
  TripBooking,
} from '../types/tourism';
import { detectDeviceLocale, setAppLanguage } from '../i18n/config';

const SEEDED_PAST_TRIP: TripBooking = {
  bookingId: 'WNG-MDU-2048',
  createdAt: '2026-10-14T04:15:00.000Z',
  townId: 'madurai',
  category: 'temples',
  day: 'monday',
  placeIds: ['mdu-meenakshi', 'mdu-thiruparankundram-temple', 'mdu-koodal-azhagar'],
  totalDurationMin: 255,
  entryFeesInr: 0,
  needAuto: true,
  autoMode: 'perLeg',
  autoFareInr: 368,
  driver: {
    id: 'drv-mdu-1',
    townId: 'madurai',
    name: 'Senthil Murugan',
    autoNumber: 'TN 58 BX 4812',
    rating: 4.9,
    tripsCompleted: 428,
    phoneDisplay: '+91 98421 00142',
    languages: ['தமிழ்', 'English', 'हिन्दी'],
    vehicleType: 'EV Auto',
    badges: ['localOwned', 'ecoFriendly'],
  },
  paymentMethod: 'upi',
  totalPaidInr: 368,
  status: 'completed',
  cachedOffline: true,
};

interface TripState {
  locale: SupportedLocale;
  darkMode: boolean;
  selectedTown: TownId;
  selectedCategory: ExperienceCategory;
  selectedDay: DayOfWeek;
  selectedPlaceIds: string[];
  searchQuery: string;
  needAuto: boolean;
  autoMode: 'perLeg' | 'fullDay';
  paymentMethod: PaymentMethod;
  trips: TripBooking[];
  latestBookingId: string | null;

  setLocale: (locale: SupportedLocale) => void;
  toggleDarkMode: () => void;
  setTown: (townId: TownId) => void;
  setCategory: (category: ExperienceCategory) => void;
  setDay: (day: DayOfWeek) => void;
  setSelectedPlaceIds: (ids: string[]) => void;
  togglePlaceSelection: (placeId: string) => void;
  setSearchQuery: (q: string) => void;
  setNeedAuto: (need: boolean) => void;
  setAutoMode: (mode: 'perLeg' | 'fullDay') => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  addBooking: (booking: TripBooking) => void;
  loadTripIntoPlanner: (trip: TripBooking) => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      locale: detectDeviceLocale(),
      darkMode: false,
      selectedTown: 'madurai',
      selectedCategory: 'temples',
      selectedDay: 'monday',
      selectedPlaceIds: ['mdu-meenakshi', 'mdu-thiruparankundram-temple'],
      searchQuery: '',
      needAuto: true,
      autoMode: 'perLeg',
      paymentMethod: 'upi',
      trips: [SEEDED_PAST_TRIP],
      latestBookingId: null,

      setLocale: (locale) => {
        setAppLanguage(locale);
        set({ locale });
      },
      toggleDarkMode: () =>
        set((state) => {
          const next = !state.darkMode;
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', next);
          }
          return { darkMode: next };
        }),
      setTown: (selectedTown) =>
        set({
          selectedTown,
          selectedPlaceIds:
            selectedTown === 'madurai'
              ? ['mdu-meenakshi', 'mdu-thiruparankundram-temple']
              : ['kmu-kasi-viswanathar', 'kmu-someswarar'],
        }),
      setCategory: (selectedCategory) => set({ selectedCategory }),
      setDay: (selectedDay) => set({ selectedDay }),
      setSelectedPlaceIds: (selectedPlaceIds) => set({ selectedPlaceIds }),
      togglePlaceSelection: (placeId) =>
        set((state) => {
          const exists = state.selectedPlaceIds.includes(placeId);
          return {
            selectedPlaceIds: exists
              ? state.selectedPlaceIds.filter((id) => id !== placeId)
              : [...state.selectedPlaceIds, placeId],
          };
        }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setNeedAuto: (needAuto) => set({ needAuto }),
      setAutoMode: (autoMode) => set({ autoMode }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      addBooking: (booking) =>
        set((state) => ({
          trips: [booking, ...state.trips],
          latestBookingId: booking.bookingId,
        })),
      loadTripIntoPlanner: (trip) =>
        set({
          selectedTown: trip.townId,
          selectedCategory: trip.category,
          selectedDay: trip.day,
          selectedPlaceIds: trip.placeIds,
          needAuto: trip.needAuto,
          autoMode: trip.autoMode,
        }),
    }),
    {
      name: 'wingo-tourism-store',
      onRehydrateStorage: () => (state) => {
        if (state) {
          setAppLanguage(state.locale);
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', state.darkMode);
          }
        }
      },
    }
  )
);
