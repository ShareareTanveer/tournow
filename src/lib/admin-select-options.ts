import { mustCarryOptions, notAllowedOptions, notSuitableOptions } from '../../items'
import { languages } from '../../items2'

const unique = (items: string[]) => Array.from(new Set(items.map(item => item.trim()).filter(Boolean)))

export const LANGUAGE_OPTIONS = unique([
  'English',
  'Sinhala',
  'Tamil',
  'Arabic',
  'Hindi',
  'Malay',
  'Thai',
  'Japanese',
  'French',
  ...languages,
])

export const INCLUSION_OPTIONS = unique([
  'Return airfare',
  'Hotel accommodation',
  'Daily breakfast',
  'All meals',
  'Airport transfers',
  'Private transfers',
  'Shared transfers',
  'AC transport',
  'Tour guide',
  'English-speaking guide',
  'Entrance fees',
  'Travel insurance',
  'Visa assistance',
  'Sightseeing tours',
  'City tour',
  'Boat transfers',
  'Speedboat transfers',
  'Snorkeling equipment',
  'Diving equipment',
  'Welcome drink',
  'Wi-Fi on board',
  'Mineral water',
])

export const EXCLUSION_OPTIONS = unique([
  'Visa fees',
  'Travel insurance',
  'Personal expenses',
  'Tips & gratuities',
  'Optional activities',
  'International flights',
  'Domestic flights',
  'Laundry',
  'Alcohol',
  'Room service',
  'Porterage',
  'Camera fees at monuments',
  'Medical expenses',
  'Early check-in',
  'Late check-out',
])

export const ADD_ON_OPTIONS = unique([
  'Travel insurance',
  'Airport pickup',
  'Airport drop-off',
  'Single supplement',
  'Private guide',
  'Private transfer',
  'Extra night',
  'Visa service',
  'Premium hotel upgrade',
  'Room upgrade',
  'Meal upgrade',
  'Honeymoon setup',
  'Travel SIM',
  'Airport lounge access',
])

export const HIGHLIGHT_OPTIONS = unique([
  'Airport pickup and smooth check-in',
  'Guided city sightseeing tour',
  'Iconic landmarks and photo stops',
  'Beach leisure time',
  'Island hopping experience',
  'Local food tasting',
  'Shopping and free time',
  'Cultural village visit',
  'Sunset cruise',
  'Adventure activities',
  'Family-friendly experiences',
  'Honeymoon-friendly itinerary',
  'Private transfer options',
  'English-speaking local support',
])

export const ACTIVITY_OPTIONS = unique([
  'Airport pickup',
  'Hotel check-in',
  'Welcome briefing',
  'City orientation tour',
  'Guided sightseeing',
  'Museum visit',
  'Temple visit',
  'Beach relaxation',
  'Island hopping',
  'Snorkeling',
  'Boat ride',
  'Shopping stop',
  'Local market visit',
  'Dinner cruise',
  'Free time at leisure',
  'Hotel checkout',
  'Airport transfer',
])

export const MEAL_OPTIONS = unique([
  'Breakfast',
  'Lunch',
  'Dinner',
  'Welcome dinner',
  'BBQ dinner',
  'Local food tasting',
  'Full board meals',
  'Half board meals',
  'No meals included',
])

export const ACCOMMODATION_OPTIONS = unique([
  '3-star hotel',
  '4-star hotel',
  '5-star hotel',
  'Beach resort',
  'City hotel',
  'Boutique hotel',
  'Overwater villa',
  'Private villa',
  'Guesthouse',
  'No overnight stay',
])

export const VISA_NOTE_OPTIONS = unique([
  'Visa assistance available',
  'Visa on arrival may be available depending on passport',
  'E-visa required before travel',
  'Valid passport required for at least 6 months',
  'Travel insurance recommended',
  'Bank statement may be required',
  'Return ticket and hotel confirmation may be required',
  'Visa rules may change based on nationality',
])

export const CANCELLATION_POLICY_OPTIONS = unique([
  'Free cancellation up to 30 days before departure.',
  'Free cancellation up to 14 days before departure.',
  'Partial refund available based on supplier policy.',
  'Cancellation charges apply after booking confirmation.',
  'Non-refundable after final confirmation.',
  'Date changes are subject to availability and supplier charges.',
])

export const CANCELLATION_LABEL_OPTIONS = unique([
  'Full refund',
  '75% refund',
  '50% refund',
  '25% refund',
  'No refund',
  'Supplier charges apply',
])

export const CANCELLATION_DAY_OPTIONS = ['45', '30', '21', '14', '7', '3', '1', '0']

export const COMMON_DESTINATION_OPTIONS = unique([
  'Sri Lanka',
  'Maldives',
  'Thailand',
  'Bali',
  'Indonesia',
  'Singapore',
  'Malaysia',
  'Dubai',
  'Abu Dhabi',
  'United Arab Emirates',
  'Japan',
  'South Korea',
  'Turkey',
  'France',
  'Italy',
  'Switzerland',
  'Egypt',
])

export { mustCarryOptions, notAllowedOptions, notSuitableOptions }
