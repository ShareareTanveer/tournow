import { Prisma, PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { buildDefaultDestinationSections, normalizeDestinationSeed } from '../src/lib/destination-page-builder'

const prisma = new PrismaClient()

const demoImage = (seed: string, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`

function starToNumber(starRating: string) {
  if (starRating === 'FIVE') return 5
  if (starRating === 'FOUR') return 4
  return 3
}

async function main() {
  console.log('Seeding full demo extras...')

  const admin = await prisma.user.findFirst({
    where: { email: 'admin@example.com' },
    orderBy: { createdAt: 'asc' },
  })

  const destinations = await prisma.destination.findMany({
    orderBy: { name: 'asc' },
  })
  const packages = await prisma.package.findMany({
    orderBy: { createdAt: 'asc' },
    include: { destination: true },
  })
  const tours = await prisma.tour.findMany({
    orderBy: { createdAt: 'asc' },
    include: { primaryDestination: true },
  })
  const perks = await prisma.perk.findMany({
    orderBy: { sortOrder: 'asc' },
  })
  const aiTemplates = await prisma.aiPromptTemplate.findMany({
    orderBy: { createdAt: 'asc' },
  })

  if (!admin) throw new Error('Admin user not found. Run prisma/seed.ts first.')
  if (destinations.length === 0) throw new Error('Destinations not found. Run prisma/seed.ts first.')
  if (packages.length === 0) throw new Error('Packages not found. Run prisma/seed.ts first.')
  if (tours.length === 0) throw new Error('Tours not found. Run prisma/seed.ts first.')

  await prisma.notification.deleteMany()
  await prisma.aiGenerationJob.deleteMany()
  await prisma.claimedPerk.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.packageAccommodation.deleteMany()
  await prisma.itineraryDay.deleteMany()
  await prisma.tourPayment.deleteMany()
  await prisma.tourBooking.deleteMany()
  await prisma.tourAccommodation.deleteMany()
  await prisma.tourItineraryDay.deleteMany()
  await prisma.tourInquiry.deleteMany()
  await prisma.tourCustomization.deleteMany()
  await prisma.tourReview.deleteMany()
  await prisma.inquiry.deleteMany()
  await prisma.consultation.deleteMany()
  await prisma.newsletterSubscriber.deleteMany()
  await prisma.loyaltyCard.deleteMany()
  await prisma.charityDonation.deleteMany()
  await prisma.media.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.destinationSection.deleteMany()
  await prisma.aiProviderConfig.deleteMany()

  const destinationSections = destinations.flatMap((destination) =>
    buildDefaultDestinationSections(normalizeDestinationSeed(destination)).map((section) => ({
      destinationId: destination.id,
      sectionType: section.sectionType,
      title: section.title,
      presetKey: section.presetKey ?? null,
      order: section.order,
      isVisible: section.isVisible,
      mode: section.mode,
      style: (section.style ?? {}) as Prisma.InputJsonValue,
      content: (section.content ?? {}) as Prisma.InputJsonValue,
      canvas: section.canvas === null ? Prisma.JsonNull : (section.canvas as Prisma.InputJsonValue),
    }))
  )
  await prisma.destinationSection.createMany({ data: destinationSections })
  console.log(`Created ${destinationSections.length} destination sections`)

  const packageItineraries = packages.flatMap((pkg) => {
    const days = Math.max(2, Math.min(pkg.duration, 4))
    return Array.from({ length: days }, (_, index) => ({
      packageId: pkg.id,
      dayNumber: index + 1,
      title:
        index === 0
          ? `Arrival in ${pkg.destination.name}`
          : index === days - 1
            ? `Leisure and departure`
            : `Explore ${pkg.destination.name} - Day ${index + 1}`,
      description:
        index === 0
          ? `Arrive in ${pkg.destination.name}, meet your local representative, and transfer to your hotel for check-in and a relaxed evening.`
          : index === days - 1
            ? `Enjoy breakfast, some final free time, and a comfortable transfer for your onward journey.`
            : `Spend the day enjoying curated highlights, local experiences, and flexible time based on the ${pkg.title} itinerary.`,
      activities:
        index === 0
          ? ['Airport transfer', 'Hotel check-in', 'Evening at leisure']
          : index === days - 1
            ? ['Breakfast', 'Last-minute shopping', 'Airport transfer']
            : ['Guided sightseeing', 'Local experience', 'Free time'],
      meals: index === 0 ? ['Dinner'] : ['Breakfast'],
      accommodation: `${pkg.destination.name} Stay`,
      imageUrl: pkg.images[index] ?? pkg.images[0] ?? demoImage(`pkg-itinerary-${pkg.slug}-${index + 1}`),
    }))
  })
  await prisma.itineraryDay.createMany({ data: packageItineraries })

  const packageAccommodations = packages.flatMap((pkg) => [
    {
      packageId: pkg.id,
      name: `${pkg.destination.name} Grand Hotel`,
      starRating: starToNumber(pkg.starRating),
      location: `${pkg.destination.name} City`,
      imageUrl: pkg.images[0] ?? demoImage(`pkg-hotel-${pkg.slug}`),
      description: `Primary stay for the ${pkg.title} itinerary with comfortable rooms and easy access to major attractions.`,
      nightsStay: Math.max(1, Math.min(pkg.nights, 3)),
      sortOrder: 1,
    },
    {
      packageId: pkg.id,
      name: `${pkg.destination.name} Resort & Spa`,
      starRating: starToNumber(pkg.starRating),
      location: `${pkg.destination.name} Scenic Area`,
      imageUrl: pkg.images[1] ?? pkg.images[0] ?? demoImage(`pkg-resort-${pkg.slug}`),
      description: `Optional premium stay extension with upgraded facilities and a relaxed resort atmosphere.`,
      nightsStay: Math.max(1, pkg.nights - Math.max(1, Math.min(pkg.nights, 3))),
      sortOrder: 2,
    },
  ])
  await prisma.packageAccommodation.createMany({ data: packageAccommodations })

  const tourItineraries = tours.flatMap((tour) => {
    const days = Math.max(2, Math.min(tour.duration, 4))
    return Array.from({ length: days }, (_, index) => ({
      tourId: tour.id,
      dayNumber: index + 1,
      title:
        index === 0
          ? `Arrival and welcome in ${tour.primaryDestination.name}`
          : index === days - 1
            ? 'Final experiences and departure'
            : `Cross-border experiences - Day ${index + 1}`,
      description:
        index === 0
          ? `Meet the tour team, settle in, and begin your multi-destination journey from ${tour.primaryDestination.name}.`
          : index === days - 1
            ? 'Wrap up the journey with relaxed sightseeing and coordinated departure support.'
            : `Continue through the signature highlights of the ${tour.title} route with guided activities and comfortable transfers.`,
      country: tour.multiDestinations[index] ?? tour.primaryDestination.country,
      activities:
        index === 0
          ? ['Airport pickup', 'Orientation briefing', 'Welcome dinner']
          : index === days - 1
            ? ['Breakfast', 'Short city stop', 'Departure transfer']
            : ['Intercity transfer', 'Guided visit', 'Leisure time'],
      meals: ['Breakfast'],
      accommodation: `${tour.primaryDestination.name} Touring Hotel`,
      imageUrl: tour.images[index] ?? tour.images[0] ?? demoImage(`tour-itinerary-${tour.slug}-${index + 1}`),
    }))
  })
  await prisma.tourItineraryDay.createMany({ data: tourItineraries })

  const tourAccommodations = tours.flatMap((tour) => [
    {
      tourId: tour.id,
      name: `${tour.primaryDestination.name} Central Hotel`,
      starRating: starToNumber(tour.starRating),
      location: `${tour.primaryDestination.name} Downtown`,
      country: tour.primaryDestination.country,
      imageUrl: tour.images[0] ?? demoImage(`tour-hotel-${tour.slug}`),
      description: `Main hotel used for the ${tour.title} route with convenient access to major stops.`,
      nightsStay: Math.max(1, Math.min(tour.nights, 2)),
      sortOrder: 1,
    },
    {
      tourId: tour.id,
      name: `${tour.primaryDestination.name} Panorama Stay`,
      starRating: starToNumber(tour.starRating),
      location: `${tour.primaryDestination.name} Scenic District`,
      country: tour.multiDestinations[1] ?? tour.primaryDestination.country,
      imageUrl: tour.images[1] ?? tour.images[0] ?? demoImage(`tour-panorama-${tour.slug}`),
      description: `Secondary accommodation used mid-route for variety and a more immersive local stay.`,
      nightsStay: Math.max(1, tour.nights - Math.max(1, Math.min(tour.nights, 2))),
      sortOrder: 2,
    },
  ])
  await prisma.tourAccommodation.createMany({ data: tourAccommodations })
  console.log('Created itinerary and accommodation data')

  await prisma.aiProviderConfig.createMany({
    data: [
      { provider: 'openai', apiKey: 'CHANGE_ME_OPENAI_KEY', model: 'gpt-5.2', isActive: false, isPrimary: false },
      { provider: 'gemini', apiKey: 'CHANGE_ME_GEMINI_KEY', model: 'gemini-1.5-pro', isActive: false, isPrimary: false },
      { provider: 'groq', apiKey: 'CHANGE_ME_GROQ_KEY', model: 'llama3-70b-8192', isActive: false, isPrimary: false },
      { provider: 'openrouter', apiKey: 'CHANGE_ME_OPENROUTER_KEY', model: 'openai/gpt-4o-mini', isActive: false, isPrimary: false },
    ],
  })
  console.log('Created AI provider placeholders')

  const customerPassword = await bcrypt.hash('customer123', 12)
  const customerA = await prisma.customer.create({
    data: {
      name: 'Ayesha Nizam',
      email: 'ayesha@example.com',
      password: customerPassword,
      phone: '+94 77 111 2233',
    },
  })
  const customerB = await prisma.customer.create({
    data: {
      name: 'Ravin Fernando',
      email: 'ravin@example.com',
      password: customerPassword,
      phone: '+94 77 444 5566',
    },
  })
  console.log('Created demo customers')

  await prisma.newsletterSubscriber.createMany({
    data: [
      { email: 'ayesha@example.com', whatsapp: '+94771112233', isActive: true },
      { email: 'ravin@example.com', whatsapp: '+94774445566', isActive: true },
      { email: 'travelclub@example.com', whatsapp: '+94770001122', isActive: true },
    ],
  })

  await prisma.loyaltyCard.createMany({
    data: [
      {
        customerName: customerA.name,
        customerEmail: customerA.email,
        customerPhone: customerA.phone,
        pointsEarned: 850,
        pointsRedeemed: 150,
        tier: 'SILVER',
      },
      {
        customerName: customerB.name,
        customerEmail: customerB.email,
        customerPhone: customerB.phone,
        pointsEarned: 250,
        pointsRedeemed: 0,
        tier: 'BRONZE',
      },
    ],
  })

  await prisma.inquiry.createMany({
    data: [
      {
        name: 'Nethmi Perera',
        email: 'nethmi@example.com',
        phone: '+94 77 888 1000',
        packageId: packages[0].id,
        destination: packages[0].title,
        travelDate: new Date('2026-06-12'),
        paxCount: 2,
        message: 'We want a honeymoon package with flights and a private dinner option.',
        status: 'CONTACTED',
        assignedToId: admin.id,
      },
      {
        name: 'Hasan Rahman',
        email: 'hasan@example.com',
        phone: '+94 77 888 2000',
        packageId: packages[Math.min(1, packages.length - 1)].id,
        destination: packages[Math.min(1, packages.length - 1)].title,
        travelDate: new Date('2026-08-04'),
        paxCount: 4,
        message: 'Looking for a family option with airport transfers and breakfast included.',
        status: 'NEW',
        assignedToId: admin.id,
      },
    ],
  })

  await prisma.consultation.createMany({
    data: [
      {
        name: 'Sajini De Silva',
        email: 'sajini@example.com',
        phone: '+94 77 999 1100',
        method: 'VIDEO_CALL',
        additionalInfo: 'Interested in Japan or South Korea for autumn travel.',
        status: 'SCHEDULED',
        assignedConsultantId: admin.id,
        scheduledAt: new Date('2026-05-03T09:30:00.000Z'),
      },
      {
        name: 'Mohamed Ilyas',
        email: 'ilyas@example.com',
        phone: '+94 77 999 2200',
        method: 'PHONE_CALL',
        additionalInfo: 'Needs help with visa support and a moderate budget package.',
        status: 'PENDING',
        assignedConsultantId: admin.id,
      },
    ],
  })

  const bookingA = await prisma.booking.create({
    data: {
      packageId: packages[0].id,
      customerId: customerA.id,
      customerName: customerA.name,
      customerEmail: customerA.email,
      customerPhone: customerA.phone ?? '+94 77 111 2233',
      travelDate: new Date('2026-07-10'),
      returnDate: new Date('2026-07-15'),
      paxAdult: 2,
      paxChild: 0,
      paxInfant: 0,
      roomType: 'DOUBLE',
      rooms: [{ type: 'DOUBLE', qty: 1, label: '1 x Double Room' }],
      isAirfareIncluded: true,
      customerNote: 'Prefer ocean-view room if available.',
      pricePerPerson: packages[0].price,
      priceTwin: packages[0].priceTwin ?? packages[0].price,
      extraNights: 1,
      extraNightPrice: packages[0].extraNightPrice ?? 25000,
      selectedOptions: [{ label: 'Sunset cruise', price: 18000 }],
      totalPrice: 2 * packages[0].price + (packages[0].extraNightPrice ?? 25000) + 18000,
      currency: 'LKR',
      discount: 5000,
      status: 'ALL_CONFIRMED',
      paymentStatus: 'PAID',
      adminNotes: 'VIP couple, send final voucher 2 weeks before departure.',
      documentNote: 'Tickets and hotel voucher uploaded.',
      documents: [{ url: demoImage('booking-voucher', 900, 1200), name: 'voucher.pdf', note: 'Travel voucher' }],
    },
  })

  const bookingB = await prisma.booking.create({
    data: {
      packageId: packages[Math.min(1, packages.length - 1)].id,
      customerId: customerB.id,
      customerName: customerB.name,
      customerEmail: customerB.email,
      customerPhone: customerB.phone ?? '+94 77 444 5566',
      travelDate: new Date('2026-09-18'),
      returnDate: new Date('2026-09-23'),
      paxAdult: 2,
      paxChild: 1,
      paxInfant: 0,
      roomType: 'TWIN',
      rooms: [{ type: 'TWIN', qty: 1, label: '1 x Twin Room' }, { type: 'CHILD_BED', qty: 1, label: '1 x Child Bed' }],
      isAirfareIncluded: false,
      customerNote: 'Need vegetarian meal options.',
      pricePerPerson: packages[Math.min(1, packages.length - 1)].price,
      totalPrice: packages[Math.min(1, packages.length - 1)].price * 2.5,
      currency: 'LKR',
      status: 'AWAITING_CONFIRM',
      paymentStatus: 'PARTIAL',
      staffQuote: { note: 'Awaiting customer approval for revised hotel option.' },
    },
  })

  await prisma.payment.createMany({
    data: [
      {
        bookingId: bookingA.id,
        amount: bookingA.totalPrice,
        currency: 'LKR',
        method: 'BANK_TRANSFER',
        reference: 'MV-BKG-001',
        status: 'PAID',
        paidAt: new Date('2026-06-01'),
      },
      {
        bookingId: bookingB.id,
        amount: bookingB.totalPrice / 2,
        currency: 'LKR',
        method: 'PAYPAL',
        reference: 'MV-BKG-002',
        status: 'PARTIAL',
        paidAt: new Date('2026-06-15'),
      },
    ],
  })

  await prisma.tourCustomization.createMany({
    data: [
      {
        tourId: tours[0].id,
        customerName: 'Ishara Wijesinghe',
        customerEmail: 'ishara@example.com',
        customerPhone: '+94 77 222 8899',
        travelDate: new Date('2026-10-08'),
        paxCount: 6,
        requests: 'Need a private departure with kid-friendly stops and halal meal support.',
        budget: 650000,
        currency: 'LKR',
        status: 'QUOTED',
      },
    ],
  })

  await prisma.tourInquiry.createMany({
    data: [
      {
        name: 'Devni Jayasekara',
        email: 'devni@example.com',
        phone: '+94 77 333 6677',
        tourId: tours[0].id,
        destination: tours[0].title,
        travelDate: new Date('2026-11-05'),
        paxCount: 3,
        message: 'Can this tour be upgraded to premium hotels throughout?',
        status: 'NEW',
        assignedToId: admin.id,
      },
    ],
  })

  const tourBooking = await prisma.tourBooking.create({
    data: {
      tourId: tours[0].id,
      customerId: customerA.id,
      customerName: customerA.name,
      customerEmail: customerA.email,
      customerPhone: customerA.phone ?? '+94 77 111 2233',
      travelDate: new Date('2026-12-02'),
      returnDate: new Date('2026-12-08'),
      paxAdult: 2,
      paxChild: 0,
      paxInfant: 0,
      roomType: 'DOUBLE',
      rooms: [{ type: 'DOUBLE', qty: 1, label: '1 x Double Room' }],
      isAirfareIncluded: true,
      pricePerPerson: tours[0].price,
      totalPrice: tours[0].price * 2,
      currency: 'LKR',
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      adminNotes: 'Private airport pickup arranged.',
    },
  })

  await prisma.tourPayment.create({
    data: {
      tourBookingId: tourBooking.id,
      amount: tourBooking.totalPrice,
      currency: 'LKR',
      method: 'STRIPE',
      reference: 'MV-TR-001',
      status: 'PAID',
      paidAt: new Date('2026-07-21'),
    },
  })

  await prisma.tourReview.createMany({
    data: [
      {
        name: 'Chamodi Silva',
        location: 'Colombo, Sri Lanka',
        rating: 5,
        body: 'The multi-country tour was paced beautifully and the hotel selections were excellent from start to finish.',
        tourId: tours[0].id,
        status: 'APPROVED',
      },
    ],
  })

  await prisma.charityDonation.createMany({
    data: [
      {
        name: 'Metro Voyage Community Hub',
        phone: '+94 70 123 4567',
        email: 'charity@example.com',
        pickupRequired: true,
        address: '12 Lake Road, Colombo 07',
        notes: 'Winter clothing and school supplies ready for pickup.',
        status: 'PICKUP_ARRANGED',
      },
    ],
  })

  await prisma.media.createMany({
    data: [
      {
        filename: 'destination-maldives-hero.jpg',
        url: demoImage('media-maldives-hero'),
        size: 245000,
        mimeType: 'image/jpeg',
        storage: 'remote',
        folder: 'destinations',
        altText: 'Maldives overwater bungalow',
      },
      {
        filename: 'package-dubai-banner.jpg',
        url: demoImage('media-dubai-banner'),
        size: 262000,
        mimeType: 'image/jpeg',
        storage: 'remote',
        folder: 'packages',
        altText: 'Dubai skyline at dusk',
      },
      {
        filename: 'brand-logo.png',
        url: demoImage('media-brand-logo', 500, 500),
        size: 54000,
        mimeType: 'image/png',
        storage: 'remote',
        folder: 'branding',
        altText: 'Metro Voyage brand mark',
      },
    ],
  })

  if (perks.length > 0) {
    await prisma.claimedPerk.createMany({
      data: [
        { customerId: customerA.id, perkId: perks[0].id, status: 'APPROVED' },
        { customerId: customerB.id, perkId: perks[Math.min(1, perks.length - 1)].id, status: 'PENDING' },
      ],
    })
  }

  const notifications = [
    {
      type: 'NEW_BOOKING' as const,
      audience: 'ADMIN' as const,
      title: 'New package booking received',
      body: `${customerA.name} booked ${packages[0].title}.`,
      link: '/admin/bookings',
      userId: admin.id,
      entityType: 'booking',
      entityId: bookingA.id,
    },
    {
      type: 'NEW_CONSULTATION' as const,
      audience: 'ADMIN' as const,
      title: 'Consultation waiting for follow-up',
      body: 'A new travel consultation request has been scheduled.',
      link: '/admin/consultations',
      userId: admin.id,
      entityType: 'consultation',
      entityId: null,
    },
    {
      type: 'BOOKING_STATUS' as const,
      audience: 'CUSTOMER' as const,
      title: 'Your booking is confirmed',
      body: `Your booking for ${packages[0].title} is now fully confirmed.`,
      link: '/my/bookings',
      customerId: customerA.id,
      entityType: 'booking',
      entityId: bookingA.id,
    },
  ]
  await prisma.notification.createMany({ data: notifications })

  if (aiTemplates.length > 0) {
    await prisma.aiGenerationJob.createMany({
      data: [
        {
          templateKey: aiTemplates[0].key,
          entityType: 'package',
          entityId: packages[0].id,
          status: 'DONE',
          inputData: JSON.stringify({ title: packages[0].title, destination: destinations[0]?.name ?? '' }),
          outputData: JSON.stringify({ metaTitle: `Sample SEO for ${packages[0].title}` }),
          parsedOutput: JSON.stringify({ metaTitle: `Sample SEO for ${packages[0].title}` }),
          provider: 'openai',
          tokensUsed: 822,
          createdBy: admin.id,
        },
      ],
    })
  }

  console.log('Full demo extras complete.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
