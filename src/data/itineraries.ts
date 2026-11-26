import type { DayItinerary, DayOfWeek, ExperienceCategory, ItinerarySlot, TownId } from '../types/tourism';
import { PLACES } from './places';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const DAY_THEME_BY_DAY: Record<DayOfWeek, string> = {
  monday: 'dayThemeMonday',
  tuesday: 'dayThemeTuesday',
  wednesday: 'dayThemeWednesday',
  thursday: 'dayThemeThursday',
  friday: 'dayThemeFriday',
  saturday: 'dayThemeSaturday',
  sunday: 'dayThemeSunday',
};

/**
 * Generates sensible, varied day-by-day itineraries across Monday–Sunday for
 * Madurai and Kumbakonam across all 4 experience categories, honouring weekly
 * poojas, market days, museum closing days (e.g. Gandhi Museum closed Fridays),
 * and shifting order/time slots per day.
 */
export function buildDayItinerary(
  townId: TownId,
  category: ExperienceCategory,
  day: DayOfWeek
): DayItinerary {
  const townPlaces = PLACES.filter((p) => p.townId === townId && p.category === category);

  // Explicit Monday flagship curations matching prompt specifications
  if (townId === 'madurai' && category === 'temples' && day === 'monday') {
    return {
      townId,
      category,
      day,
      dayThemeKey: 'dayThemeMonday',
      slots: [
        {
          placeId: 'mdu-meenakshi',
          timeSlot: '04:00',
          durationMinutes: 120,
          dayHighlightKey: 'highlightSomavaramDawn',
          isSpecialPooja: true,
        },
        {
          placeId: 'mdu-thiruparankundram-temple',
          timeSlot: '06:30',
          durationMinutes: 75,
          dayHighlightKey: 'highlightMorningAbhishekam',
          isSpecialPooja: true,
        },
        {
          placeId: 'mdu-koodal-azhagar',
          timeSlot: '08:15',
          durationMinutes: 60,
        },
        {
          placeId: 'mdu-azhagar-kovil',
          timeSlot: '10:00',
          durationMinutes: 90,
        },
        {
          placeId: 'mdu-pazhamudhircholai',
          timeSlot: '11:45',
          durationMinutes: 60,
        },
      ],
    };
  }

  if (townId === 'madurai' && category === 'localPlaces' && day === 'monday') {
    return {
      townId,
      category,
      day,
      dayThemeKey: 'dayThemeMonday',
      slots: [
        {
          placeId: 'mdu-thiruparankundram-hill',
          timeSlot: '05:00',
          durationMinutes: 60,
          dayHighlightKey: 'highlightSunriseHill',
        },
        {
          placeId: 'mdu-busy-streets',
          timeSlot: '07:00',
          durationMinutes: 60,
          dayHighlightKey: 'highlightFlowerStalls',
        },
        {
          placeId: 'mdu-nayakkar-mahal',
          timeSlot: '09:00',
          durationMinutes: 75,
        },
        {
          placeId: 'mdu-kaikari-sandhai',
          timeSlot: '10:30',
          durationMinutes: 45,
          dayHighlightKey: 'highlightMarketPeak',
          isMarketDay: true,
        },
        {
          placeId: 'mdu-pandi-bazaar',
          timeSlot: '11:45',
          durationMinutes: 75,
        },
        {
          placeId: 'mdu-teppakulam-food',
          timeSlot: '18:30',
          durationMinutes: 60,
          dayHighlightKey: 'highlightStreetFood',
        },
      ],
    };
  }

  if (townId === 'kumbakonam' && category === 'temples' && day === 'monday') {
    return {
      townId,
      category,
      day,
      dayThemeKey: 'dayThemeMonday',
      slots: [
        {
          placeId: 'kmu-kasi-viswanathar',
          timeSlot: '06:00',
          durationMinutes: 60,
          dayHighlightKey: 'highlightSomavaramShiva',
          isSpecialPooja: true,
        },
        {
          placeId: 'kmu-someswarar',
          timeSlot: '07:15',
          durationMinutes: 75,
          dayHighlightKey: 'highlightSomavaramShiva',
          isSpecialPooja: true,
        },
        {
          placeId: 'kmu-sarangapani',
          timeSlot: '08:45',
          durationMinutes: 60,
        },
        {
          placeId: 'kmu-nageswaran',
          timeSlot: '16:30',
          durationMinutes: 60,
        },
        {
          placeId: 'kmu-chakrapani',
          timeSlot: '18:00',
          durationMinutes: 45,
        },
      ],
    };
  }

  // Varied order & timings for all other days (Tuesday - Sunday) and categories
  const dayIndex = DAYS_OF_WEEK.indexOf(day);
  const rotated = [...townPlaces];

  // Vary sequence on Tue/Thu/Sat to highlight different shrines/markets first
  if (dayIndex % 2 === 1 && rotated.length > 2) {
    const second = rotated[1];
    rotated[1] = rotated[0];
    rotated[0] = second;
  } else if (day === 'saturday' && rotated.length > 3) {
    const last = rotated.pop()!;
    rotated.unshift(last);
  }

  const slots: ItinerarySlot[] = rotated.map((place, idx) => {
    const isClosedToday = place.openHours.closedDays?.includes(day) ?? false;
    const isTemplePooja =
      place.isTemple &&
      ((day === 'tuesday' && place.id.includes('murugan')) ||
        (day === 'tuesday' && place.id.includes('thiruparankundram')) ||
        (day === 'tuesday' && place.id.includes('swamimalai')) ||
        (day === 'friday' && place.id.includes('meenakshi')) ||
        (day === 'saturday' && (place.id.includes('azhagar') || place.id.includes('sarangapani'))) ||
        (day === 'monday' && idx === 0));

    const isMarketSpecial =
      (day === 'wednesday' || day === 'saturday' || day === 'sunday') &&
      (place.id.includes('sandhai') || place.id.includes('market') || place.id.includes('bazaar'));

    // Slightly shift early-morning slots on weekends (+30 mins relaxed pace)
    let timeSlot = place.defaultTimeSlot;
    if ((day === 'saturday' || day === 'sunday') && timeSlot.startsWith('04:')) {
      timeSlot = '04:30';
    } else if ((day === 'thursday' || day === 'friday') && idx === 0 && category === 'temples') {
      timeSlot = place.townId === 'madurai' ? '04:30' : '05:45';
    }

    let dayHighlightKey: string | undefined;
    if (isClosedToday) {
      dayHighlightKey = 'highlightClosedNotice';
    } else if (isTemplePooja) {
      dayHighlightKey =
        day === 'friday'
          ? 'highlightFridayAmman'
          : day === 'saturday'
            ? 'highlightSaturdayPerumal'
            : day === 'tuesday'
              ? 'highlightTuesdayMurugan'
              : 'highlightSpecialPooja';
    } else if (isMarketSpecial) {
      dayHighlightKey = 'highlightWeeklyMarket';
    } else if (day === 'sunday' && category === 'chillVibes') {
      dayHighlightKey = 'highlightFestivalEvening';
    }

    return {
      placeId: place.id,
      timeSlot,
      durationMinutes: place.durationMinutes,
      dayHighlightKey,
      isSpecialPooja: isTemplePooja,
      isMarketDay: isMarketSpecial,
      isClosedNotice: isClosedToday,
    };
  });

  return {
    townId,
    category,
    day,
    dayThemeKey: DAY_THEME_BY_DAY[day],
    slots,
  };
}
