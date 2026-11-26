/**
 * Offline-bundled emergency & Wingo Tourism support contact data.
 * Available with zero network connectivity.
 *
 * IMPORTANT: Mark all numbers "verify before launch" before production release
 * (including regional 112 ERSS alignment and verified Wingo helpline / email).
 */

export interface EmergencyContactItem {
  id: 'police' | 'ambulance' | 'fire' | 'wingoSupport';
  displayNumber: string;
  telHref: string;
  verifyBeforeLaunch: true;
  note: string;
}

export interface CustomerSupportMeta {
  email: string;
  supportHoursPlaceholderKey: 'supportHoursValue';
  languagesSupportedList: string[];
  verifyBeforeLaunch: true;
}

export const EMERGENCY_CONTACTS: EmergencyContactItem[] = [
  {
    id: 'police',
    displayNumber: '100',
    telHref: 'tel:100',
    verifyBeforeLaunch: true,
    note: 'verify before launch — Tamil Nadu Police helpline (also check 112 unified ERSS)',
  },
  {
    id: 'ambulance',
    displayNumber: '108',
    telHref: 'tel:108',
    verifyBeforeLaunch: true,
    note: 'verify before launch — 108 Emergency Ambulance service in Tamil Nadu',
  },
  {
    id: 'fire',
    displayNumber: '101',
    telHref: 'tel:101',
    verifyBeforeLaunch: true,
    note: 'verify before launch — Fire & Rescue emergency helpline',
  },
  {
    id: 'wingoSupport',
    displayNumber: '+91-XXXXX-XXXXX',
    telHref: 'tel:+91XXXXXXXXXX',
    verifyBeforeLaunch: true,
    note: 'verify before launch — placeholder Wingo Tourism 24/7 or daily helpline number',
  },
];

export const CUSTOMER_SUPPORT_META: CustomerSupportMeta = {
  email: 'support@wingotourism.example', // verify before launch
  supportHoursPlaceholderKey: 'supportHoursValue',
  languagesSupportedList: [
    'தமிழ்',
    'తెలుగు',
    'ಕನ್ನಡ',
    'മലയാളം',
    'हिन्दी',
    'English (IN/UK)',
    'Deutsch',
    '简体中文',
  ],
  verifyBeforeLaunch: true,
};
