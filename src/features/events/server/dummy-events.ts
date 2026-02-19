import { 
  addHours, 
  startOfToday, 
  subDays, 
  addDays, 
  subHours, 
  addWeeks, 
  subWeeks 
} from "date-fns";
import { EventTypes } from "../types";

const today = startOfToday();

export const DUMMY_EVENTS: EventTypes[] = [
  // ============================================================
  // 🔴 OVERDUE & PAST (Guzra waqt - Dark Red/Rose Border)
  // ============================================================
  {
    $id: "evt_past_01",
    title: "Legacy Database Cleanup",
    date: subWeeks(today, 2).toISOString(), // 2 hafte pehle (Bohot purana)
    time: "10:00 AM",
    description: "Removing unused tables from the legacy SQL database.",
    project: { name: "Backend Infrastructure" },
    segment: { name: "DevOps" },
    eventCreator: { name: "Alice" },
    opened: true // Purana hai, shayad dekh liya ho
  },
  {
    $id: "evt_past_02",
    title: "Missed Client Call",
    date: subDays(today, 1).toISOString(), // Kal (Yesterday)
    time: "03:00 PM",
    description: "Scheduled call with Client X regarding API issues.",
    project: { name: "E-commerce API" },
    segment: { name: "Sales" },
    eventCreator: { name: "Bob" },
    opened: false // Miss ho gya aur abhi tak khola bhi nahi! (New + Overdue)
  },

  // ============================================================
  // 🛑 URGENT (Today & Next 3 Days - Red Border)
  // ============================================================
  {
    $id: "evt_today_01",
    title: "CRITICAL: Server Maintenance",
    date: addHours(today, 2).toISOString(), // Aaj, 2 ghante baad
    time: "11:00 AM",
    description: "Emergency patch for security vulnerability.",
    project: { name: "Internal Tools" },
    segment: { name: "Security" },
    eventCreator: { name: "Charlie" },
    opened: false // NEW & URGENT!
  },
  {
    $id: "evt_today_02",
    title: "Team Lunch",
    date: addHours(today, 13).toISOString(), // Aaj dopehar 1 baje
    time: "01:00 PM",
    description: "Welcome lunch for the new intern.",
    project: { name: "General" },
    segment: { name: "HR" },
    eventCreator: { name: "David" },
    opened: true
  },
  {
    $id: "evt_soon_01",
    title: "Final QA Testing",
    date: addDays(today, 1).toISOString(), // Kal (Tomorrow)
    time: "04:00 PM",
    description: "Final round of testing before Friday release.",
    project: { name: "Mobile App" },
    segment: { name: "QA" },
    eventCreator: { name: "Eve" },
    opened: true
  },
  {
    $id: "evt_soon_02",
    title: "Design Review",
    date: addDays(today, 3).toISOString(), // 3 Din baad (Borderline Urgent)
    time: "10:00 AM",
    description: "Reviewing the new dashboard mockups.",
    project: { name: "Website Redesign" },
    segment: { name: "Design" },
    eventCreator: { name: "Frank" },
    opened: false
  },

  // ============================================================
  // 🟠 APPROACHING (Within 7 Days - Orange Border)
  // ============================================================
  {
    $id: "evt_week_01",
    title: "Weekly Sync",
    date: addDays(today, 5).toISOString(), // 5 Din baad
    time: "09:00 AM",
    description: "Weekly progress report meeting.",
    project: { name: "Core Platform" },
    segment: { name: "Management" },
    eventCreator: { name: "Grace" },
    opened: true
  },
  {
    $id: "evt_week_02",
    title: "Client Demo Preparation",
    date: addDays(today, 6).toISOString(), // 6 Din baad
    time: "02:00 PM",
    description: "Preparing slides and demo environment.",
    project: { name: "Mobile App" },
    segment: { name: "Sales" },
    eventCreator: { name: "Alice" },
    opened: false // New
  },

  // ============================================================
  // 🟡 MEDIUM TERM (Within 14 Days - Yellow Border)
  // ============================================================
  {
    $id: "evt_mid_01",
    title: "Sprint Retrospective",
    date: addDays(today, 10).toISOString(), // 10 Din baad
    time: "04:00 PM",
    description: "Discussing what went well and what didn't.",
    project: { name: "Internal Tools" },
    segment: { name: "Engineering" },
    eventCreator: { name: "Bob" },
    opened: true
  },
  {
    $id: "evt_mid_02",
    title: "Budget Review Q3",
    date: addDays(today, 13).toISOString(), // 13 Din baad
    time: "11:00 AM",
    description: "Reviewing budget allocation for next quarter.",
    project: { name: "Finance" },
    segment: { name: "Management" },
    eventCreator: { name: "Charlie" },
    opened: false
  },

  // ============================================================
  // 🟢 SAFE / FUTURE (Far Away - Green/Emerald Border)
  // ============================================================
  {
    $id: "evt_future_01",
    title: "Company Annual Retreat",
    date: addWeeks(today, 3).toISOString(), // 3 Hafte baad
    time: "08:00 AM",
    description: "Trip to the northern areas.",
    project: { name: "General" },
    segment: { name: "HR" },
    eventCreator: { name: "David" },
    opened: true
  },
  {
    $id: "evt_future_02",
    title: "Project 'Titan' Launch",
    date: addWeeks(today, 5).toISOString(), // 1 Mahina baad
    time: "12:00 PM",
    description: "Official public launch of the new product.",
    project: { name: "Project Titan" },
    segment: { name: "Marketing" },
    eventCreator: { name: "Eve" },
    opened: false // Bohat door hai, lekin abhi tak khola nahi
  }
];