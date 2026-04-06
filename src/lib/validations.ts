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

export const BookingSchema = z.object({
  packageId: z.string(),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string(),
  travelDate: z.string(),
  returnDate: z.string().optional(),
  paxCount: z.number().int().positive(),
  notes: z.string().optional(),
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
