import { z } from 'zod'

export const InquirySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  packageId: z.string().optional(),
  destination: z.string().optional(),
  travelDate: z.string().optional(),
  paxCount: z.number().int().positive().optional(),
  message: z.string().min(10),
})

export const ConsultationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  method: z.enum(['VIDEO_CALL', 'PHONE_CALL']),
  additionalInfo: z.string().optional(),
})

export const RoomSelectionSchema = z.object({
  type: z.string(),   // e.g. SINGLE | TWIN | DOUBLE | TRIPLE
  qty: z.number().int().min(1),
  label: z.string().optional(),
})

export const BookingSchema = z.object({
  packageId: z.string().optional(),
  tourId: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string(),
  travelDate: z.string(),
  returnDate: z.string().optional(),
  paxAdult: z.number().int().min(1).default(1),
  paxChild: z.number().int().min(0).default(0),
  paxInfant: z.number().int().min(0).default(0),
  roomType: z.enum(['SINGLE', 'TWIN', 'DOUBLE', 'TRIPLE']).optional(),  // legacy
  rooms: z.array(RoomSelectionSchema).optional(),
  pricePerPerson: z.number().positive().optional(),
  priceTwin: z.number().positive().optional(),
  extraNights: z.number().int().min(0).default(0),
  extraNightPrice: z.number().positive().optional(),
  selectedOptions: z.array(z.object({ label: z.string(), price: z.number() })).default([]),
  totalPrice: z.number().positive(),
  discount: z.number().min(0).default(0),
  notes: z.string().optional(),
  customerNote: z.string().optional(),
})

export const StaffQuoteSchema = z.object({
  rooms: z.array(z.object({ label: z.string(), qty: z.number(), unitPrice: z.number() })).optional(),
  lineItems: z.array(z.object({ label: z.string(), price: z.number() })).default([]),
  totalPrice: z.number().positive(),
  notes: z.string().optional(),
  validUntil: z.string().optional(),  // ISO date string
})

export const CustomerQuoteResponseSchema = z.object({
  action: z.enum(['accept', 'request_changes']),
  customerNote: z.string().optional(),
})

export const CustomerRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
})

export const CustomerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const ReceiptUploadSchema = z.object({
  bookingId: z.string(),
  bookingType: z.enum(['package', 'tour']),
  receiptUrl: z.string().url(),
  receiptNote: z.string().optional(),
})

export const ReviewSchema = z.object({
  name: z.string().min(2),
  location: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(10),
  packageId: z.string().optional(),
})

export const NewsletterSchema = z.object({
  email: z.string().email(),
  whatsapp: z.string().optional(),
})

export const CharityDonationSchema = z.object({
  name: z.string().min(2),
  phone: z.string(),
  email: z.string().email(),
  pickupRequired: z.boolean().default(false),
  address: z.string().optional(),
  notes: z.string().optional(),
})

const PricingFields = {
  priceTwin: z.number().positive().optional(),
  priceChild: z.number().positive().optional(),
  extraNightPrice: z.number().positive().optional(),
  options: z.array(z.object({ label: z.string(), price: z.number(), isDefault: z.boolean().optional() })).optional(),
  cancellationTiers: z.array(z.object({ daysBeforeDep: z.number(), refundPercent: z.number(), label: z.string() })).optional(),
  cancellationPolicy: z.string().optional(),
}

const DetailFields = {
  isFoodIncluded: z.boolean().optional(),
  isTransportIncluded: z.boolean().optional(),
  meetingPoint: z.string().optional(),
  dropOff: z.string().optional(),
  hostLanguage: z.array(z.string()).optional(),
  audioGuideLanguage: z.array(z.string()).optional(),
  bookletLanguage: z.array(z.string()).optional(),
  inclusionService: z.array(z.string()).optional(),
  exclusionService: z.array(z.string()).optional(),
  emergencyContact: z.string().optional(),
  notSuitable: z.array(z.string()).optional(),
  notAllowed: z.array(z.string()).optional(),
  mustCarryItem: z.array(z.string()).optional(),
  difficulty: z.string().optional(),
  minAge: z.number().int().min(0).optional(),
  maxGroupSize: z.number().int().positive().optional(),
  importantInfo: z.string().optional(),
  summary: z.string().optional(),
  isCustomizable: z.boolean().optional(),
  customizationNotes: z.string().optional(),
}

export const PackageSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  category: z.enum(['FAMILY', 'HONEYMOON', 'SOLO', 'SQUAD', 'CORPORATE', 'SPECIAL', 'HOLIDAY']),
  destinationId: z.string(),
  price: z.number().positive(),
  oldPrice: z.number().positive().optional(),
  duration: z.number().int().positive(),
  nights: z.number().int().positive(),
  starRating: z.enum(['THREE', 'FOUR', 'FIVE']),
  description: z.string().min(10),
  highlights: z.array(z.string()).default([]),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  galleryLayout: z.enum(['grid-2x2', 'grid-3col', 'featured-left', 'featured-right', 'strip']).default('grid-2x2'),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  paxType: z.string().optional(),
  ...PricingFields,
  ...DetailFields,
})

export const TourSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  region: z.string().min(2),
  multiDestinations: z.array(z.string()).default([]),
  primaryDestinationId: z.string(),
  price: z.number().positive(),
  oldPrice: z.number().positive().optional(),
  duration: z.number().int().positive(),
  nights: z.number().int().positive(),
  starRating: z.enum(['THREE', 'FOUR', 'FIVE']),
  description: z.string().min(10),
  highlights: z.array(z.string()).default([]),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  galleryLayout: z.enum(['grid-2x2', 'grid-3col', 'featured-left', 'featured-right', 'strip']).default('grid-2x2'),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  paxType: z.string().optional(),
  visaNotes: z.string().optional(),
  ...PricingFields,
  ...DetailFields,
})

export const DestinationSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  region: z.string(),
  country: z.string(),
  language: z.string(),
  bestSeason: z.string(),
  costLevel: z.string(),
  description: z.string().min(10),
  images: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})
