export type ChurchEvent = {
  date: string;
  event: string;
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
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function eventTime({ date }: ChurchEvent) {
  const [day, month, year] = date.split(" ");
  return Date.UTC(Number(year), MONTHS.indexOf(month), Number(day));
}

/** Latest date first, so the most recent (or furthest-out) event leads the calendar. */
export function getEventsNewestFirst(): ChurchEvent[] {
  return [...CHURCH_EVENTS].sort((a, b) => eventTime(b) - eventTime(a));
}

export const NEWS_MESSAGE =
  "Whole night Fasting Prayer on 9th Oct 2026, 7:30 PM – 12:00 AM";
