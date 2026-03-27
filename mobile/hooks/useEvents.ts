import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchOpportunities,
  signupForOpportunity,
  withdrawFromOpportunity,
  type OpportunityResponse,
} from "../lib/api/opportunities";
import { USE_API } from "../lib/config";

/** Normalized event shape used throughout the mobile app. */
export type Event = {
  id: number;
  title: string;
  description: string | null;
  organization: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  location: string;
  category: string;
  maxVolunteers: number | null;
  spotsRemaining: number | null;
  isFull: boolean;
  isSignedUp: boolean;
  requiredHours: number | null;
};

/** Maps a raw API opportunity into the normalized Event shape. */
function mapOpportunityToEvent(o: OpportunityResponse): Event {
  return {
    id: o.id,
    title: o.title,
    description: o.description,
    organization: o.title,
    date: o.date,
    startTime: o.start_time,
    endTime: o.end_time,
    location: o.location ?? "",
    category: o.category ?? "Uncategorized",
    maxVolunteers: o.max_volunteers,
    spotsRemaining: o.spots_remaining,
    isFull: o.full,
    isSignedUp: o.signed_up,
    requiredHours: o.required_hours,
  };
}

// ─── Mock data for offline/dev use ───────────────────────────────────────────

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
    description: null,
    organization: "Central Food Bank",
    date: isoDate(1),
    startTime: null,
    endTime: null,
    location: "123 Main St",
    category: "Hunger Relief",
    maxVolunteers: null,
    spotsRemaining: null,
    isFull: false,
    isSignedUp: false,
    requiredHours: null,
  },
  {
    id: 2,
    title: "Park Trail Cleanup",
    description: null,
    organization: "City Parks Dept",
    date: isoDate(3),
    startTime: null,
    endTime: null,
    location: "Riverside Park",
    category: "Environment",
    maxVolunteers: null,
    spotsRemaining: null,
    isFull: false,
    isSignedUp: true,
    requiredHours: null,
  },
  {
    id: 3,
    title: "Literacy Tutoring Session",
    description: null,
    organization: "Read Together",
    date: isoDate(0),
    startTime: null,
    endTime: null,
    location: "Public Library, Room 4",
    category: "Education",
    maxVolunteers: null,
    spotsRemaining: null,
    isFull: false,
    isSignedUp: false,
    requiredHours: null,
  },
  {
    id: 4,
    title: "Animal Shelter Helper",
    description: null,
    organization: "Happy Paws Shelter",
    date: isoDate(5),
    startTime: null,
    endTime: null,
    location: "456 Oak Ave",
    category: "Animal Welfare",
    maxVolunteers: null,
    spotsRemaining: null,
    isFull: false,
    isSignedUp: false,
    requiredHours: null,
  },
  {
    id: 5,
    title: "Senior Center Bingo Night",
    description: null,
    organization: "Oakwood Senior Center",
    date: isoDate(2),
    startTime: null,
    endTime: null,
    location: "Oakwood Community Hall",
    category: "Elder Care",
    maxVolunteers: null,
    spotsRemaining: null,
    isFull: false,
    isSignedUp: true,
    requiredHours: null,
  },
];

// ─── Query & Mutation Hooks ──────────────────────────────────────────────────

/** Fetches upcoming events from the API, falling back to mocks when no server is configured. */
export function useEvents() {
  return useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: async () => {
      if (!USE_API) return MOCK_EVENTS;

      const res = await fetchOpportunities();
      return res.opportunities.map(mapOpportunityToEvent);
    },
    staleTime: USE_API ? 1000 * 30 : Infinity,
  });
}

/** Mutation to toggle signup/withdraw for an opportunity. */
export function useToggleSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isSignedUp,
    }: {
      id: number;
      isSignedUp: boolean;
    }) => {
      if (isSignedUp) {
        await withdrawFromOpportunity(id);
      } else {
        await signupForOpportunity(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
