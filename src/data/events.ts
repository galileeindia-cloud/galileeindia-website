export type ChurchEvent = {
  date: string;
  event: string;
  /** e.g. "11:00 AM – 2:00 PM" */
  time?: string;
  /** e.g. "Sis. G Prasanna Franklin, Visakhapatnam" */
  speaker?: string;
};

export const CHURCH_EVENTS: ChurchEvent[] = [
  { date: "01 Jan 2026", event: "New Year Service" },
  { date: "26 Jan 2026", event: "Special Prayer Meeting" },
  { date: "01 Apr 2026", event: "Fasting Prayers" },
  { date: "02 Apr 2026", event: "Fasting Prayers" },
  { date: "03 Apr 2026", event: "Good Friday Service" },
  { date: "04 Apr 2026", event: "Fasting Service" },
  { date: "05 Apr 2026", event: "Easter Service" },
  {
    date: "18 Apr 2026",
    event: "Celebration of our Founding Pastor – 3rd Death Anniversary",
  },
  { date: "24 May 2026", event: "Special Sunday Service" },
  { date: "13 Jun 2026", event: "One Day Bible Conference" },
  { date: "07 Aug 2026", event: "Whole Night Prayer" },
  { date: "11 Sep 2026", event: "Whole night prayer" },
  { date: "09 Oct 2026", event: "Whole Night Fasting Prayer" },
  // Year End Revival Meeting. Same-day sessions are listed in time order.
  {
    date: "13 Nov 2026",
    event: "Year End Revival – Ladies Prayer Meeting",
    time: "11:00 AM – 2:00 PM",
    speaker: "Sis. G Prasanna Franklin, Visakhapatnam",
  },
  {
    date: "13 Nov 2026",
    event: "Year End Revival – Special Meeting",
    time: "7:00 PM – 10:00 PM",
    speaker: "Pastor D. Moses, Amalapuram",
  },
  {
    date: "14 Nov 2026",
    event: "Year End Revival – Special Meeting",
    time: "10:30 AM – 1:30 PM",
    speaker: "Pastor B. John Sudhakar, Visakhapatnam",
  },
  {
    date: "14 Nov 2026",
    event: "Year End Revival – Special Meeting",
    time: "7:00 PM – 10:00 PM",
    speaker: "Pastor Andrews, Visakhapatnam",
  },
  {
    date: "15 Nov 2026",
    event: "Year End Revival – Sunday Service",
    time: "10:30 AM – 12:30 PM",
  },
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function eventTime({ date }: ChurchEvent) {
  const [day, month, year] = date.split(" ");
  return Date.UTC(Number(year), MONTHS.indexOf(month), Number(day));
}

/**
 * Latest date first, so the most recent (or furthest-out) event leads the
 * calendar. Events on the same day keep their listed (time) order.
 */
export function getEventsNewestFirst(): ChurchEvent[] {
  return [...CHURCH_EVENTS].sort((a, b) => eventTime(b) - eventTime(a));
}

/** Poster shown in a pop-up on the homepage and puzzle pages, up to and including `until` (IST). */
export const ANNOUNCEMENT = {
  image: "/images/melodious-praise-2026.png",
  width: 1080,
  height: 1350,
  alt: "Melodious Praise, a special evening of thanksgiving, Saturday 28 November 2026 at 7:00 PM, Galilee Prayer Fellowship, Vizag. Live on YouTube @galileeindia3736",
  until: "2026-11-28",
};

export const NEWS_MESSAGE =
  "Year End Revival Meeting on 13th, 14th and 15th Nov 2026 in our Church Premises";
