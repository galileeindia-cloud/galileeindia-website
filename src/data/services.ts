export type WeeklyService = {
  title: string;
  day: string;
  time: string;
  note?: string;
  color: string;
};

export const WEEKLY_SERVICES: WeeklyService[] = [
  {
    title: "Sunday Worship",
    day: "Every Sunday",
    time: "10:30 AM – 12:30 PM",
    color: "#1e3a8a",
  },
  {
    title: "Sunday School",
    day: "Every Sunday",
    time: "11:30 AM – 12:30 PM",
    note: "Children will be taken to Sunday School at 11:30 AM and safely returned to their parents at 12:30 PM.",
    color: "#198754",
  },
  {
    title: "Women's Fellowship",
    day: "Every Friday",
    time: "11:00 AM – 1:30 PM",
    color: "#6f42c1",
  },
  {
    title: "Fasting Prayer",
    day: "Every Saturday",
    time: "7:30 PM – 9:00 PM",
    color: "#fd7e14",
  },
  {
    title: "Wednesday Prayer Meeting",
    day: "Launching Soon",
    time: "7:30 PM – 8:30 PM",
    color: "#dc3545",
  },
];
