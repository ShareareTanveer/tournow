export const categories = [
  "Animals & wildlife",
  "Art & architecture",
  "Entertainment",
  "Festivals & Holidays",
  "Food & Drinks",
  "History",
  "Local culture & religion",
  "Nature",
  "Science & literature",
  "Sightseeing",
] as const;

export type Category = (typeof categories)[number];

export const keywordsByCategory: Record<Category, string[]> = {
  "Animals & wildlife": ["Wildlife", "Safari", "Zoo", "Birds"],
  "Art & architecture": ["Culture", "Architecture", "Museums", "Galleries"],
  Entertainment: ["Concerts", "Theater", "Movies", "Events"],
  "Festivals & Holidays": ["Christmas", "Easter", "Diwali", "Halloween"],
  "Food & Drinks": ["Restaurants", "Bars", "Cafes", "Wine Tasting"],
  History: ["Historical Sites", "Monuments", "Museums", "Ancient Cities"],
  "Local culture & religion": [
    "Traditions",
    "Religious Sites",
    "Local Festivals",
  ],
  Nature: ["Mountains", "Forests", "Lakes", "Rivers"],
  "Science & literature": ["Libraries", "Bookstores", "Science Museums"],
  Sightseeing: ["City Tours", "Landmarks", "Scenic Views"],
};

export const icons = {
  reserve: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 6a3 3 0 0 1 3-3h12.75a3 3 0 0 1 3 3v4.858a7.007 7.007 0 0 0-2-1.297v-.936H4V15a1 1 0 0 0 1 1h4c0 .695.101 1.366.29 2H5a3 3 0 0 1-3-3V6Zm3-1h12.75a1 1 0 0 1 1 1v.625H4V6a1 1 0 0 1 1-1Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M12 16a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm4-6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm1 5.586V13h-2v3.414l2.293 2.293 1.414-1.414L17 15.586Z" fill="#0071EB"></path></svg>`,
  free: `<svg width="24" height="24" class="c-icon__c-calendar-check" viewBox="0 0 24 24" fill="currentColor"><path d="M9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>`,
  duration: `<svg width="24" height="24" class="c-icon__c-clock-duration" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`,
  host: `<svg width="24" height="24" class="c-icon__c-guide" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4 10c0-1.66 3.34-2.5 4-2.5s4 .84 4 2.5V18H8v-2zM16 10h2v2h-2zM17.5 8h-3v1h3c.28 0 .5.22.5.5s-.22.5-.5.5h-3v1h3c.83 0 1.5-.67 1.5-1.5S18.33 8 17.5 8z"/></svg>`,
  home: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9L12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  user: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/></svg>`,
  settings: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .33 1.74l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.74-.33 1.6 1.6 0 0 0-1 1.48V21a2 2 0 0 1-4 0v-.08a1.6 1.6 0 0 0-1-1.48 1.6 1.6 0 0 0-1.74.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.48-1H3a2 2 0 0 1 0-4h.08a1.6 1.6 0 0 0 1.48-1 1.6 1.6 0 0 0-.33-1.74l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.6 1.6 0 0 0 9 4.6V4a2 2 0 0 1 4 0v.08a1.6 1.6 0 0 0 1 1.48 1.6 1.6 0 0 0 1.74-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.6 1.6 0 0 0 19.4 9a1.6 1.6 0 0 0 1.48 1H21a2 2 0 0 1 0 4h-.08a1.6 1.6 0 0 0-1.48 1z"/></svg>`,
  chat: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  bell: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  message: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-1.66 4.91 8.5 8.5 0 0 1-14.68 0A8.38 8.38 0 0 1 3 11.5"/><path d="M8 14l4-4 4 4"/><path d="M12 10v10"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`,

  
};
