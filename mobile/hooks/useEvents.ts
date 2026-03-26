import { useQuery } from "@tanstack/react-query";

export type Event = {
  id: number;
  title: string;
  organization: string;
  date: string; // "YYYY-MM-DD"
  location: string;
  category: string;
  suborg: string;
  isSignedUp: boolean;
};

const today = new Date();
function isoDate(offsetDays: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    title: "Food Bank Sorting Shift",
    organization: "Central Food Bank",
    date: isoDate(1),
    location: "123 Main St",
    category: "Hunger Relief",
    suborg: "NHS",
    isSignedUp: false,
  },
  {
    id: 2,
    title: "Park Trail Cleanup",
    organization: "City Parks Dept",
    date: isoDate(3),
    location: "Riverside Park",
    category: "Environment",
    suborg: "Key Club",
    isSignedUp: true,
  },
  {
    id: 3,
    title: "Literacy Tutoring Session",
    organization: "Read Together",
    date: isoDate(0),
    location: "Public Library, Room 4",
    category: "Education",
    suborg: "NHS",
    isSignedUp: false,
  },
  {
    id: 4,
    title: "Animal Shelter Helper",
    organization: "Happy Paws Shelter",
    date: isoDate(5),
    location: "456 Oak Ave",
    category: "Animal Welfare",
    suborg: "Student Council",
    isSignedUp: false,
  },
  {
    id: 5,
    title: "Senior Center Bingo Night",
    organization: "Oakwood Senior Center",
    date: isoDate(2),
    location: "Oakwood Community Hall",
    category: "Elder Care",
    suborg: "Key Club",
    isSignedUp: true,
  },
  {
    id: 6,
    title: "Community Garden Planting",
    organization: "Green Thumb Coalition",
    date: isoDate(7),
    location: "Elm Street Garden",
    category: "Environment",
    suborg: "NHS",
    isSignedUp: false,
  },
  {
    id: 7,
    title: "Homeless Shelter Meal Prep",
    organization: "Hope House",
    date: isoDate(4),
    location: "789 Center Blvd",
    category: "Hunger Relief",
    suborg: "Student Council",
    isSignedUp: false,
  },
  {
    id: 8,
    title: "STEM Workshop for Kids",
    organization: "Youth Science Club",
    date: isoDate(10),
    location: "Franklin Elementary",
    category: "Education",
    suborg: "Key Club",
    isSignedUp: false,
  },
  {
    id: 9,
    title: "Beach Cleanup Drive",
    organization: "Coastal Alliance",
    date: isoDate(14),
    location: "Sunset Beach",
    category: "Environment",
    suborg: "NHS",
    isSignedUp: false,
  },
  {
    id: 10,
    title: "Blood Drive Volunteer",
    organization: "Red Cross",
    date: isoDate(6),
    location: "Community Center",
    category: "Health",
    suborg: "Student Council",
    isSignedUp: true,
  },
];

export function useEvents() {
  return useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: async () => MOCK_EVENTS,
    staleTime: Infinity,
  });
}
