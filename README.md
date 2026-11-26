# Wingo Tourism — Local Tourism, Empowered

A mobile-first, multi-language one-day heritage trip planner for Tamil Nadu towns (**Madurai** and **Kumbakonam**), featuring curated weekday-aware timelines, OpenStreetMap routing, transparent local auto-rickshaw fare breakdowns, offline QR passes, and bus/rail transit guidance.

## Features

- **9 Supported Locales**: Tamil (`ta`), Telugu (`te`), Kannada (`kn`), Malayalam (`ml`), Hindi (`hi`), English India (`en-IN`), English UK (`en-GB`), German (`de`), and Chinese Simplified (`zh-CN`).
- **Dynamic Font Loading**: Loads only the active language's Google Noto font subset (`font-display: swap`), paired with `Cormorant Garamond` and `Inter`.
- **Locale-Aware Formatting**: Uses `Intl.DateTimeFormat` and `Intl.NumberFormat` for dates, times, numbers, and `₹` currency (plus `approx.` converted GBP/EUR/CNY for `en-GB`, `de`, and `zh-CN`).
- **Fail-Fast i18n Build Check**: `npm run check:i18n` validates 100% key parity across all 6 namespaces (`common`, `welcome`, `places`, `itinerary`, `booking`, `transit`) and all 9 locales.
- **Weekday-Aware Curated Itineraries**: Timings, special pooja badges, weekly markets, and closing-day notices (e.g. Friday museum closure) adjust dynamically across Monday–Sunday.
- **Abstracted Map Layer**: Leaflet + OpenStreetMap (zero API keys) behind `src/services/map/MapAdapter.ts` so Google Maps can be swapped in without touching UI screens.
- **Local Empowerment**: Direct profiles and empowerment badges (`Local Owned`, `Women-Run`, `Eco-friendly`) for guides, EV auto drivers, weavers, and local kitchens.
- **Emergency & Support (SOS)**: Floating high-contrast SOS button on every screen opening an offline-ready emergency bottom sheet (Police `100`, Ambulance `108`, Fire `101`, Wingo Support `+91-XXXXX-XXXXX`, mock support chat, and active booking issue shortcut) translated natively across all 9 locales.

## Folder Structure

```text
wingo-tourism/
├── scripts/
│   └── check-i18n.mjs          # Build-time missing translation key gate
├── public/images/              # Responsive 1x/2x heritage photography
└── src/
    ├── components/             # AppShell, PlaceCard, RouteMap, LanguageSwitcher, VisitorTipsCard
    ├── data/                   # Towns, 35 places, Mon-Sun itineraries, transit hubs, local vendors
    ├── i18n/                   # Config + 54 modular JSON namespace files (9 locales × 6 namespaces)
    ├── pages/                  # Lazy-loaded route screens (Welcome -> Confirmation -> Transit/Trips)
    ├── services/               # Swappable mock API layer (/api/places, itinerary, fare, booking, transit)
    ├── store/                  # Zustand persisted store + offline itinerary cache
    ├── types/                  # TypeScript domain definitions
    └── utils/                  # Intl currency/time/number formatters
```

## Setup & Run

> **Prerequisites**: Node.js v20+ (installed locally at `~/.nvm/versions/node/v24.22.3/bin` if not already on your `PATH`).

```bash
cd wingo-tourism
npm install
npm run dev
```

To run the production verification gate (i18n key check + TypeScript check + Vite bundle):

```bash
npm run build
```

## Placeholders & Mock Data to Verify Before Launch

1. **Temple Timings & Special Darshan Fees**: Exact Viswaroopa / special darshan ticket prices (`₹100` Madurai Meenakshi, Thirumalai Nayakkar Mahal foreign/domestic rates, Darasuram ASI ticket rates, Kutladampatti forest checkpost, Teppakulam boating).
2. **Auto-Rickshaw Rate Card & Full-Day Packages**: Local union/district rate cards in Madurai (`₹950` day package placeholder) and Kumbakonam (`₹850` day package placeholder) and per-km/waiting allowances in `src/services/fareService.ts`.
3. **FX Conversion Rates**: Static mock rates for GBP, EUR, and CNY in `src/i18n/config.ts` (replace with a live FX endpoint).
4. **Local Driver, Guide & Vendor Contacts**: Mock phone numbers, registration plates (`TN 58 ...`, `TN 68 ...`), and ratings in `src/data/locals.ts`.
5. **Weather & Live Open Status**: Simulated responses in `src/services/liveStatusService.ts`.
6. **Payment Gateway & Booking Persistence**: Mock UPI/Card/Cash checkout in `src/services/bookingService.ts`.
7. **Emergency & Support Numbers**: All numbers (`100`, `108`, `101`, `+91-XXXXX-XXXXX`), support email (`support@wingotourism.example`), and support hours in `src/data/emergency.ts` are marked `"verify before launch"`.
8. **Native Translation Review**: Machine-drafted translations in `de`, `zh-CN`, `hi`, `te`, `kn`, and `ml` are flagged with `"_meta": { "status": "needs native review" }` in JSON; place item descriptions in `hi`, `te`, `kn`, and `ml` currently fall back to English pending native translation (whereas the `sos` namespace has 100% native translations with no English fallback in all 9 locales).
