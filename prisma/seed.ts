// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ─── Image helpers ────────────────────────────────────────────────────────────
// Picsum Photos – free, no API key, deterministic by seed
const p = (seed: string, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`

const IMG = {
  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: p('travel-beach-sunset', 1920, 1080),

  // ── Category cards (landscape, vibrant) ──────────────────────────────────
  catFamily:    p('family-beach-holiday', 600, 400),
  catHoneymoon: p('couple-sunset-beach', 600, 400), 
  catSolo:      p('solo-backpacker-mountain', 600, 400),
  catSquad:     p('friends-travel-adventure', 600, 400),
  catCorporate: p('business-conference-travel', 600, 400),
  catSpecial:   p('luxury-resort-vip', 600, 400),
  catHoliday:   p('holiday-season-travel', 600, 400),
  catCulture: p('cultural-heritage-travel-temple', 600, 400),


  // ── Destinations ──────────────────────────────────────────────────────────
  maldives:   p('maldives-overwater-bungalow', 1200, 800),
  thailand:   p('thailand-temple-elephant', 1200, 800),
  japan:      p('japan-cherry-blossom-tokyo', 1200, 800),
  dubai:      p('dubai-burj-khalifa-skyline', 1200, 800),
  bali:       p('bali-rice-terrace-temple', 1200, 800),
  turkey:     p('turkey-cappadocia-balloon', 1200, 800),
  malaysia:   p('malaysia-petronas-towers', 1200, 800),
  france:     p('france-paris-eiffel-tower', 1200, 800),
  egypt:      p('egypt-pyramids-sphinx', 1200, 800),
  australia:  p('australia-sydney-opera', 1200, 800),
  singapore:  p('singapore-gardens-bay', 1200, 800),
  southKorea: p('seoul-korea-palace', 1200, 800),

  // ── Packages ──────────────────────────────────────────────────────────────
  dubaiCity:       p('dubai-desert-safari-night', 1200, 800),
  maldivesResort:  p('maldives-blue-lagoon-villa', 1200, 800),
  japanKyoto:      p('kyoto-fushimi-inari-shrine', 1200, 800),
  japanFamily:     p('tokyo-disneyland-japan', 1200, 800),
  malaysiaCityAdv: p('kuala-lumpur-twin-towers', 1200, 800),
  baliRomance:     p('bali-villa-pool-sunset', 1200, 800),
  turkeyCap:       p('cappadocia-hot-air-balloon', 1200, 800),
  dubaiSquad:      p('dubai-glamour-nightlife', 1200, 800),
  egyptPyramids:   p('luxor-nile-egypt-ruins', 1200, 800),
  singaporeCity:   p('singapore-sentosa-universal', 1200, 800),

  // ── Blog / News ──────────────────────────────────────────────────────────
  blogSouthAfrica: p('south-africa-safari-lion', 1200, 600),
  blogDubai:       p('dubai-travel-blog-trip', 1200, 600),
  blogMaldives:    p('maldives-travel-tips-blog', 1200, 600),
  newsTourism:     p('sri-lanka-tourism-beach', 800, 500),
  newsAirline:     p('emirates-airplane-flight', 800, 500),
  newsEid:         p('oman-travel-eid-holiday', 800, 500),

  // ── Staff ─────────────────────────────────────────────────────────────────
  staff1: p('travel-agent-male-1', 400, 400),
  staff2: p('travel-agent-male-2', 400, 400),
  staff3: p('travel-agent-male-3', 400, 400),
  staff4: p('travel-agent-male-4', 400, 400),
}

async function main() {
  console.log('🌱 Seeding Metro Voyage database...')

  // ── Admin User ──────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@gmail.com',
      password: adminPassword,
      role: 'SUPER_ADMIN',
    },
  })
  // Also keep legacy email working
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { password: adminPassword },
    create: {
      name: 'Super Admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Admin user')

  // ── Staff ────────────────────────────────────────────────────────────────────
  await prisma.staff.deleteMany()
  await prisma.staff.createMany({
    data: [
      {
        name: 'Kasun Gatamanna',
        role: 'All-in-One Specialist',
        bio: '4+ years of experience in luxury travel, cultural experiences, and group tours.',
        specialties: ['Luxury Travel', 'Cultural Experiences', 'Group Tours'],
        yearsExp: 4,
        photoUrl: IMG.staff1,
        order: 1,
        isActive: true,
      },
      {
        name: 'Mohamed Naveed',
        role: 'Middle East & Asia Specialist',
        bio: 'Expert in desert adventures and honeymoon experiences across the Middle East and Asia.',
        specialties: ['Desert Adventures', 'Honeymoon Packages', 'Middle East'],
        yearsExp: 1,
        photoUrl: IMG.staff2,
        order: 2,
        isActive: true,
      },
      {
        name: 'Shihaar Gazzaly',
        role: 'Europe & Asia Specialist',
        bio: 'Specializes in couple and family travel across Europe and Asia.',
        specialties: ['Europe', 'Couple Travel', 'Family Packages'],
        yearsExp: 1,
        photoUrl: IMG.staff3,
        order: 3,
        isActive: true,
      },
      {
        name: 'Naflan Naufer',
        role: 'Europe Specialist',
        bio: 'Expert in city breaks and solo travel across Europe.',
        specialties: ['City Breaks', 'Solo Travel', 'Europe'],
        yearsExp: 1,
        photoUrl: IMG.staff4,
        order: 4,
        isActive: true,
      },
    ],
  })
  console.log('✅ Staff')

  // ── Package Category Configs (with images) ─────────────────────────────────
  await prisma.packageCategoryConfig.deleteMany()
  await prisma.packageCategoryConfig.createMany({
    data: [
      { slug: 'family',    label: 'Family',       description: 'Fun-filled holidays for the whole family — kids activities, safe destinations, and memorable experiences.', imageUrl: IMG.catFamily,    iconName: 'FiUsers',     sortOrder: 1, isActive: true },
      { slug: 'honeymoon', label: 'Honeymoon',    description: 'Romantic escapes for newlyweds — private villas, sunset dinners, and unforgettable couple experiences.',    imageUrl: IMG.catHoneymoon, iconName: 'FiHeart',     sortOrder: 2, isActive: true },
      { slug: 'solo',      label: 'Solo',         description: 'Freedom to explore at your own pace — discover new cultures, meet fellow travellers, and find yourself.',     imageUrl: IMG.catSolo,      iconName: 'FiUser',      sortOrder: 3, isActive: true },
      { slug: 'squad',     label: 'Squad',        description: 'Group adventures built for friends — shared thrills, epic memories, and unbeatable value.',                  imageUrl: IMG.catSquad,     iconName: 'FiSmile',     sortOrder: 4, isActive: true },
      { slug: 'corporate', label: 'Corporate',    description: 'Seamless MICE & business travel solutions — conferences, team outings, and incentive trips.',                imageUrl: IMG.catCorporate, iconName: 'FiBriefcase', sortOrder: 5, isActive: true },
      { slug: 'special',   label: 'Special',      description: 'VIP and exclusive packages for birthdays, anniversaries, and milestone celebrations.',                       imageUrl: IMG.catSpecial,   iconName: 'FiStar',      sortOrder: 6, isActive: true },
      { slug: 'holiday',   label: '2026 Holidays',description: 'Specially curated packages around public holidays, long weekends, and festive seasons.',                     imageUrl: IMG.catHoliday,   iconName: 'FiSun',       sortOrder: 7, isActive: true },
      { slug: 'culture',   label: 'Cultural',     description: 'Immersive cultural experiences — heritage sites, local traditions, and authentic interactions.',              imageUrl: IMG.catCulture,   iconName: 'FiGlobe',     sortOrder: 8, isActive: true },
    ],
  })
  console.log('✅ Category configs')

  // ── Destinations ─────────────────────────────────────────────────────────────
  await prisma.tourItineraryDay.deleteMany()
  await prisma.tour.deleteMany()
  await prisma.itineraryDay.deleteMany()
  await prisma.package.deleteMany()
  await prisma.destination.deleteMany()

  const destinations = await prisma.destination.createManyAndReturn({
    data: [
      {
        name: 'Maldives', slug: 'maldives', region: 'South Asia', country: 'Maldives',
        language: 'Dhivehi', bestSeason: 'November – April', costLevel: 'Luxury',
        description: 'Crystal clear lagoons, overwater bungalows, and pristine white sand beaches. The Maldives is the ultimate romantic getaway.',
        isFeatured: true, imageUrl: IMG.maldives,
        images: [IMG.maldives, p('maldives-lagoon-aerial', 1200, 800), p('maldives-beach-villa-water', 1200, 800), p('maldives-coral-fish', 1200, 800), p('maldives-sunset-horizon', 1200, 800)],
      },
      {
        name: 'Thailand', slug: 'thailand', region: 'Southeast Asia', country: 'Thailand',
        language: 'Thai', bestSeason: 'November – March', costLevel: 'Moderate',
        description: 'A vibrant mix of ancient temples, tropical beaches, and world-class cuisine. Thailand has something for every traveller.',
        isFeatured: false, imageUrl: IMG.thailand,
        images: [IMG.thailand, p('bangkok-grand-palace-thailand', 1200, 800), p('phi-phi-islands-beach', 1200, 800), p('chiang-mai-elephant-sanctuary', 1200, 800), p('phuket-patong-beach-sunset', 1200, 800)],
      },
      {
        name: 'Japan', slug: 'japan', region: 'East Asia', country: 'Japan',
        language: 'Japanese', bestSeason: 'March – May, October – November', costLevel: 'Luxury',
        description: 'Where ancient tradition meets futuristic innovation. Experience cherry blossoms, samurai history, and exceptional cuisine.',
        isFeatured: true, imageUrl: IMG.japan,
        images: [IMG.japan, p('kyoto-temple-japan-autumn', 1200, 800), p('tokyo-shibuya-crossing-night', 1200, 800), p('mount-fuji-reflection-lake', 1200, 800), p('japan-bamboo-grove-arashiyama', 1200, 800)],
      },
      {
        name: 'Dubai', slug: 'dubai', region: 'Middle East', country: 'UAE',
        language: 'Arabic', bestSeason: 'November – April', costLevel: 'Luxury',
        description: 'The city of superlatives — towering skyscrapers, desert safaris, luxury shopping, and world-class dining.',
        isFeatured: true, imageUrl: IMG.dubai,
        images: [IMG.dubai, p('dubai-desert-camel-safari', 1200, 800), p('dubai-marina-promenade', 1200, 800), p('dubai-palm-jumeirah-aerial', 1200, 800), p('dubai-gold-souk-market', 1200, 800)],
      },
      {
        name: 'Bali', slug: 'bali', region: 'Southeast Asia', country: 'Indonesia',
        language: 'Balinese / Indonesian', bestSeason: 'April – October', costLevel: 'Budget',
        description: 'The Island of Gods offers stunning rice terraces, sacred temples, surf beaches, and spiritual healing.',
        isFeatured: false, imageUrl: IMG.bali,
        images: [IMG.bali, p('bali-ubud-rice-fields-green', 1200, 800), p('bali-tanah-lot-temple-wave', 1200, 800), p('bali-seminyak-beach-sunset', 1200, 800), p('bali-monkey-forest-ubud', 1200, 800)],
      },
      {
        name: 'Turkey', slug: 'turkey', region: 'Western Asia', country: 'Turkey',
        language: 'Turkish', bestSeason: 'April – June, September – November', costLevel: 'Moderate',
        description: 'Straddling two continents, Turkey offers fairy chimneys of Cappadocia, pristine Aegean coast, and rich Ottoman heritage.',
        isFeatured: false, imageUrl: IMG.turkey,
        images: [IMG.turkey, p('istanbul-hagia-sophia-interior', 1200, 800), p('cappadocia-cave-hotel', 1200, 800), p('pamukkale-white-terraces', 1200, 800), p('ephesus-library-ruins', 1200, 800)],
      },
      {
        name: 'Malaysia', slug: 'malaysia', region: 'Southeast Asia', country: 'Malaysia',
        language: 'Malay', bestSeason: 'March – October', costLevel: 'Budget',
        description: 'A melting pot of cultures with stunning rainforests, modern city skylines, pristine islands, and incredible street food.',
        isFeatured: false, imageUrl: IMG.malaysia,
        images: [IMG.malaysia, p('kuala-lumpur-city-night', 1200, 800), p('batu-caves-hindu-temple', 1200, 800), p('langkawi-cable-car-sea', 1200, 800), p('penang-street-food-hawker', 1200, 800)],
      },
      {
        name: 'France', slug: 'france', region: 'Europe', country: 'France',
        language: 'French', bestSeason: 'April – June, September – October', costLevel: 'Luxury',
        description: 'The Eiffel Tower, world-class cuisine, fashion, art, and the romance of Paris. France is simply unforgettable.',
        isFeatured: true, imageUrl: IMG.france,
        images: [IMG.france, p('paris-louvre-museum-pyramid', 1200, 800), p('versailles-palace-hall-mirrors', 1200, 800), p('nice-french-riviera-coast', 1200, 800), p('mont-saint-michel-normandy', 1200, 800)],
      },
      {
        name: 'Egypt', slug: 'egypt', region: 'Africa', country: 'Egypt',
        language: 'Arabic', bestSeason: 'October – April', costLevel: 'Moderate',
        description: "Walk among ancient pyramids, cruise the Nile, and explore one of the world's oldest civilizations.",
        isFeatured: false, imageUrl: IMG.egypt,
        images: [IMG.egypt, p('pyramids-giza-sphinx-egypt', 1200, 800), p('nile-river-felucca-boat', 1200, 800), p('luxor-karnak-temple-columns', 1200, 800), p('abu-simbel-temple-facade', 1200, 800)],
      },
      {
        name: 'Australia', slug: 'australia', region: 'Oceania', country: 'Australia',
        language: 'English', bestSeason: 'September – November, March – May', costLevel: 'Luxury',
        description: 'From the iconic Sydney Opera House to the Great Barrier Reef, Australia offers extraordinary natural and urban experiences.',
        isFeatured: false, imageUrl: IMG.australia,
        images: [IMG.australia, p('sydney-harbour-bridge-opera', 1200, 800), p('great-barrier-reef-snorkel', 1200, 800), p('uluru-ayers-rock-sunset', 1200, 800), p('melbourne-city-streets', 1200, 800)],
      },
      {
        name: 'Singapore', slug: 'singapore', region: 'Southeast Asia', country: 'Singapore',
        language: 'English', bestSeason: 'February – April', costLevel: 'Luxury',
        description: 'A dazzling city-state of futuristic architecture, Gardens by the Bay, diverse cuisine, and world-class shopping.',
        isFeatured: false, imageUrl: IMG.singapore,
        images: [IMG.singapore, p('singapore-supertree-grove-night', 1200, 800), p('singapore-marina-bay-sands-pool', 1200, 800), p('singapore-sentosa-beach', 1200, 800), p('singapore-chinatown-temple', 1200, 800)],
      },
      {
        name: 'South Korea', slug: 'south-korea', region: 'East Asia', country: 'South Korea',
        language: 'Korean', bestSeason: 'April – June, September – November', costLevel: 'Moderate',
        description: 'K-Pop culture, ancient palaces, vibrant street markets, and cutting-edge technology in one dynamic destination.',
        isFeatured: false, imageUrl: IMG.southKorea,
        images: [IMG.southKorea, p('seoul-gyeongbokgung-palace-guard', 1200, 800), p('jeju-island-waterfall-korea', 1200, 800), p('busan-gamcheon-village-colorful', 1200, 800), p('korea-myeongdong-night-market', 1200, 800)],
      },
    ],
  })
  console.log('✅ Destinations')

  const D = Object.fromEntries(destinations.map((d) => [d.slug, d.id]))

  // ── Packages ─────────────────────────────────────────────────────────────────
  const packages = [
    {
      title: 'Dubai City Escape',
      slug: 'dubai-city-escape',
      category: 'FAMILY' as const,
      destinationId: D['dubai'],
      price: 120000, oldPrice: 145000, priceTwin: 105000, priceChild: 65000, extraNightPrice: 9500,
      duration: 5, nights: 4,
      starRating: 'THREE' as const,
      description: '<p>Explore the glittering city of Dubai with your family. Visit the iconic <strong>Burj Khalifa</strong>, stroll through the vast Dubai Mall, and experience a thrilling desert safari under the stars.</p><p>Our carefully crafted 5-day itinerary balances world-class attractions with leisure time, ensuring a holiday the whole family will cherish.</p>',
      highlights: ['Burj Khalifa At The Top', 'Desert Safari with BBQ Dinner', 'Dubai Mall & Aquarium', 'Marina Dhow Cruise', 'Global Village'],
      inclusions: ['Return airfare from Colombo', '4 nights 3-star hotel', 'Daily breakfast', 'Airport transfers', 'Desert safari with BBQ', 'Dhow cruise dinner'],
      exclusions: ['Visa fees (USD 90)', 'Personal expenses', 'Travel insurance', 'Lunches and dinners'],
      options: [
        { label: 'UAE Tourist Visa (Metro Voyage assisted)', price: 22000 },
        { label: 'Travel insurance (per person)', price: 3500 },
        { label: 'Dubai Frame entry ticket', price: 4500 },
        { label: 'Dubai Aquarium & Underwater Zoo', price: 5500 },
      ],
      cancellationTiers: [
        { daysBeforeDep: 30, refundPercent: 100, label: 'Full refund' },
        { daysBeforeDep: 14, refundPercent: 50,  label: '50% refund' },
        { daysBeforeDep: 7,  refundPercent: 0,   label: 'No refund' },
      ],
      images: [IMG.dubaiCity, p('dubai-mall-interior', 1200, 800), p('dubai-desert-dunes', 1200, 800), p('dubai-marina-night', 1200, 800), p('dubai-burj-al-arab', 1200, 800)],
      galleryLayout: 'grid-2x2',
      isFeatured: true, paxType: 'per person',
      isFoodIncluded: false, isTransportIncluded: true,
      meetingPoint: 'Bandaranaike International Airport, Colombo',
      difficulty: 'EASY' as const, minAge: 2, maxGroupSize: 20,
      cancellationPolicy: 'Free cancellation up to 14 days. 50% refund 7–14 days. No refund within 7 days.',
      hostLanguage: ['English', 'Sinhala', 'Tamil'],
      emergencyContact: '+94 70 454 5455',
      mustCarryItem: ['Valid passport (6+ months validity)', 'UAE Tourist Visa', 'Travel insurance', 'Comfortable walking shoes'],
      notAllowed: ['Pets', 'Illegal substances'],
    },
    {
      title: 'Maldives Romantic Escape',
      slug: 'maldives-romantic-escape',
      category: 'HONEYMOON' as const,
      destinationId: D['maldives'],
      price: 350000, oldPrice: 395000, priceTwin: 320000, priceChild: 180000, extraNightPrice: 45000,
      duration: 5, nights: 4,
      starRating: 'FIVE' as const,
      description: '<p>A dreamy honeymoon in the Maldives awaits. Stay in an <strong>overwater bungalow</strong>, enjoy a private beach dinner under the stars, and snorkel among vibrant coral reefs.</p><p>Every detail is arranged to make your honeymoon utterly magical — from arrival roses to turndown service.</p>',
      highlights: ['Overwater bungalow stay', 'Private beach dinner', 'Coral reef snorkelling', 'Couple spa treatment', 'Sunset dolphin cruise'],
      inclusions: ['Return airfare', '4 nights overwater bungalow', 'All meals (full board)', 'Speedboat transfers', 'Snorkelling gear', 'Welcome amenities'],
      exclusions: ['Visa fees', 'Alcoholic beverages', 'Personal expenses', 'Premium water sports'],
      options: [
        { label: 'Couple spa treatment (60 min)', price: 18000 },
        { label: 'Sunset dolphin cruise', price: 9500 },
        { label: 'Underwater restaurant dinner', price: 25000 },
        { label: 'Seaplane transfer upgrade (one-way)', price: 55000 },
      ],
      cancellationTiers: [
        { daysBeforeDep: 30, refundPercent: 100, label: 'Full refund' },
        { daysBeforeDep: 15, refundPercent: 50,  label: '50% refund' },
        { daysBeforeDep: 7,  refundPercent: 0,   label: 'No refund' },
      ],
      images: [IMG.maldivesResort, p('maldives-coral-reef-snorkel', 1200, 800), p('maldives-sunset-villa', 1200, 800), p('maldives-overwater-deck', 1200, 800)],
      galleryLayout: 'featured-left',
      isFeatured: true, paxType: 'per couple',
      isFoodIncluded: true, isTransportIncluded: true,
      meetingPoint: 'Bandaranaike International Airport, Colombo',
      difficulty: 'EASY' as const, minAge: 18, maxGroupSize: 2,
      cancellationPolicy: 'Free cancellation up to 30 days. 50% refund 15–30 days. No refund within 15 days.',
      hostLanguage: ['English'],
      emergencyContact: '+94 70 454 5455',
      mustCarryItem: ['Valid passport', 'Swimwear', 'Sunscreen SPF 50+', 'Light summer clothing'],
    },
    {
      title: 'Kyoto & Tokyo Honeymoon',
      slug: 'kyoto-tokyo-honeymoon',
      category: 'HONEYMOON' as const,
      destinationId: D['japan'],
      price: 600000, oldPrice: 680000, priceTwin: 560000, priceChild: 320000, extraNightPrice: 38000,
      duration: 7, nights: 6,
      starRating: 'FOUR' as const,
      description: '<p>Experience the perfect blend of ancient <strong>Kyoto</strong> and ultra-modern <strong>Tokyo</strong> on this unforgettable Japanese honeymoon.</p><p>Walk through the vermilion torii gates of Fushimi Inari, savour kaiseki cuisine, ride the Shinkansen bullet train, and marvel at the Tokyo skyline from above.</p>',
      highlights: ['Fushimi Inari Shrine', 'Arashiyama Bamboo Grove', 'Tokyo Skytree observation', 'Traditional Ryokan stay', 'Private tea ceremony'],
      inclusions: ['Return airfare', '6 nights hotel + 1 night ryokan', 'Daily breakfast', 'JR Bullet Train Pass', 'Airport transfers', 'English-speaking guide (2 days)'],
      exclusions: ['Visa fees', 'Personal expenses', 'Lunches and dinners', 'Travel insurance'],
      images: [IMG.japanKyoto, p('kyoto-bamboo-grove', 1200, 800), p('tokyo-shibuya-crossing', 1200, 800), p('japan-ryokan-room', 1200, 800), p('japan-bullet-train', 1200, 800), p('japan-cherry-blossom-path', 1200, 800)],
      galleryLayout: 'featured-right',
      isFeatured: true, paxType: 'per couple',
      isFoodIncluded: false, isTransportIncluded: true,
      difficulty: 'EASY' as const, minAge: 18, maxGroupSize: 4,
      options: [
        { label: 'Japan Tourist Visa (Metro Voyage assisted)', price: 8500 },
        { label: 'Travel insurance (per person)', price: 3500 },
        { label: 'Private tea ceremony experience', price: 12000 },
        { label: 'Day trip to Hakone (Mt. Fuji views)', price: 15000 },
      ],
      cancellationTiers: [
        { daysBeforeDep: 30, refundPercent: 100, label: 'Full refund' },
        { daysBeforeDep: 14, refundPercent: 50,  label: '50% refund' },
        { daysBeforeDep: 7,  refundPercent: 0,   label: 'No refund' },
      ],
      cancellationPolicy: 'Free cancellation up to 21 days. 50% refund 14–21 days. No refund within 14 days.',
      hostLanguage: ['English', 'Japanese'],
      emergencyContact: '+94 70 454 5455',
      mustCarryItem: ['Valid passport', 'Japan Tourist Visa', 'Comfortable walking shoes', 'Light layers for temperature changes'],
    },
    {
      title: 'Japan Family Tour 5-Star',
      slug: 'japan-family-5star',
      category: 'FAMILY' as const,
      destinationId: D['japan'],
      price: 1250000, oldPrice: 1390000, priceTwin: 1150000, priceChild: 650000, extraNightPrice: 65000,
      duration: 8, nights: 7,
      starRating: 'FIVE' as const,
      description: '<p>A premium family adventure through Japan\'s most iconic destinations, staying in <strong>5-star hotels</strong> throughout.</p><p>From the wonder of Tokyo Disneyland to the serenity of Kyoto\'s ancient temples, this carefully designed itinerary creates once-in-a-lifetime memories for every family member.</p>',
      highlights: ['Tokyo Disneyland', 'Mount Fuji day trip', 'Kyoto ancient temples', 'Osaka street food tour', 'Bullet train experience'],
      inclusions: ['Return airfare', '7 nights 5-star hotels', 'Daily breakfast', 'Bullet Train Pass', 'Tokyo Disneyland tickets', 'Airport & inter-city transfers', 'English guide'],
      exclusions: ['Visa fees', 'Personal expenses', 'Lunches and dinners', 'Travel insurance'],
      images: [IMG.japanFamily, p('tokyo-disneyland-castle', 1200, 800), p('mount-fuji-sunrise', 1200, 800), p('osaka-dotonbori-night', 1200, 800), p('kyoto-golden-pavilion', 1200, 800), p('japan-shinkansen-station', 1200, 800)],
      galleryLayout: 'grid-3col',
      isFeatured: true, paxType: 'per person',
      isFoodIncluded: false, isTransportIncluded: true,
      difficulty: 'EASY' as const, minAge: 3, maxGroupSize: 15,
      options: [
        { label: 'Japan Tourist Visa (Metro Voyage assisted)', price: 8500 },
        { label: 'Travel insurance (per person)', price: 3500 },
        { label: 'Universal Studios Japan tickets (per person)', price: 22000 },
        { label: 'Osaka Aquarium (per person)', price: 8500 },
      ],
      cancellationTiers: [
        { daysBeforeDep: 30, refundPercent: 100, label: 'Full refund' },
        { daysBeforeDep: 15, refundPercent: 75,  label: '75% refund' },
        { daysBeforeDep: 7,  refundPercent: 50,  label: '50% refund' },
        { daysBeforeDep: 0,  refundPercent: 0,   label: 'No refund' },
      ],
      cancellationPolicy: 'Free cancellation up to 30 days. 25% charge 15–30 days. 50% charge 7–14 days. No refund within 7 days.',
      hostLanguage: ['English'],
      emergencyContact: '+94 70 454 5455',
      mustCarryItem: ['Valid passport', 'Japan Tourist Visa', 'Comfortable shoes', 'Light jacket'],
    },
    {
      title: 'Malaysia City & Adventure',
      slug: 'malaysia-city-adventure',
      category: 'SOLO' as const,
      destinationId: D['malaysia'],
      price: 189000, oldPrice: 215000, priceTwin: 169000, priceChild: 99000, extraNightPrice: 12000,
      duration: 4, nights: 3,
      starRating: 'THREE' as const,
      description: '<p>Discover Malaysia\'s vibrant cities, from Kuala Lumpur\'s iconic <strong>Petronas Twin Towers</strong> to the lush highland rainforests of Genting.</p><p>Perfect for the solo explorer looking for a mix of urban energy and natural wonder at great value.</p>',
      highlights: ['Petronas Twin Towers observation deck', 'Batu Caves Hindu temple', 'KL City free-and-easy day', 'Night market street food', 'Genting Highlands cable car'],
      inclusions: ['Return airfare', '3 nights hotel', 'Daily breakfast', 'Airport transfers', 'KL city tour with guide'],
      exclusions: ['Visa fees', 'Personal expenses', 'Lunches and dinners', 'Theme park tickets'],
      images: [IMG.malaysiaCityAdv, p('batu-caves-malaysia', 1200, 800), p('penang-street-art', 1200, 800), p('genting-highlands-cable', 1200, 800)],
      galleryLayout: 'strip',
      isFeatured: true, paxType: 'per person',
      isFoodIncluded: false, isTransportIncluded: true,
      difficulty: 'EASY' as const, minAge: 16, maxGroupSize: 12,
      options: [
        { label: 'Travel insurance (per person)', price: 3500 },
        { label: 'Genting Highlands theme park ticket', price: 8500 },
        { label: 'Penang day trip add-on', price: 14000 },
      ],
      cancellationTiers: [
        { daysBeforeDep: 14, refundPercent: 100, label: 'Full refund' },
        { daysBeforeDep: 7,  refundPercent: 50,  label: '50% refund' },
        { daysBeforeDep: 0,  refundPercent: 0,   label: 'No refund' },
      ],
      cancellationPolicy: 'Free cancellation up to 7 days. No refund within 7 days.',
      hostLanguage: ['English', 'Sinhala'],
      emergencyContact: '+94 70 454 5455',
      mustCarryItem: ['Valid passport', 'Comfortable walking shoes', 'Light raincoat'],
    },
    {
      title: 'Bali Love Story',
      slug: 'bali-love-story',
      category: 'HONEYMOON' as const,
      destinationId: D['bali'],
      price: 320000, oldPrice: 360000, priceTwin: 290000, priceChild: 160000, extraNightPrice: 22000,
      duration: 6, nights: 5,
      starRating: 'FOUR' as const,
      description: '<p>Romance blooms in Bali. Explore emerald <strong>rice terraces</strong>, sacred Hindu temples, and enjoy a private villa with your own plunge pool.</p><p>Our 6-day Bali honeymoon is the perfect blend of culture, relaxation, and romance.</p>',
      highlights: ['Ubud Tegalalang rice terraces', 'Tanah Lot temple sunset', 'Private villa with plunge pool', 'Couples spa & massage', 'Kecak fire dance performance'],
      inclusions: ['Return airfare', '5 nights villa/hotel', 'Daily breakfast', 'Airport transfers', 'Couples spa treatment', 'Temple entrance fees'],
      exclusions: ['Visa fees', 'Personal expenses', 'Lunches and dinners'],
      images: [IMG.baliRomance, p('bali-rice-terraces-tegalalang', 1200, 800), p('tanah-lot-temple-sunset', 1200, 800), p('bali-villa-plunge-pool', 1200, 800), p('bali-kecak-fire-dance', 1200, 800)],
      galleryLayout: 'featured-left',
      isFeatured: true, paxType: 'per couple',
      isFoodIncluded: false, isTransportIncluded: true,
      difficulty: 'EASY' as const, minAge: 18, maxGroupSize: 2,
      options: [
        { label: 'Couples spa & massage (60 min)', price: 14000 },
        { label: 'Private cooking class', price: 9500 },
        { label: 'Kecak fire dance & Uluwatu sunset tour', price: 7500 },
        { label: 'Travel insurance (per person)', price: 3500 },
      ],
      cancellationTiers: [
        { daysBeforeDep: 21, refundPercent: 100, label: 'Full refund' },
        { daysBeforeDep: 14, refundPercent: 50,  label: '50% refund' },
        { daysBeforeDep: 0,  refundPercent: 0,   label: 'No refund' },
      ],
      cancellationPolicy: 'Free cancellation up to 21 days. 50% refund 14–21 days. No refund within 14 days.',
      hostLanguage: ['English', 'Indonesian'],
      emergencyContact: '+94 70 454 5455',
      mustCarryItem: ['Valid passport', 'Swimwear', 'Sarong for temple visits', 'Sunscreen'],
      notAllowed: ['Disrespecting temple dress codes'],
    },
    {
      title: 'Timeless Turkey Experience',
      slug: 'timeless-turkey',
      category: 'FAMILY' as const,
      destinationId: D['turkey'],
      price: 561000, oldPrice: 620000, priceTwin: 510000, priceChild: 290000, extraNightPrice: 32000,
      duration: 7, nights: 6,
      starRating: 'FOUR' as const,
      description: '<p>Explore the magical landscapes of <strong>Cappadocia</strong>, the ancient ruins of Ephesus, and the thermal pools of Pamukkale on this unforgettable Turkish adventure.</p>',
      highlights: ['Hot air balloon ride over Cappadocia', 'Ephesus ancient ruins walk', 'Blue Mosque & Hagia Sophia', 'Traditional Turkish bath (Hammam)', 'Pamukkale cotton castle thermal pools'],
      inclusions: ['Return airfare', '6 nights hotel', 'Daily breakfast', 'Domestic flights (Istanbul–Cappadocia)', 'Airport & inter-city transfers', 'English-speaking guide'],
      exclusions: ['Visa fees', 'Personal expenses', 'Lunches and dinners'],
      images: [IMG.turkeyCap, p('istanbul-blue-mosque', 1200, 800), p('ephesus-ruins-turkey', 1200, 800), p('pamukkale-thermal-pools', 1200, 800), p('turkey-hammam-bath', 1200, 800)],
      galleryLayout: 'grid-2x2',
      isFeatured: true, paxType: 'per person',
      isFoodIncluded: false, isTransportIncluded: true,
      difficulty: 'EASY' as const, minAge: 5, maxGroupSize: 20,
      options: [
        { label: 'Turkish Tourist Visa (Metro Voyage assisted)', price: 18000 },
        { label: 'Hot air balloon ride, Cappadocia', price: 55000 },
        { label: 'Bosphorus cruise dinner, Istanbul', price: 12000 },
        { label: 'Travel insurance (per person)', price: 3500 },
      ],
      cancellationTiers: [
        { daysBeforeDep: 30, refundPercent: 100, label: 'Full refund' },
        { daysBeforeDep: 14, refundPercent: 50,  label: '50% refund' },
        { daysBeforeDep: 0,  refundPercent: 0,   label: 'No refund' },
      ],
      cancellationPolicy: 'Free cancellation up to 14 days. 50% refund 7–14 days. No refund within 7 days.',
      hostLanguage: ['English', 'Turkish'],
      emergencyContact: '+94 70 454 5455',
      mustCarryItem: ['Valid passport', 'Turkish Tourist Visa', 'Warm clothing for Cappadocia nights', 'Swimwear for Pamukkale'],
    },
    {
      title: 'Dubai Glamour & Desert',
      slug: 'dubai-glamour-desert',
      category: 'SQUAD' as const,
      destinationId: D['dubai'],
      price: 320000, oldPrice: 360000, priceTwin: 285000, priceChild: 165000, extraNightPrice: 20000,
      duration: 5, nights: 4,
      starRating: 'FOUR' as const,
      description: '<p>Experience the best of Dubai with your squad — luxury shopping, thrilling <strong>desert adventures</strong>, and the famous Dubai nightlife.</p>',
      highlights: ['Burj Khalifa At the Top (124th floor)', 'Dune bashing & quad biking desert safari', 'Dubai Frame panoramic views', 'Gold Souk & Spice Souk', 'Dhow cruise dinner on the Creek'],
      inclusions: ['Return airfare', '4 nights 4-star hotel', 'Daily breakfast', 'Airport transfers', 'Desert safari with BBQ', 'Dhow cruise dinner'],
      exclusions: ['Visa fees', 'Personal expenses', 'Lunches'],
      images: [IMG.dubaiSquad, p('dubai-nightlife-club', 1200, 800), p('dubai-frame-view', 1200, 800), p('dubai-gold-souk', 1200, 800)],
      galleryLayout: 'featured-right',
      isFeatured: true, paxType: 'per person',
      isFoodIncluded: false, isTransportIncluded: true,
      difficulty: 'EASY' as const, minAge: 18, maxGroupSize: 15,
      options: [
        { label: 'UAE Tourist Visa (Metro Voyage assisted)', price: 22000 },
        { label: 'Burj Khalifa At The Top ticket', price: 9500 },
        { label: 'Ferrari World / Yas Island day trip', price: 18000 },
        { label: 'Travel insurance (per person)', price: 3500 },
      ],
      cancellationTiers: [
        { daysBeforeDep: 14, refundPercent: 100, label: 'Full refund' },
        { daysBeforeDep: 7,  refundPercent: 50,  label: '50% refund' },
        { daysBeforeDep: 0,  refundPercent: 0,   label: 'No refund' },
      ],
      cancellationPolicy: 'Free cancellation up to 14 days. 50% refund 7–14 days. No refund within 7 days.',
      hostLanguage: ['English', 'Arabic'],
      emergencyContact: '+94 70 454 5455',
      mustCarryItem: ['Valid passport', 'UAE Tourist Visa', 'Sunscreen', 'Smart casual clothing'],
    },
    {
      title: 'Egypt Ancient Wonders',
      slug: 'egypt-ancient-wonders',
      category: 'SOLO' as const,
      destinationId: D['egypt'],
      price: 282000, oldPrice: 320000, priceTwin: 255000, priceChild: 145000, extraNightPrice: 18000,
      duration: 6, nights: 5,
      starRating: 'THREE' as const,
      description: '<p>Journey back 5,000 years to explore the <strong>Pyramids of Giza</strong>, the Great Sphinx, Luxor temples, and cruise the majestic River Nile.</p>',
      highlights: ['Pyramids of Giza & Great Sphinx', 'Egyptian Museum (Mummies Hall)', 'Nile River cruise (Luxor–Aswan)', 'Valley of the Kings', 'Karnak & Luxor temples'],
      inclusions: ['Return airfare', '3 nights Cairo hotel + 2 nights Nile cruise', 'Meals on cruise (full board)', 'Airport transfers', 'English-speaking guide', 'All entry tickets'],
      exclusions: ['Visa fees (USD 25)', 'Personal expenses', 'Travel insurance'],
      images: [IMG.egyptPyramids, p('nile-cruise-sunset', 1200, 800), p('luxor-temple-night', 1200, 800), p('valley-of-the-kings', 1200, 800)],
      galleryLayout: 'strip',
      isFeatured: false, paxType: 'per person',
      isFoodIncluded: true, isTransportIncluded: true,
      difficulty: 'MODERATE' as const, minAge: 10, maxGroupSize: 16,
      options: [
        { label: 'Egypt Tourist Visa (Metro Voyage assisted)', price: 7500 },
        { label: 'Nile felucca sunset ride', price: 6500 },
        { label: 'Abu Simbel day trip by flight', price: 38000 },
        { label: 'Travel insurance (per person)', price: 3500 },
      ],
      cancellationTiers: [
        { daysBeforeDep: 21, refundPercent: 100, label: 'Full refund' },
        { daysBeforeDep: 7,  refundPercent: 50,  label: '50% refund' },
        { daysBeforeDep: 0,  refundPercent: 0,   label: 'No refund' },
      ],
      cancellationPolicy: 'Free cancellation up to 14 days. 50% refund 7–14 days. No refund within 7 days.',
      hostLanguage: ['English', 'Arabic'],
      emergencyContact: '+94 70 454 5455',
      mustCarryItem: ['Valid passport', 'Egypt Tourist Visa', 'Cash USD for tips', 'Modest clothing for temples'],
      notAllowed: ['Revealing clothing at temples'],
    },
    {
      title: 'Singapore City Discovery',
      slug: 'singapore-city-discovery',
      category: 'SOLO' as const,
      destinationId: D['singapore'],
      price: 339000, oldPrice: 379000, priceTwin: 305000, priceChild: 175000, extraNightPrice: 24000,
      duration: 6, nights: 5,
      starRating: 'FOUR' as const,
      description: '<p>Discover Singapore\'s futuristic skyline, <strong>Gardens by the Bay</strong>, Sentosa Island, and the world-famous hawker food scene.</p>',
      highlights: ['Gardens by the Bay (Supertree Grove)', 'Sentosa Island & Universal Studios Singapore', 'Marina Bay Sands SkyPark observation', 'Night Safari experience', 'Maxwell Hawker Centre food tour'],
      inclusions: ['Return airfare', '5 nights hotel', 'Daily breakfast', 'Airport transfers', 'EZ-Link MRT card', 'City orientation tour'],
      exclusions: ['Visa fees', 'Personal expenses', 'Lunches and dinners'],
      images: [IMG.singaporeCity, p('singapore-marina-bay-night', 1200, 800), p('singapore-gardens-supertree', 1200, 800), p('sentosa-universal-singapore', 1200, 800), p('singapore-night-safari', 1200, 800), p('singapore-hawker-food', 1200, 800)],
      galleryLayout: 'grid-3col',
      isFeatured: false, paxType: 'per person',
      isFoodIncluded: false, isTransportIncluded: true,
      difficulty: 'EASY' as const, minAge: 16, maxGroupSize: 12,
      options: [
        { label: 'Universal Studios Singapore ticket', price: 18500 },
        { label: 'Night Safari ticket', price: 12000 },
        { label: 'Singapore e-visa (Metro Voyage assisted)', price: 8000 },
        { label: 'Travel insurance (per person)', price: 3500 },
      ],
      cancellationTiers: [
        { daysBeforeDep: 14, refundPercent: 100, label: 'Full refund' },
        { daysBeforeDep: 7,  refundPercent: 50,  label: '50% refund' },
        { daysBeforeDep: 0,  refundPercent: 0,   label: 'No refund' },
      ],
      cancellationPolicy: 'Free cancellation up to 14 days. 50% refund 7–14 days. No refund within 7 days.',
      hostLanguage: ['English'],
      emergencyContact: '+94 70 454 5455',
      mustCarryItem: ['Valid passport', 'Comfortable walking shoes', 'Lightweight clothing', 'Sunscreen'],
    },
  ]

  for (const pkg of packages) {
    await prisma.package.create({ data: pkg })
  }
  console.log('✅ Packages')

  // ── Tours ─────────────────────────────────────────────────────────────────────
  await prisma.tourItineraryDay.deleteMany()
  await prisma.tour.deleteMany()

  const tours = [
    {
      title: 'South East Asia Explorer',
      slug: 'south-east-asia-explorer',
      region: 'South East Asia',
      multiDestinations: ['Singapore', 'Malaysia', 'Thailand'],
      primaryDestinationId: D['singapore'],
      price: 385000,
      oldPrice: 420000,
      priceTwin: 345000,
      priceChild: 195000,
      extraNightPrice: 18000,
      duration: 12,
      nights: 11,
      starRating: 'FOUR' as const,
      description: '<p>One of our most popular multi-country tours — discover three iconic South East Asian destinations in one seamless journey. Start in the gleaming city-state of <strong>Singapore</strong>, cross into <strong>Malaysia</strong> to experience Kuala Lumpur\'s Petronas Towers and Penang\'s heritage streets, then finish in the temples and beaches of <strong>Thailand</strong>.</p><p>Perfectly balanced between city exploration, culture, and relaxation, this tour is ideal for first-time visitors to the region.</p>',
      summary: 'Singapore · Malaysia · Thailand in 12 days — the perfect introduction to South East Asia.',
      highlights: [
        'Gardens by the Bay & Marina Bay Sands, Singapore',
        'Petronas Twin Towers & Batu Caves, Kuala Lumpur',
        'Penang Georgetown UNESCO heritage walk',
        'Phi Phi Islands snorkelling day trip',
        'Bangkok Grand Palace & Wat Pho',
        'Thai cooking class in Chiang Mai',
      ],
      inclusions: ['Return airfare from Colombo', '11 nights hotel (4-star)', 'Daily breakfast', 'All inter-city transfers & transport', 'Airport pickups & drop-offs', 'English-speaking tour guide'],
      exclusions: ['Visa fees (Singapore, Malaysia, Thailand)', 'Personal expenses', 'Travel insurance', 'Lunches & dinners unless stated'],
      images: [p('singapore-malaysia-thailand-tour', 1200, 800), p('phi-phi-islands-boat-tour', 1200, 800), p('bangkok-grand-palace-gold', 1200, 800), p('penang-heritage-george-town', 1200, 800), p('singapore-skyline-dusk', 1200, 800)],
      galleryLayout: 'grid-2x2',
      isFeatured: true,
      paxType: 'per person',
      isFoodIncluded: false,
      isTransportIncluded: true,
      hostLanguage: ['English', 'Sinhala'],
      difficulty: 'EASY' as const,
      minAge: 5,
      maxGroupSize: 20,
      cancellationPolicy: 'Free cancellation up to 21 days before departure. 50% refund within 14–21 days. No refund within 14 days.',
      emergencyContact: '+94 70 454 5455',
      mustCarryItem: ['Valid passport (6+ months validity)', 'Visas for all three countries', 'Travel insurance', 'Comfortable walking shoes', 'Light summer clothing'],
      visaNotes: 'Malaysia & Thailand offer visa-free entry for Sri Lankan passport holders. Singapore e-visa required (approx. USD 30, processed in 1–2 days).',
      isCustomizable: true,
      customizationNotes: 'Can be extended with Bali or Phuket beach extension. Private tour option available.',
      options: [
        { label: 'Singapore e-visa (Metro Voyage assisted)', price: 8000 },
        { label: 'Travel insurance (per person)', price: 3500 },
        { label: 'Phi Phi Islands speedboat day trip', price: 12000 },
        { label: 'Chiang Mai elephant sanctuary visit', price: 9500 },
      ],
      cancellationTiers: [
        { daysBeforeDep: 30, refundPercent: 100, label: 'Full refund' },
        { daysBeforeDep: 14, refundPercent: 50,  label: '50% refund' },
        { daysBeforeDep: 0,  refundPercent: 0,   label: 'No refund' },
      ],
    },
    {
      title: 'Dubai & Abu Dhabi Twin City Tour',
      slug: 'dubai-abu-dhabi-twin-city',
      region: 'Middle East',
      multiDestinations: ['Dubai', 'Abu Dhabi'],
      primaryDestinationId: D['dubai'],
      price: 295000,
      oldPrice: 340000,
      priceTwin: 265000,
      priceChild: 145000,
      extraNightPrice: 21000,
      duration: 8,
      nights: 7,
      starRating: 'FOUR' as const,
      description: '<p>Experience the best of the <strong>United Arab Emirates</strong> with this perfectly paced twin-city tour. Spend four nights in <strong>Dubai</strong> marvelling at the Burj Khalifa, taking a desert safari, and exploring the vibrant souks — then transfer to the capital <strong>Abu Dhabi</strong> for the Sheikh Zayed Grand Mosque, Louvre Abu Dhabi, and Yas Island thrills.</p>',
      summary: 'Dubai\'s glam meets Abu Dhabi\'s grandeur — 8 days across the UAE\'s two greatest cities.',
      highlights: [
        'Burj Khalifa At The Top observation deck',
        'Desert safari with dune bashing & BBQ dinner',
        'Sheikh Zayed Grand Mosque, Abu Dhabi',
        'Louvre Abu Dhabi art museum',
        'Dubai Gold & Spice Souks',
        'Ferrari World / Yas Waterworld, Yas Island',
      ],
      inclusions: ['Return airfare from Colombo', '7 nights 4-star hotel', 'Daily breakfast', 'Dubai–Abu Dhabi transfer', 'Desert safari with dinner', 'Airport transfers'],
      exclusions: ['UAE tourist visa (USD 90)', 'Personal expenses', 'Travel insurance', 'Theme park tickets unless stated'],
      images: [p('dubai-abu-dhabi-uae-tour', 1200, 800), p('sheikh-zayed-mosque-abu-dhabi', 1200, 800), p('dubai-burj-khalifa-top', 1200, 800), p('louvre-abu-dhabi-museum', 1200, 800), p('yas-island-ferrari-world', 1200, 800)],
      galleryLayout: 'featured-left',
      isFeatured: true,
      paxType: 'per person',
      isFoodIncluded: false,
      isTransportIncluded: true,
      hostLanguage: ['English', 'Sinhala', 'Tamil'],
      difficulty: 'EASY' as const,
      minAge: 3,
      maxGroupSize: 25,
      cancellationPolicy: 'Free cancellation up to 14 days before departure. No refund within 7 days.',
      emergencyContact: '+94 70 454 5455',
      mustCarryItem: ['Valid passport', 'UAE Tourist Visa', 'Modest clothing for mosque visits', 'Sunscreen'],
      visaNotes: 'Single UAE tourist visa covers both Dubai and Abu Dhabi. Metro Voyage processes the visa — cost approx. USD 90.',
      options: [
        { label: 'UAE Tourist Visa (Metro Voyage assisted)', price: 22000 },
        { label: 'Burj Khalifa At The Top ticket', price: 9500 },
        { label: 'Ferrari World / Yas Island ticket', price: 18000 },
        { label: 'Travel insurance (per person)', price: 3500 },
      ],
      cancellationTiers: [
        { daysBeforeDep: 21, refundPercent: 100, label: 'Full refund' },
        { daysBeforeDep: 7,  refundPercent: 50,  label: '50% refund' },
        { daysBeforeDep: 0,  refundPercent: 0,   label: 'No refund' },
      ],
    },
    {
      title: 'European Grand Tour',
      slug: 'european-grand-tour',
      region: 'Europe',
      multiDestinations: ['France', 'Italy', 'Switzerland'],
      primaryDestinationId: D['france'],
      price: 890000,
      oldPrice: 980000,
      priceTwin: 820000,
      priceChild: 450000,
      extraNightPrice: 42000,
      duration: 15,
      nights: 14,
      starRating: 'FOUR' as const,
      description: '<p>The ultimate European experience — three iconic countries, one unforgettable journey. Begin in the romance of <strong>Paris</strong> with the Eiffel Tower and Louvre, then journey through the Swiss Alps of <strong>Zürich and Interlaken</strong>, and conclude in the art-soaked streets of <strong>Rome, Florence, and Venice</strong>.</p><p>This carefully crafted 15-day itinerary covers the very best of Western Europe with comfortable coach travel and hand-picked hotels.</p>',
      summary: 'France · Switzerland · Italy — 15 days covering the cream of Western Europe.',
      highlights: [
        'Eiffel Tower & Louvre Museum, Paris',
        'Versailles Palace day trip',
        'Swiss Alps & Jungfrau mountain excursion',
        'Rhine Falls — Europe\'s largest waterfall',
        'Colosseum & Vatican City, Rome',
        'Florence art & Uffizi Gallery',
        'Gondola ride, Venice',
      ],
      inclusions: ['Return airfare from Colombo', '14 nights hotel (4-star)', 'Daily breakfast', 'Luxury AC coach throughout', 'English-speaking tour guide', 'Airport transfers', 'Entry to major monuments'],
      exclusions: ['Schengen visa (LKR 15,000 approx.)', 'Travel insurance', 'Personal expenses', 'Lunches & dinners'],
      images: [p('europe-paris-rome-switzerland-tour', 1200, 800), p('eiffel-tower-paris-night', 1200, 800), p('versailles-palace-garden', 1200, 800), p('swiss-alps-jungfrau', 1200, 800), p('colosseum-rome-italy', 1200, 800), p('venice-gondola-canal', 1200, 800)],
      galleryLayout: 'grid-3col',
      isFeatured: true,
      paxType: 'per person',
      isFoodIncluded: false,
      isTransportIncluded: true,
      hostLanguage: ['English', 'Sinhala'],
      difficulty: 'EASY' as const,
      minAge: 12,
      maxGroupSize: 30,
      cancellationPolicy: 'Free cancellation up to 30 days before departure. 50% refund within 15–30 days. No refund within 15 days.',
      emergencyContact: '+94 70 454 5455',
      mustCarryItem: ['Valid passport', 'Schengen visa', 'Travel insurance (mandatory)', 'Comfortable walking shoes', 'Warm layers for Switzerland'],
      visaNotes: 'Schengen visa required (covers France, Switzerland, Italy). Processing time 10–15 working days. Metro Voyage assists with documentation.',
      isCustomizable: false,
      options: [
        { label: 'Schengen Visa processing (Metro Voyage assisted)', price: 25000 },
        { label: 'Travel insurance — mandatory (per person)', price: 5500, isDefault: true },
        { label: 'Jungfrau mountain excursion upgrade', price: 22000 },
        { label: 'Vatican City guided tour', price: 12000 },
      ],
      cancellationTiers: [
        { daysBeforeDep: 45, refundPercent: 100, label: 'Full refund' },
        { daysBeforeDep: 30, refundPercent: 75,  label: '75% refund' },
        { daysBeforeDep: 15, refundPercent: 50,  label: '50% refund' },
        { daysBeforeDep: 0,  refundPercent: 0,   label: 'No refund' },
      ],
    },
    {
      title: 'Japan & South Korea Discovery',
      slug: 'japan-south-korea-discovery',
      region: 'Far East',
      multiDestinations: ['Japan', 'South Korea'],
      primaryDestinationId: D['japan'],
      price: 650000,
      oldPrice: 720000,
      priceTwin: 595000,
      priceChild: 330000,
      extraNightPrice: 35000,
      duration: 11,
      nights: 10,
      starRating: 'FIVE' as const,
      description: '<p>Two of Asia\'s most fascinating cultures in one epic tour. Immerse yourself in the ancient traditions of <strong>Japan</strong> — geishas in Kyoto, bullet trains, cherry blossom parks — then cross to vibrant <strong>South Korea</strong> for K-Pop culture, royal palaces, and Seoul\'s electrifying street food scene.</p>',
      summary: 'Japan + South Korea — 11 days of temples, tech, and incredible food.',
      highlights: [
        'Tokyo highlights: Shibuya, Akihabara, Meiji Shrine',
        'Mount Fuji day trip',
        'Kyoto geisha district & bamboo forest',
        'Hiroshima Peace Memorial',
        'Seoul\'s Gyeongbokgung Palace',
        'DMZ (Demilitarized Zone) tour',
        'K-Pop experience & Myeongdong shopping',
      ],
      inclusions: ['Return airfare from Colombo', '10 nights hotel (5-star)', 'Daily breakfast', 'Shinkansen (bullet train) pass', 'Airport transfers', 'English-speaking guide'],
      exclusions: ['Japan & Korea visas', 'Personal expenses', 'Travel insurance', 'Dinners'],
      images: [p('japan-south-korea-tour-cherry-blossom', 1200, 800), p('kyoto-geisha-district', 1200, 800), p('seoul-gyeongbokgung-palace', 1200, 800), p('hiroshima-peace-memorial', 1200, 800), p('myeongdong-seoul-shopping', 1200, 800)],
      galleryLayout: 'featured-right',
      isFeatured: false,
      paxType: 'per person',
      isFoodIncluded: false,
      isTransportIncluded: true,
      hostLanguage: ['English'],
      difficulty: 'MODERATE' as const,
      minAge: 10,
      maxGroupSize: 16,
      cancellationPolicy: 'Free cancellation up to 21 days. No refund within 14 days.',
      emergencyContact: '+94 70 454 5455',
      mustCarryItem: ['Valid passport', 'Japan & Korea visas', 'Travel insurance', 'IC Suica card (Japan)', 'T-Money card (Korea)', 'Comfortable walking shoes'],
      visaNotes: 'Japan visa required (Free of charge, processing 5–7 days). South Korea K-ETA required (USD 10 online, instant approval usually).',
      options: [
        { label: 'Japan Tourist Visa (Metro Voyage assisted)', price: 8500 },
        { label: 'South Korea K-ETA (Metro Voyage assisted)', price: 3500 },
        { label: 'Travel insurance (per person)', price: 3500 },
        { label: 'DMZ tour add-on (Seoul)', price: 9500 },
      ],
      cancellationTiers: [
        { daysBeforeDep: 30, refundPercent: 100, label: 'Full refund' },
        { daysBeforeDep: 14, refundPercent: 50,  label: '50% refund' },
        { daysBeforeDep: 0,  refundPercent: 0,   label: 'No refund' },
      ],
    },
    {
      title: 'Thailand & Bali Island Hopper',
      slug: 'thailand-bali-island-hopper',
      region: 'South East Asia',
      multiDestinations: ['Thailand', 'Bali'],
      primaryDestinationId: D['thailand'],
      price: 310000,
      oldPrice: 355000,
      priceTwin: 280000,
      priceChild: 155000,
      extraNightPrice: 16000,
      duration: 10,
      nights: 9,
      starRating: 'FOUR' as const,
      description: '<p>The perfect combination of beach bliss and tropical culture. Begin in <strong>Thailand</strong> with Bangkok\'s temples and the legendary Phi Phi Islands, then fly to the spiritual paradise of <strong>Bali</strong> for rice terraces, sacred monkey forests, and stunning sunset clifftops at Uluwatu.</p>',
      summary: 'Thailand beaches + Bali spirituality — 10 days of the best of tropical South East Asia.',
      highlights: [
        'Bangkok Grand Palace & Wat Pho temple',
        'Phi Phi Islands snorkelling & boat tour',
        'Phuket beach sunset',
        'Ubud Monkey Forest & rice terraces, Bali',
        'Tanah Lot & Uluwatu temple at sunset',
        'Balinese cooking class',
      ],
      inclusions: ['Return airfare from Colombo', 'Bangkok–Phuket–Bali internal flights', '9 nights hotel (4-star)', 'Daily breakfast', 'Island boat tour', 'Airport transfers'],
      exclusions: ['Personal expenses', 'Travel insurance', 'Bali tourist levy (USD 10)', 'Dinners'],
      images: [p('thailand-bali-beach-tour', 1200, 800), p('phi-phi-islands-turquoise', 1200, 800), p('ubud-rice-terraces-bali', 1200, 800), p('uluwatu-temple-cliff', 1200, 800)],
      galleryLayout: 'strip',
      isFeatured: false,
      paxType: 'per person',
      isFoodIncluded: false,
      isTransportIncluded: true,
      hostLanguage: ['English', 'Sinhala'],
      difficulty: 'EASY' as const,
      minAge: 5,
      maxGroupSize: 20,
      cancellationPolicy: 'Free cancellation up to 14 days. 50% refund 7–14 days. No refund within 7 days.',
      emergencyContact: '+94 70 454 5455',
      mustCarryItem: ['Valid passport', 'Swimwear', 'Sunscreen SPF 50+', 'Light cotton clothing', 'Travel insurance'],
      visaNotes: 'Thailand & Bali (Indonesia) both offer visa-free entry for Sri Lankan passport holders for up to 30 days.',
      options: [
        { label: 'Travel insurance (per person)', price: 3500 },
        { label: 'Phi Phi Islands premium speedboat', price: 12000 },
        { label: 'Balinese cooking class', price: 8500 },
        { label: 'Bali tourist levy (Metro Voyage assisted)', price: 3000 },
      ],
      cancellationTiers: [
        { daysBeforeDep: 21, refundPercent: 100, label: 'Full refund' },
        { daysBeforeDep: 7,  refundPercent: 50,  label: '50% refund' },
        { daysBeforeDep: 0,  refundPercent: 0,   label: 'No refund' },
      ],
    },
  ]

  for (const tour of tours) {
    await prisma.tour.create({ data: tour })
  }
  console.log('✅ Tours')

  // ── Visa Services ─────────────────────────────────────────────────────────────
  await prisma.visaService.deleteMany()
  await prisma.visaService.createMany({
    data: [
      {
        country: 'Maldives', slug: 'maldives', isVisaFree: true,
        description: 'Sri Lankan passport holders receive visa on arrival for up to 30 days free of charge.',
        requirements: ['Valid passport (6 months+ validity)', 'Return ticket', 'Hotel booking confirmation', 'Sufficient funds'],
        processingTime: 'On arrival', fee: 'Free',
        documents: ['Passport', 'Return flight ticket', 'Accommodation proof'],
        image: IMG.maldives,
      },
      {
        country: 'Dubai (UAE)', slug: 'dubai', isVisaFree: false,
        description: 'Tourist visa required for Sri Lankan passport holders. Metro Voyage handles the complete application process.',
        requirements: ['Valid passport (6 months+ validity)', 'Passport-sized photos', 'Bank statements (3 months)', 'Employment letter', 'Return ticket', 'Hotel booking'],
        processingTime: '3–5 working days', fee: 'USD 90–100',
        documents: ['Passport copy', 'Passport photo', 'Bank statement', 'Salary slip', 'Employment letter'],
        image: IMG.dubai,
      },
      {
        country: 'Malaysia', slug: 'malaysia', isVisaFree: true,
        description: 'Sri Lankan passport holders can enter Malaysia visa-free for up to 30 days.',
        requirements: ['Valid passport (6 months+ validity)', 'Return ticket', 'Hotel booking', 'Sufficient funds'],
        processingTime: 'On arrival', fee: 'Free',
        documents: ['Passport', 'Return flight ticket'],
        image: IMG.malaysia,
      },
      {
        country: 'Thailand', slug: 'thailand', isVisaFree: true,
        description: 'Sri Lankan passport holders receive visa exemption for up to 30 days.',
        requirements: ['Valid passport (6 months+ validity)', 'Return ticket', 'Hotel booking', 'Sufficient funds (10,000 THB)'],
        processingTime: 'On arrival', fee: 'Free',
        documents: ['Passport', 'Return flight ticket', 'Hotel booking'],
        image: IMG.thailand,
      },
      {
        country: 'Schengen (Europe)', slug: 'schengen', isVisaFree: false,
        description: 'Schengen visa required for travel to 27 European countries. We assist with the full application.',
        requirements: ['Valid passport (3 months+ beyond stay)', 'Travel insurance', 'Bank statements (3 months)', 'Employment proof', 'Accommodation details', 'Travel itinerary'],
        processingTime: '15–30 working days', fee: 'EUR 80',
        documents: ['Passport copies', 'Passport photos', 'Travel insurance', 'Bank statements', 'Employment letter', 'Cover letter'],
        image: IMG.france,
      },
    ],
  })
  console.log('✅ Visa services')

  // ── Reviews ───────────────────────────────────────────────────────────────────
  await prisma.review.deleteMany()
  await prisma.review.createMany({
    data: [
      {
        name: 'Sanduni Nimeshika Gunawardana', location: 'Colombo, Sri Lanka', rating: 5,
        body: 'Our Dubai trip was absolutely incredible! The Marina Dhow Cruise, Burj Khalifa visit, and the Desert Safari were all perfectly organised. Metro Voyage took care of every detail. Highly recommend!',
        status: 'APPROVED',
      },
      {
        name: 'Sajjaad Ahamed', location: 'Kandy, Sri Lanka', rating: 5,
        body: 'The customer service was exceptional. Naveed helped us with our visa and made the whole process stress-free. The Singapore tour was well-organised and the hotel was excellent. Will definitely book again!',
        status: 'APPROVED',
      },
      {
        name: 'Shashika Radalage', location: 'Galle, Sri Lanka', rating: 5,
        body: 'I was amazed by how well the Singapore tour was organised. Every transfer was on time, the guides were knowledgeable and friendly. The professionalism of Metro Voyage is truly top-notch.',
        status: 'APPROVED',
      },
      {
        name: 'Dilshan Perera', location: 'Negombo, Sri Lanka', rating: 5,
        body: 'Booked our Japan honeymoon through Metro Voyage and it was a dream come true. The Ryokan stay, cherry blossoms, and private tea ceremony were magical. Every detail was perfect.',
        status: 'APPROVED',
      },
      {
        name: 'Fathima Nishara', location: 'Colombo, Sri Lanka', rating: 5,
        body: 'The Bali honeymoon package was beyond our expectations. The private villa was stunning, the spa was world class. Metro Voyage made our honeymoon absolutely unforgettable.',
        status: 'APPROVED',
      },
    ],
  })
  console.log('✅ Reviews')

  // ── Site Settings ─────────────────────────────────────────────────────────────
  await prisma.siteSetting.deleteMany()
  const settings = [
    { key: 'site_name',            value: 'Metro Voyage' },
    { key: 'tagline',              value: 'Your Dream Holiday Starts Here' },
    { key: 'hero_image',           value: IMG.hero },
    { key: 'contact_phone',        value: '+94 70 454 5455' },
    { key: 'contact_email',        value: 'contact@metrovoyage.lk' },
    { key: 'contact_address',      value: 'Level 2, 9/1, Deal Place A, Kollupitiya, Colombo 03' },
    { key: 'contact_whatsapp',     value: '+94704545455' },
    { key: 'social_instagram',     value: 'https://instagram.com/metrovoyage' },
    { key: 'social_facebook',      value: 'https://facebook.com/metrovoyage' },
    { key: 'social_youtube',       value: 'https://youtube.com/@metrovoyage' },
    { key: 'social_tiktok',        value: 'https://tiktok.com/@metrovoyage' },
    { key: 'registration_number',  value: 'PV 00250114' },
    { key: 'operating_hours',      value: '9 AM – 10 PM' },
    // Loyalty
    { key: 'loyalty_enabled',           value: 'true' },
    { key: 'loyalty_hero_badge',        value: 'EXCLUSIVE REWARDS' },
    { key: 'loyalty_hero_title',        value: 'Metro Voyage Privilege Card' },
    { key: 'loyalty_hero_subtitle',     value: 'Earn exclusive rewards every time you travel with us' },
    { key: 'loyalty_cta_label',         value: 'Register Now — It\'s Free' },
    { key: 'loyalty_step1_title',       value: 'Book a Holiday' },
    { key: 'loyalty_step1_body',        value: 'Make your first holiday package purchase with Metro Voyage.' },
    { key: 'loyalty_step2_title',       value: 'Register for Privilege' },
    { key: 'loyalty_step2_body',        value: 'Complete your registration after your first booking to join.' },
    { key: 'loyalty_step3_title',       value: 'Earn & Redeem' },
    { key: 'loyalty_step3_body',        value: 'Accumulate points on future bookings and redeem for discounts and upgrades.' },
    { key: 'loyalty_eligibility_note',  value: 'You must have booked at least one holiday package with us before registering.' },
    { key: 'loyalty_bronze_perks',      value: 'Priority customer support\nEarly access to promotions\n5% discount on bookings' },
    { key: 'loyalty_silver_perks',      value: 'All Bronze benefits\n10% discount on bookings\nFree travel insurance' },
    { key: 'loyalty_gold_perks',        value: 'All Silver benefits\n15% discount on bookings\nComplimentary airport transfers\nDedicated travel consultant' },
    { key: 'loyalty_tc',                value: 'Points are valid for 24 months from date of issue. Metro Voyage reserves the right to modify the program at any time with reasonable notice.' },
    { key: 'loyalty_terms_eligibility', value: 'The Privilege Card is available to customers who have completed at least one holiday booking with Metro Voyage.' },
    { key: 'loyalty_terms_points',      value: 'Points are earned on the net package price, excluding taxes, visa fees, and third-party surcharges.' },
    { key: 'loyalty_terms_redemption',  value: 'Points may be redeemed for discounts on future bookings, complimentary upgrades, or excursions. Minimum redemption threshold applies.' },
    { key: 'loyalty_terms_validity',    value: 'Points are valid for 24 months from the date of issue. Expired points cannot be reinstated.' },
    { key: 'loyalty_terms_modification',value: 'Metro Voyage reserves the right to modify, suspend, or terminate the Privilege Card program at any time with reasonable notice.' },
    { key: 'loyalty_terms_liability',   value: 'Metro Voyage is not liable for any loss resulting from the use or inability to use earned points.' },
  ]
  await prisma.siteSetting.createMany({ data: settings })
  console.log('✅ Site settings')

  // ── Perks ─────────────────────────────────────────────────────────────────────
  await prisma.perk.deleteMany()
  await prisma.perk.createMany({
    data: [
      { title: 'SLTDA Licensed',          description: 'Fully certified by the Sri Lanka Tourism Development Authority — your safety and trust guaranteed.', iconName: 'FiShield',    iconColor: '#f59e0b', bgColor: '#fffbeb', sortOrder: 1, isActive: true },
      { title: '24/7 Support',            description: 'Our dedicated team is available around the clock to assist you before, during, and after your trip.', iconName: 'FiHeadphones', iconColor: '#0d9488', bgColor: '#f0fdfa', sortOrder: 2, isActive: true },
      { title: 'Best Price Guarantee',    description: 'We match or beat any comparable quote — you deserve the best holiday at the best price.',            iconName: 'FiTag',       iconColor: '#7c3aed', bgColor: '#f5f3ff', sortOrder: 3, isActive: true },
      { title: 'Tailor-Made Itineraries', description: 'Every trip is personalised to your preferences, budget, and travel style — nothing is off-the-shelf.',iconName: 'FiEdit',      iconColor: '#dc2626', bgColor: '#fef2f2', sortOrder: 4, isActive: true },
      { title: 'Visa Assistance',         description: 'Expert guidance and documentation support for visa applications to 50+ destinations worldwide.',       iconName: 'FiFileText', iconColor: '#2563eb', bgColor: '#eff6ff', sortOrder: 5, isActive: true },
      { title: 'Loyalty Rewards',         description: 'Earn points on every booking with our Privilege Card and redeem them for discounts and upgrades.',    iconName: 'FiGift',      iconColor: '#ec4899', bgColor: '#fdf2f8', sortOrder: 6, isActive: true },
    ],
  })
  console.log('✅ Perks')

  // ── News ──────────────────────────────────────────────────────────────────────
  await prisma.news.deleteMany()
  await prisma.news.createMany({
    data: [
      {
        title: 'Tourist Arrivals Surge in Sri Lanka — Record Highs in Early 2025',
        slug: 'tourist-arrivals-surge-sri-lanka-2025',
        body: '<p>Sri Lanka recorded its highest monthly tourist count in January 2025, signalling a strong recovery for the tourism sector. The island welcomed over 220,000 visitors in January alone, a 34% increase year-on-year.</p><p>The surge is attributed to improved air connectivity, competitive package pricing, and Sri Lanka\'s growing reputation as a premium destination. Metro Voyage has seen a corresponding increase in inbound bookings from Sri Lanka to international destinations.</p>',
        excerpt: 'Sri Lanka recorded its highest monthly tourist count in January 2025, signalling a strong recovery for the tourism sector.',
        source: 'News First', imageUrl: IMG.newsTourism,
        publishedAt: new Date('2025-02-06'), isActive: true,
      },
      {
        title: 'Sri Lanka among Top Eid Getaways for Omani Travellers in 2025',
        slug: 'sri-lanka-top-eid-getaway-oman',
        body: '<p>Sri Lanka has emerged as one of the preferred Eid holiday destinations for travellers from Oman, thanks to its scenic beauty, warm hospitality, and ease of access. Oman Air and SriLankan Airlines have both increased frequency on the Muscat–Colombo route ahead of the Eid season.</p><p>Travel agents in Oman report a 60% spike in Sri Lanka bookings compared to the same period last year, with beach resorts and cultural tours being the most popular choices.</p>',
        excerpt: 'Sri Lanka has emerged as a preferred Eid holiday destination for Omani travellers, with flight bookings up 60%.',
        source: 'Daily Mirror', imageUrl: IMG.newsEid,
        publishedAt: new Date('2025-03-26'), isActive: true,
      },
      {
        title: 'Emirates Upgrades Boeing 777 Cabins on Sri Lanka & Maldives Routes',
        slug: 'emirates-777-upgrades-sri-lanka',
        body: '<p>Emirates will introduce premium cabin upgrades on its Boeing 777 aircraft serving Sri Lanka and Maldives routes starting June 2025. The upgrade includes enhanced Business Class suites with direct aisle access and a redesigned Economy cabin with larger screens and improved seating.</p><p>The move is expected to boost travel demand on these routes significantly. Metro Voyage customers booking Emirates flights through us will benefit from exclusive fare deals on the upgraded aircraft.</p>',
        excerpt: 'Emirates upgrades premium cabins on Sri Lanka & Maldives routes from June 2025 — better seating, larger screens.',
        source: 'Travel and Tour World', imageUrl: IMG.newsAirline,
        publishedAt: new Date('2025-03-25'), isActive: true,
      },
    ],
  })
  console.log('✅ News')

  // ── Blogs ─────────────────────────────────────────────────────────────────────
  await prisma.blog.deleteMany()
  await prisma.blog.createMany({
    data: [
      {
        title: "Asela's Epic Adventure: From Sri Lanka to South Africa",
        slug: 'asela-epic-adventure-sri-lanka-south-africa',
        body: `<h2>A Journey Beyond Expectations</h2>
<p>When Asela first contacted us about his dream trip to South Africa, he wasn't quite sure what to expect. As an experienced traveller from Sri Lanka, he had visited several Asian destinations, but Africa was entirely new territory.</p>
<p>Our team worked closely with Asela to craft an itinerary showcasing the very best of South Africa — from the iconic <strong>Table Mountain</strong> in Cape Town to a thrilling safari in <strong>Kruger National Park</strong>.</p>
<h2>The Safari Experience</h2>
<p>The journey was nothing short of epic. Asela witnessed the Big Five in their natural habitat, explored the vibrant neighbourhoods of Johannesburg, and stood at the dramatic Cape of Good Hope where two oceans meet.</p>
<blockquote><p>"The contrast between Sri Lanka and South Africa is striking. But Metro Voyage made every transition seamless. I never once felt lost or unsure — they had everything perfectly arranged."</p></blockquote>
<h2>Planning Your African Adventure</h2>
<p>South Africa is an incredible destination for Sri Lankan travellers. The best time to visit for safaris is June–September (dry winter season). Visa applications typically take 10–15 working days and our team handles the full process for you.</p>`,
        excerpt: "Chronicles Asela's extraordinary journey from Sri Lanka to South Africa — the Big Five, Cape Town, and unforgettable safaris.",
        category: 'Adventure', author: 'Metro Voyage Team', readingTime: 5,
        imageUrl: IMG.blogSouthAfrica, publishedAt: new Date('2025-06-18'), isActive: true,
      },
      {
        title: 'Top 7 Things to Do in Dubai on a Budget — Sri Lanka Perspective',
        slug: 'top-7-dubai-budget-tips-sri-lanka',
        body: `<h2>Dubai Doesn't Have to Break the Bank</h2>
<p>Many travellers assume Dubai is exclusively for the ultra-wealthy. While it certainly has world-class luxury, savvy travellers from Sri Lanka can experience the best of Dubai without overspending.</p>
<h2>1. Visit the Dubai Frame at Golden Hour</h2>
<p>The <strong>Dubai Frame</strong> offers some of the most spectacular panoramic views in the city at a fraction of the cost of other attractions. Visit at sunset for an unforgettable experience.</p>
<h2>2. Explore the Old Dubai Souks</h2>
<p>The Gold Souk and Spice Souk in Deira offer a fascinating glimpse into old Dubai — and admission is free. Take an abra (water taxi) across the Creek for just AED 1.</p>
<h2>3. Free Beaches</h2>
<p>Jumeirah Beach is completely free and offers stunning views of the Burj Al Arab. Pack a picnic and enjoy a full day out with the family.</p>
<p><em>Contact our team for our budget-friendly Dubai packages starting from LKR 95,000 per person.</em></p>`,
        excerpt: 'Discover how to experience the best of Dubai without overspending — insider tips for Sri Lankan travellers.',
        category: 'Travel Tips', author: 'Metro Voyage Team', readingTime: 4,
        imageUrl: IMG.blogDubai, publishedAt: new Date('2025-04-10'), isActive: true,
      },
      {
        title: 'Why the Maldives Should Be Your Next Honeymoon Destination',
        slug: 'maldives-perfect-honeymoon-destination',
        body: `<h2>Paradise Found</h2>
<p>The Maldives consistently tops polls for the world's most romantic destination — and for very good reason. Imagine waking up in an <strong>overwater bungalow</strong>, stepping directly into crystal-clear turquoise water, and watching the sun set over an endless ocean horizon.</p>
<h2>Best Time to Visit</h2>
<p>The Maldives is a year-round destination. The peak dry season runs from <strong>November to April</strong>, with calm seas and minimal rainfall — ideal for snorkelling and water sports. The shoulder season (May–October) offers lower prices with occasional afternoon showers.</p>
<h2>What's Included in Our Honeymoon Package</h2>
<ul>
<li>Return airfare from Colombo</li>
<li>4 nights overwater bungalow (full board)</li>
<li>Speedboat transfers from Malé airport</li>
<li>Welcome rose petal arrangement</li>
<li>Couple spa treatment</li>
<li>Sunset dolphin cruise</li>
</ul>
<p>Our Maldives Romantic Escape starts at <strong>LKR 350,000 per couple</strong>. Contact us to check current availability.</p>`,
        excerpt: 'The Maldives is the world\'s most romantic destination — here\'s why it should be your perfect honeymoon choice.',
        category: 'Honeymoon', author: 'Metro Voyage Team', readingTime: 6,
        imageUrl: IMG.blogMaldives, publishedAt: new Date('2025-05-20'), isActive: true,
      },
    ],
  })
  console.log('✅ Blogs')

  console.log('\n🎉 Seeding complete — Metro Voyage is ready!')
  console.log('\n📧 Admin login:')
  console.log('   Email:    admin@example.com')
  console.log('   Password: admin123')
  console.log('   (Also works: admin@gmail.com / admin123)')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
