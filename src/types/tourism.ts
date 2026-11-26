export type SupportedLocale =
  | 'ta'
  | 'te'
  | 'kn'
  | 'ml'
  | 'hi'
  | 'en-IN'
  | 'en-GB'
  | 'de'
  | 'zh-CN';

export type TownId = 'madurai' | 'kumbakonam';

export type ExperienceCategory = 'temples' | 'localPlaces' | 'riversNature' | 'chillVibes';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type EmpowermentBadge = 'localOwned' | 'womenRun' | 'ecoFriendly';

export type PaymentMethod = 'upi' | 'card' | 'cash';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TownInfo {
  id: TownId;
  tamilName: string;
  heroImage: string;
  heroSrcSet?: string;
  coordinates: Coordinates;
  regionTag: string;
  comingSoon?: boolean;
}

export interface Place {
  id: string;
  townId: TownId;
  category: ExperienceCategory;
  isTemple: boolean;
  originalTamilName: string;
  coordinates: Coordinates;
  image: string;
  imageSrcSet?: string;
  defaultTimeSlot: string;
  durationMinutes: number;
  entryFeeInr: number;
  openHours: {
    morningOpen: string;
    morningClose: string;
    eveningOpen?: string;
    eveningClose?: string;
    closedDays?: DayOfWeek[];
  };
  verifyBeforeLaunch?: boolean;
  badges?: EmpowermentBadge[];
}

export interface ItinerarySlot {
  placeId: string;
  timeSlot: string; // e.g. "04:00"
  durationMinutes: number;
  dayHighlightKey?: string;
  isSpecialPooja?: boolean;
  isMarketDay?: boolean;
  isClosedNotice?: boolean;
}

export interface DayItinerary {
  townId: TownId;
  category: ExperienceCategory;
  day: DayOfWeek;
  dayThemeKey: string;
  slots: ItinerarySlot[];
}

export interface AutoFareLeg {
  fromPlaceId: string;
  toPlaceId: string;
  distanceKm: number;
  travelMinutes: number;
  baseFareInr: number;
  distanceFareInr: number;
  waitingChargeInr: number;
  legTotalInr: number;
}

export interface AutoFareQuote {
  mode: 'perLeg' | 'fullDay';
  totalDistanceKm: number;
  totalTravelMinutes: number;
  legs: AutoFareLeg[];
  baseTotalInr: number;
  distanceTotalInr: number;
  waitingTotalInr: number;
  fullDayPackageInr: number;
  grandTotalInr: number;
  orderedPlaceIds: string[];
}

export interface AutoDriver {
  id: string;
  townId: TownId;
  name: string;
  autoNumber: string;
  rating: number;
  tripsCompleted: number;
  phoneDisplay: string;
  languages: string[];
  vehicleType: 'EV Auto' | 'CNG Auto' | 'Classic Yellow-Black';
  badges: EmpowermentBadge[];
}

export interface TransitHub {
  id: string;
  townId: TownId;
  type: 'busStand' | 'railwayStation';
  tamilName: string;
  coordinates: Coordinates;
  firstService: string;
  lastService: string;
  approxLocalBusFareInr: number;
  approxAutoFareInr: number;
}

export interface TransitRecommendation {
  arrivalHub: TransitHub;
  arrivalDistanceKm: number;
  arrivalTravelMin: number;
  departureHub: TransitHub;
  departureDistanceKm: number;
  departureTravelMin: number;
  allHubs: TransitHub[];
}

export interface LocalVendor {
  id: string;
  townId: TownId;
  role: 'guide' | 'driver' | 'artisan' | 'eatery';
  name: string;
  tamilName: string;
  experienceYears: number;
  languages: string[];
  rating: number;
  badges: EmpowermentBadge[];
  startingPriceInr: number;
  phoneDisplay: string;
  verifyBeforeLaunch?: boolean;
}

export interface WeatherStatus {
  townId: TownId;
  tempC: number;
  conditionKey: 'pleasantDawn' | 'warmSunny' | 'breezyEvening' | 'partlyCloudy';
  humidityPercent: number;
  sunrise: string;
  sunset: string;
  updatedAt: string;
}

export interface TempleOpenStatus {
  placeId: string;
  statusKey: 'openNow' | 'noonBreak' | 'closedToday' | 'opensSoon';
  nextWindow: string;
}

export interface TripBooking {
  bookingId: string;
  createdAt: string;
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
  totalPaidInr: number;
  status: 'confirmed' | 'completed';
  cachedOffline: boolean;
}
