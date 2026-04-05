import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Admin User ─────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@haloholidays.lk' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@haloholidays.lk',
      password: adminPassword,
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Admin user created')

  // ── Staff ──────────────────────────────────────────────────────────────────
  await prisma.staff.deleteMany()
  await prisma.staff.createMany({
    data: [
      {
        name: 'Kasun Gatamanna',
        role: 'All-in-One Specialist',
        bio: '4+ years of experience in luxury travel, cultural experiences, and group tours.',
        specialties: ['Luxury Travel', 'Cultural Experiences', 'Group Tours'],
        yearsExp: 4,
        order: 1,
      },
      {
        name: 'Mohamed Naveed',
        role: 'Middle East & Asia Specialist',
        bio: 'Expert in desert adventures and honeymoon experiences across the Middle East and Asia.',
        specialties: ['Desert Adventures', 'Honeymoon Packages', 'Middle East'],
        yearsExp: 1,
        order: 2,
      },
      {
        name: 'Shihaar Gazzaly',
        role: 'Europe & Asia Specialist',
        bio: 'Specializes in couple and family travel across Europe and Asia.',
        specialties: ['Europe', 'Couple Travel', 'Family Packages'],
        yearsExp: 1,
        order: 3,
      },
      {
        name: 'Naflan Naufer',
        role: 'Europe Specialist',
        bio: 'Expert in city breaks and solo travel across Europe.',
        specialties: ['City Breaks', 'Solo Travel', 'Europe'],
        yearsExp: 1,
        order: 4,
      },
    ],
  })
  console.log('✅ Staff created')

  // ── Destinations ───────────────────────────────────────────────────────────
  await prisma.destination.deleteMany()

  const destinations = await prisma.destination.createManyAndReturn({
    data: [
      {
        name: 'Maldives',
        slug: 'maldives',
        region: 'South Asia',
        country: 'Maldives',
        language: 'Dhivehi',
        bestSeason: 'November – April',
        costLevel: 'Luxury',
        description: 'Crystal clear lagoons, overwater bungalows, and pristine white sand beaches. The Maldives is the ultimate romantic getaway.',
        isFeatured: true,
        images: ['/images/destinations/maldives.jpg'],
      },
      {
        name: 'Thailand',
        slug: 'thailand',
        region: 'Southeast Asia',
        country: 'Thailand',
        language: 'Thai',
        bestSeason: 'November – March',
        costLevel: 'Moderate',
        description: 'A vibrant mix of ancient temples, tropical beaches, and world-class cuisine. Thailand has something for every traveler.',
        isFeatured: false,
        images: ['/images/destinations/thailand.jpg'],
      },
      {
        name: 'Japan',
        slug: 'japan',
        region: 'East Asia',
        country: 'Japan',
        language: 'Japanese',
        bestSeason: 'March – May, October – November',
        costLevel: 'Luxury',
        description: 'Where ancient tradition meets futuristic innovation. Experience cherry blossoms, samurai history, and exceptional cuisine.',
        isFeatured: true,
        images: ['/images/destinations/japan.jpg'],
      },
      {
        name: 'Dubai',
        slug: 'dubai',
        region: 'Middle East',
        country: 'UAE',
        language: 'Arabic',
        bestSeason: 'November – April',
        costLevel: 'Luxury',
        description: 'The city of superlatives — towering skyscrapers, desert safaris, luxury shopping, and world-class dining.',
        isFeatured: false,
        images: ['/images/destinations/dubai.jpg'],
      },
      {
        name: 'Bali',
        slug: 'bali',
        region: 'Southeast Asia',
        country: 'Indonesia',
        language: 'Balinese / Indonesian',
        bestSeason: 'April – October',
        costLevel: 'Budget',
        description: 'The Island of Gods offers stunning rice terraces, sacred temples, surf beaches, and spiritual healing.',
        isFeatured: false,
        images: ['/images/destinations/bali.jpg'],
      },
      {
        name: 'Turkey',
        slug: 'turkey',
        region: 'Western Asia',
        country: 'Turkey',
        language: 'Turkish',
        bestSeason: 'April – June, September – November',
        costLevel: 'Moderate',
        description: 'Straddling two continents, Turkey offers fairy chimneys of Cappadocia, pristine Aegean coast, and rich Ottoman heritage.',
        isFeatured: false,
        images: ['/images/destinations/turkey.jpg'],
      },
      {
        name: 'Malaysia',
        slug: 'malaysia',
        region: 'Southeast Asia',
        country: 'Malaysia',
        language: 'Malay',
        bestSeason: 'March – October',
        costLevel: 'Budget',
        description: 'A melting pot of cultures with stunning rainforests, modern city skylines, pristine islands, and incredible street food.',
        isFeatured: false,
        images: ['/images/destinations/malaysia.jpg'],
      },
      {
        name: 'France',
        slug: 'france',
        region: 'Europe',
        country: 'France',
        language: 'French',
        bestSeason: 'April – June, September – October',
        costLevel: 'Luxury',
        description: 'The Eiffel Tower, world-class cuisine, fashion, art, and the romance of Paris. France is simply unforgettable.',
        isFeatured: true,
        images: ['/images/destinations/france.jpg'],
      },
      {
        name: 'Egypt',
        slug: 'egypt',
        region: 'Africa',
        country: 'Egypt',
        language: 'Arabic',
        bestSeason: 'October – April',
        costLevel: 'Moderate',
        description: 'Walk among ancient pyramids, cruise the Nile, and explore one of the world\'s oldest civilizations.',
        isFeatured: false,
        images: ['/images/destinations/egypt.jpg'],
      },
      {
        name: 'Australia',
        slug: 'australia',
        region: 'Oceania',
        country: 'Australia',
        language: 'English',
        bestSeason: 'September – November, March – May',
        costLevel: 'Luxury',
        description: 'From the iconic Sydney Opera House to the Great Barrier Reef, Australia offers extraordinary natural and urban experiences.',
        isFeatured: false,
        images: ['/images/destinations/australia.jpg'],
      },
      {
        name: 'Singapore',
        slug: 'singapore',
        region: 'Southeast Asia',
        country: 'Singapore',
        language: 'English',
        bestSeason: 'February – April',
        costLevel: 'Luxury',
        description: 'A dazzling city-state of futuristic architecture, Gardens by the Bay, diverse cuisine, and world-class shopping.',
        isFeatured: false,
        images: ['/images/destinations/singapore.jpg'],
      },
      {
        name: 'South Korea',
        slug: 'south-korea',
        region: 'East Asia',
        country: 'South Korea',
        language: 'Korean',
        bestSeason: 'April – June, September – November',
        costLevel: 'Moderate',
        description: 'K-Pop culture, ancient palaces, vibrant street markets, and cutting-edge technology in one dynamic destination.',
        isFeatured: false,
        images: ['/images/destinations/south-korea.jpg'],
      },
    ],
  })
  console.log('✅ Destinations created')

  const destMap = Object.fromEntries(destinations.map((d) => [d.slug, d.id]))

  // ── Packages ───────────────────────────────────────────────────────────────
  await prisma.package.deleteMany()

  const packages = [
    {
      title: 'Dubai City Escape',
      slug: 'dubai-city-escape',
      category: 'FAMILY' as const,
      destinationId: destMap['dubai'],
      price: 120000,
      duration: 5,
      nights: 4,
      starRating: 'THREE' as const,
      description: 'Explore the glittering city of Dubai with your family. Visit Burj Khalifa, Dubai Mall, and enjoy a desert safari.',
      highlights: ['Burj Khalifa visit', 'Desert safari with BBQ dinner', 'Dubai Mall & Aquarium', 'Marina Dhow Cruise'],
      inclusions: ['Return airfare', '4 nights hotel accommodation', 'Daily breakfast', 'Airport transfers', 'Desert safari'],
      exclusions: ['Visa fees', 'Personal expenses', 'Travel insurance', 'Lunches and dinners'],
      images: ['/images/packages/dubai-city-escape.jpg'],
      isFeatured: true,
      paxType: 'per person',
    },
    {
      title: 'Maldives Romantic Escape',
      slug: 'maldives-romantic-escape',
      category: 'HONEYMOON' as const,
      destinationId: destMap['maldives'],
      price: 350000,
      duration: 5,
      nights: 4,
      starRating: 'FIVE' as const,
      description: 'A dreamy honeymoon in the Maldives. Overwater bungalow, private beach, snorkeling, and romantic sunsets.',
      highlights: ['Overwater bungalow', 'Private beach dinner', 'Snorkeling excursion', 'Couple spa treatment', 'Sunset cruise'],
      inclusions: ['Return airfare', '4 nights overwater bungalow', 'All meals', 'Speedboat transfers', 'Snorkeling gear'],
      exclusions: ['Visa fees', 'Alcohol', 'Personal expenses', 'Water sports (other than snorkeling)'],
      images: ['/images/packages/maldives-romantic.jpg'],
      isFeatured: true,
      paxType: 'per couple',
    },
    {
      title: 'Kyoto & Tokyo Honeymoon',
      slug: 'kyoto-tokyo-honeymoon',
      category: 'HONEYMOON' as const,
      destinationId: destMap['japan'],
      price: 600000,
      duration: 7,
      nights: 6,
      starRating: 'FOUR' as const,
      description: 'Experience the perfect blend of ancient Kyoto and modern Tokyo on this romantic Japanese honeymoon.',
      highlights: ['Fushimi Inari Shrine', 'Arashiyama Bamboo Grove', 'Tokyo Skytree', 'Traditional Ryokan stay', 'Tea ceremony'],
      inclusions: ['Return airfare', '6 nights hotel', 'Daily breakfast', 'Bullet train pass', 'Airport transfers', 'English guide'],
      exclusions: ['Visa fees', 'Personal expenses', 'Lunches and dinners', 'Travel insurance'],
      images: ['/images/packages/kyoto-tokyo-honeymoon.jpg'],
      isFeatured: true,
      paxType: 'per couple',
    },
    {
      title: 'Japan Family Tour 5-Star',
      slug: 'japan-family-5star',
      category: 'FAMILY' as const,
      destinationId: destMap['japan'],
      price: 1250000,
      duration: 8,
      nights: 7,
      starRating: 'FIVE' as const,
      description: 'A premium family adventure through Japan\'s most iconic destinations, staying in 5-star hotels throughout.',
      highlights: ['Tokyo Disneyland', 'Mount Fuji day trip', 'Kyoto temples', 'Osaka food tour', 'Bullet train experience'],
      inclusions: ['Return airfare', '7 nights 5-star hotels', 'Daily breakfast', 'Bullet train pass', 'Tokyo Disneyland tickets', 'Airport transfers'],
      exclusions: ['Visa fees', 'Personal expenses', 'Lunches and dinners', 'Travel insurance'],
      images: ['/images/packages/japan-family-5star.jpg'],
      isFeatured: true,
      paxType: 'per person',
    },
    {
      title: 'Malaysia City & Adventure',
      slug: 'malaysia-city-adventure',
      category: 'SOLO' as const,
      destinationId: destMap['malaysia'],
      price: 189000,
      duration: 4,
      nights: 3,
      starRating: 'THREE' as const,
      description: 'Discover Malaysia\'s vibrant cities, from Kuala Lumpur\'s iconic twin towers to the lush rainforests.',
      highlights: ['Petronas Twin Towers', 'Batu Caves', 'KL City tour', 'Night market experience', 'Genting Highlands'],
      inclusions: ['Return airfare', '3 nights hotel', 'Daily breakfast', 'Airport transfers', 'City tour'],
      exclusions: ['Visa fees', 'Personal expenses', 'Lunches and dinners'],
      images: ['/images/packages/malaysia-city.jpg'],
      isFeatured: true,
      paxType: 'per person',
    },
    {
      title: 'Bali Love Story',
      slug: 'bali-love-story',
      category: 'HONEYMOON' as const,
      destinationId: destMap['bali'],
      price: 320000,
      duration: 6,
      nights: 5,
      starRating: 'FOUR' as const,
      description: 'Romance blooms in Bali. Explore rice terraces, sacred temples, and enjoy private villa stays.',
      highlights: ['Ubud rice terraces', 'Tanah Lot temple sunset', 'Private villa', 'Spa treatment', 'Kecak fire dance'],
      inclusions: ['Return airfare', '5 nights villa/hotel', 'Daily breakfast', 'Airport transfers', 'Spa treatment'],
      exclusions: ['Visa fees', 'Personal expenses', 'Lunches and dinners'],
      images: ['/images/packages/bali-love-story.jpg'],
      isFeatured: true,
      paxType: 'per couple',
    },
    {
      title: 'Timeless Turkey Experience',
      slug: 'timeless-turkey',
      category: 'FAMILY' as const,
      destinationId: destMap['turkey'],
      price: 561000,
      duration: 7,
      nights: 6,
      starRating: 'FOUR' as const,
      description: 'Explore the magical landscapes of Cappadocia, the ancient ruins of Ephesus, and the stunning beaches of Antalya.',
      highlights: ['Hot air balloon ride in Cappadocia', 'Ephesus ruins', 'Blue Mosque', 'Turkish bath (Hammam)', 'Pamukkale thermal pools'],
      inclusions: ['Return airfare', '6 nights hotel', 'Daily breakfast', 'Domestic flights', 'Airport transfers', 'English guide'],
      exclusions: ['Visa fees', 'Personal expenses', 'Lunches and dinners'],
      images: ['/images/packages/timeless-turkey.jpg'],
      isFeatured: true,
      paxType: 'per person',
    },
    {
      title: 'Dubai Glamour & Desert',
      slug: 'dubai-glamour-desert',
      category: 'SQUAD' as const,
      destinationId: destMap['dubai'],
      price: 320000,
      duration: 5,
      nights: 4,
      starRating: 'FOUR' as const,
      description: 'Experience the best of Dubai with your squad — luxury shopping, thrilling desert adventures, and the famous nightlife.',
      highlights: ['Burj Khalifa At the Top', 'Desert safari with quad biking', 'Dubai Frame', 'Gold & Spice Souk', 'Dhow cruise dinner'],
      inclusions: ['Return airfare', '4 nights 4-star hotel', 'Daily breakfast', 'Airport transfers', 'Desert safari', 'Dhow cruise'],
      exclusions: ['Visa fees', 'Personal expenses', 'Lunches'],
      images: ['/images/packages/dubai-glamour.jpg'],
      isFeatured: true,
      paxType: 'per person',
    },
    {
      title: 'Egypt Ancient Wonders',
      slug: 'egypt-ancient-wonders',
      category: 'SOLO' as const,
      destinationId: destMap['egypt'],
      price: 282000,
      duration: 6,
      nights: 5,
      starRating: 'THREE' as const,
      description: 'Journey back in time to explore the pyramids of Giza, the Sphinx, Luxor temples, and cruise the majestic Nile.',
      highlights: ['Pyramids of Giza & Sphinx', 'Egyptian Museum', 'Nile River cruise', 'Valley of the Kings', 'Karnak Temple'],
      inclusions: ['Return airfare', '5 nights hotel (mix of hotel + cruise)', 'Meals on cruise', 'Airport transfers', 'English guide', 'Entry tickets'],
      exclusions: ['Visa fees', 'Personal expenses', 'Travel insurance'],
      images: ['/images/packages/egypt-ancient.jpg'],
      isFeatured: false,
      paxType: 'per person',
    },
    {
      title: 'Singapore City Discovery',
      slug: 'singapore-city-discovery',
      category: 'SOLO' as const,
      destinationId: destMap['singapore'],
      price: 339000,
      duration: 6,
      nights: 5,
      starRating: 'FOUR' as const,
      description: 'Discover Singapore\'s futuristic skyline, Gardens by the Bay, Sentosa Island, and world-famous hawker food.',
      highlights: ['Gardens by the Bay', 'Sentosa Island & Universal Studios', 'Marina Bay Sands Skypark', 'Night Safari', 'Hawker centre food tour'],
      inclusions: ['Return airfare', '5 nights hotel', 'Daily breakfast', 'Airport transfers', 'MRT card', 'City tour'],
      exclusions: ['Visa fees', 'Personal expenses', 'Lunches and dinners'],
      images: ['/images/packages/singapore-discovery.jpg'],
      isFeatured: false,
      paxType: 'per person',
    },
  ]

  for (const pkg of packages) {
    await prisma.package.create({ data: pkg })
  }
  console.log('✅ Packages created')

  // ── Visa Services ──────────────────────────────────────────────────────────
  await prisma.visaService.deleteMany()
  await prisma.visaService.createMany({
    data: [
      {
        country: 'Maldives',
        slug: 'maldives',
        isVisaFree: true,
        description: 'Sri Lankan passport holders get visa on arrival for up to 30 days.',
        requirements: ['Valid passport (6 months+)', 'Return ticket', 'Hotel booking confirmation', 'Sufficient funds'],
        processingTime: 'On arrival',
        fee: 'Free',
        documents: ['Passport', 'Return flight ticket', 'Accommodation proof'],
      },
      {
        country: 'Dubai (UAE)',
        slug: 'dubai',
        isVisaFree: false,
        description: 'Tourist visa required for Sri Lankan passport holders. We handle the entire process.',
        requirements: ['Valid passport (6 months+)', 'Passport-sized photos', 'Bank statements (3 months)', 'Employment letter', 'Return ticket', 'Hotel booking'],
        processingTime: '3-5 working days',
        fee: 'USD 90-100',
        documents: ['Passport copy', 'Passport photo', 'Bank statement', 'Salary slip', 'Employment letter'],
      },
      {
        country: 'Malaysia',
        slug: 'malaysia',
        isVisaFree: true,
        description: 'Sri Lankan passport holders can enter Malaysia visa-free for up to 30 days.',
        requirements: ['Valid passport (6 months+)', 'Return ticket', 'Hotel booking', 'Sufficient funds'],
        processingTime: 'On arrival',
        fee: 'Free',
        documents: ['Passport', 'Return flight ticket'],
      },
      {
        country: 'Thailand',
        slug: 'thailand',
        isVisaFree: true,
        description: 'Sri Lankan passport holders receive visa exemption for up to 30 days.',
        requirements: ['Valid passport (6 months+)', 'Return ticket', 'Hotel booking', 'Sufficient funds (10,000 THB)'],
        processingTime: 'On arrival',
        fee: 'Free',
        documents: ['Passport', 'Return flight ticket', 'Hotel booking'],
      },
      {
        country: 'Schengen (Europe)',
        slug: 'schengen',
        isVisaFree: false,
        description: 'Schengen visa required for travel to 27 European countries. We assist with the application.',
        requirements: ['Valid passport (3 months+ beyond stay)', 'Travel insurance', 'Bank statements (3 months)', 'Employment proof', 'Accommodation details', 'Travel itinerary'],
        processingTime: '15-30 working days',
        fee: 'EUR 80',
        documents: ['Passport copies', 'Passport photos', 'Travel insurance', 'Bank statements', 'Employment letter', 'Cover letter'],
      },
    ],
  })
  console.log('✅ Visa services created')

  // ── Reviews ────────────────────────────────────────────────────────────────
  await prisma.review.deleteMany()
  await prisma.review.createMany({
    data: [
      {
        name: 'Sanduni Nimeshika Gunawardana',
        location: 'Colombo, Sri Lanka',
        rating: 5,
        body: 'Our Dubai trip was absolutely incredible! The Marina Dhow Cruise, Burj Khalifa visit, and the Desert Safari were all perfectly organized. Halo Holidays took care of every detail. Highly recommend!',
        status: 'APPROVED',
      },
      {
        name: 'Sajjaad Ahamed',
        location: 'Kandy, Sri Lanka',
        rating: 5,
        body: 'The customer service was exceptional. Naveed helped us with our visa and made the whole process stress-free. The Singapore tour was well-organized and the hotel was excellent. Will definitely book again!',
        status: 'APPROVED',
      },
      {
        name: 'Shashika Radalage',
        location: 'Galle, Sri Lanka',
        rating: 5,
        body: 'I was amazed by how well the Singapore tour was organized. Every transfer was on time, the guides were knowledgeable and friendly. The professionalism of Halo Holidays is truly top-notch.',
        status: 'APPROVED',
      },
    ],
  })
  console.log('✅ Reviews created')

  // ── Site Settings ──────────────────────────────────────────────────────────
  await prisma.siteSetting.deleteMany()
  await prisma.siteSetting.createMany({
    data: [
      { key: 'site_name', value: 'Halo Holidays' },
      { key: 'tagline', value: 'Your Dream Holiday Starts Here' },
      { key: 'phone', value: '+94 70 454 5455' },
      { key: 'email', value: 'contact@haloholidays.lk' },
      { key: 'address', value: 'Level 2, 9/1, Deal Place A, Kollupitiya, Colombo 03' },
      { key: 'whatsapp', value: '+94704545455' },
      { key: 'instagram', value: 'https://instagram.com/haloholidays' },
      { key: 'facebook', value: 'https://facebook.com/haloholidays' },
      { key: 'youtube', value: 'https://youtube.com/@haloholidays' },
      { key: 'tiktok', value: 'https://tiktok.com/@haloholidays' },
      { key: 'linkedin', value: 'https://linkedin.com/company/haloholidays' },
      { key: 'registration_number', value: 'PV 00250114' },
      { key: 'operating_hours', value: '9 AM – 10 PM' },
    ],
  })
  console.log('✅ Site settings created')

  // ── News ───────────────────────────────────────────────────────────────────
  await prisma.news.deleteMany()
  await prisma.news.createMany({
    data: [
      {
        title: 'Tourist Arrivals Surge in Sri Lanka',
        slug: 'tourist-arrivals-surge-sri-lanka-2025',
        body: 'Sri Lanka recorded its highest monthly tourist count in January 2025, signaling a strong recovery for the tourism sector.',
        excerpt: 'Sri Lanka recorded its highest monthly tourist count in January 2025.',
        source: 'News First',
        publishedAt: new Date('2025-02-06'),
      },
      {
        title: 'Sri Lanka among Top Eid Getaways for Omani Travellers',
        slug: 'sri-lanka-top-eid-getaway-oman',
        body: 'Sri Lanka has emerged as one of the preferred Eid holiday destinations for travellers from Oman, thanks to its scenic beauty and warm hospitality.',
        excerpt: 'Sri Lanka has emerged as a preferred Eid destination for Omani travellers.',
        source: 'Daily Mirror',
        publishedAt: new Date('2025-03-26'),
      },
      {
        title: 'Emirates Boeing 777 Aircraft Upgrades on Sri Lanka Routes',
        slug: 'emirates-777-upgrades-sri-lanka',
        body: 'Emirates will introduce premium cabin upgrades on its Boeing 777 aircraft serving Sri Lanka and Maldives routes starting June 2025.',
        excerpt: 'Emirates upgrades premium cabins on Sri Lanka & Maldives routes from June 2025.',
        source: 'Travel and Tour World',
        publishedAt: new Date('2025-03-25'),
      },
    ],
  })
  console.log('✅ News created')

  // ── Blog ───────────────────────────────────────────────────────────────────
  await prisma.blog.deleteMany()
  await prisma.blog.create({
    data: {
      title: "Asela's Epic Adventure with Halo Holidays, From Sri Lanka to South Africa",
      slug: 'asela-epic-adventure-sri-lanka-south-africa',
      body: `<p>When Asela first contacted us about his dream trip to South Africa, he wasn't quite sure what to expect. As an experienced traveller from Sri Lanka, he had visited several Asian destinations, but Africa was new territory.</p>
      <p>Our team worked closely with Asela to craft an itinerary that would showcase the very best of South Africa — from the iconic Table Mountain in Cape Town to a thrilling safari in Kruger National Park.</p>
      <p>The journey was nothing short of epic. Asela witnessed the Big Five in their natural habitat, explored the vibrant neighbourhoods of Johannesburg, and stood at the dramatic Cape of Good Hope.</p>
      <p>"The contrast between Sri Lanka and South Africa is striking," Asela told us. "But Halo Holidays made every transition seamless. I never once felt lost or unsure — they had everything perfectly arranged."</p>`,
      excerpt: "Chronicles Asela's extraordinary journey from Sri Lanka to South Africa, highlighting the striking contrasts and unforgettable experiences.",
      category: 'Adventure',
      author: 'Halo Holidays Team',
      readingTime: 5,
      publishedAt: new Date('2025-06-18'),
    },
  })
  console.log('✅ Blog created')

  // ── Loyalty Program Settings ───────────────────────────────────────────────
  const loyaltySettings = [
    { key: 'loyalty_enabled', value: 'true' },
    { key: 'loyalty_hero_badge', value: 'EXCLUSIVE REWARDS' },
    { key: 'loyalty_hero_title', value: 'Privilege – Holiday Loyalty Points Program' },
    { key: 'loyalty_hero_subtitle', value: 'Earn exclusive rewards every time you travel with us' },
    { key: 'loyalty_hero_description', value: 'Book once, register, and start earning points on every future holiday booking. Redeem your points for discounts, free upgrades, tours, and other premium perks.' },
    { key: 'loyalty_cta_label', value: 'Register Now' },
    { key: 'loyalty_how_step1_title', value: 'Book a Holiday' },
    { key: 'loyalty_how_step1_desc', value: 'Make your first holiday package purchase with Halo Holidays.' },
    { key: 'loyalty_how_step2_title', value: 'Register for Privilege' },
    { key: 'loyalty_how_step2_desc', value: 'Complete your registration after your first booking to join the program.' },
    { key: 'loyalty_how_step3_title', value: 'Earn & Redeem' },
    { key: 'loyalty_how_step3_desc', value: 'Accumulate points on future bookings and redeem for discounts, upgrades, and more.' },
    { key: 'loyalty_eligibility_note', value: 'You must have booked at least one holiday package with us before registering for the Privilege Card.' },
    { key: 'loyalty_terms_eligibility', value: 'The Privilege Card is available to customers who have completed at least one holiday booking with Halo Holidays.' },
    { key: 'loyalty_terms_points', value: 'Points are earned on the net package price, excluding taxes, visa fees, and third-party surcharges.' },
    { key: 'loyalty_terms_redemption', value: 'Points may be redeemed for discounts on future bookings, complimentary upgrades, or excursions. Minimum redemption threshold applies.' },
    { key: 'loyalty_terms_validity', value: 'Points are valid for 24 months from the date of issue. Expired points cannot be reinstated.' },
    { key: 'loyalty_terms_modification', value: 'Halo Holidays reserves the right to modify, suspend, or terminate the Privilege Card program at any time with reasonable notice.' },
    { key: 'loyalty_terms_liability', value: 'Halo Holidays is not liable for any loss resulting from the use or inability to use earned points.' },
  ]

  for (const setting of loyaltySettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }
  console.log('✅ Loyalty program settings created')

  console.log('\n🎉 Seeding complete!')
  console.log('\n📧 Admin credentials:')
  console.log('   Email: admin@haloholidays.lk')
  console.log('   Password: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
