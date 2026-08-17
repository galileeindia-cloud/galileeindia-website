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
  { date: "11 Sep 2026", event: "Whole Night Fasting Prayer" },
];

export const NEWS_MESSAGE =
  "Whole night Fasting Prayer on 11th Sept 2026, 7:30 PM – 12:00 AM";
