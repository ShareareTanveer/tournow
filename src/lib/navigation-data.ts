export type NavigationDestination = {
  readonly label: string
  readonly slug: string
}

export type DestinationRegion = {
  readonly region: string
  readonly destinations: readonly NavigationDestination[]
}

export const DESTINATION_REGIONS: readonly DestinationRegion[] = [
  {
    region: 'Asia',
    destinations: [
      { label: 'Maldives', slug: 'maldives' },
      { label: 'Thailand', slug: 'thailand' },
      { label: 'Turkey', slug: 'turkey' },
      { label: 'Japan', slug: 'japan' },
      { label: 'Indonesia (Bali)', slug: 'bali' },
      { label: 'China', slug: 'china' },
      { label: 'South Korea', slug: 'south-korea' },
      { label: 'Russia', slug: 'russia' },
    ],
  },
  {
    region: 'Europe',
    destinations: [
      { label: 'France', slug: 'france' },
      { label: 'Italy', slug: 'italy' },
      { label: 'Greece', slug: 'greece' },
    ],
  },
  {
    region: 'Middle East',
    destinations: [
      { label: 'Dubai (UAE)', slug: 'dubai' },
      { label: 'Oman', slug: 'oman' },
      { label: 'Azerbaijan', slug: 'azerbaijan' },
    ],
  },
  {
    region: 'Africa',
    destinations: [{ label: 'Egypt', slug: 'egypt' }],
  },
  {
    region: 'Australia & Oceania',
    destinations: [{ label: 'Australia', slug: 'australia' }],
  },
]
