// ─── Constants ────────────────────────────────────────────────────────────────

export const ACCENT = '#BC0001';

// ─── Courses ─────────────────────────────────────────────────────────────────

export const COURSES: Record<string, { color: string; label: string }> = {
  PHY:  { color: '#3B82F6', label: 'Physics 2325' },
  MATH: { color: '#22C55E', label: 'Math 2417' },
  HIST: { color: '#F97316', label: 'History 1301' },
  CS:   { color: '#DC2626', label: 'CS 3354' },
  SELF: { color: '#A855F7', label: 'Self-Scheduled' },
};

// ─── Tasks ───────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  course: keyof typeof COURSES;
  due: string;
  type: string;
  status: 'overdue' | 'upcoming';
  daysLabel: string;
  isPersonal?: boolean;
  detail: string;
}

export const TASKS: Task[] = [
  {
    id: 't1', title: 'Physics HW 4', course: 'PHY',
    due: 'Today, 11:59 PM', type: 'Homework', status: 'overdue', daysLabel: 'OVERDUE',
    detail: "Complete problems 4.1–4.8 from Chapter 4. Focus on Newton's Second Law applications and free-body diagrams. Submit via Canvas before midnight.",
  },
  {
    id: 't2', title: 'Calculus Problem Set 6', course: 'MATH',
    due: 'Yesterday, 11:59 PM', type: 'Problem Set', status: 'overdue', daysLabel: 'OVERDUE',
    detail: 'Solve integration problems 6.1–6.15. Use substitution method for 6.7–6.10. Show all work for full credit. Late submissions penalized 10% per day.',
  },
  {
    id: 't3', title: 'History Essay Draft', course: 'HIST',
    due: 'March 7, 11:59 PM', type: 'Essay', status: 'overdue', daysLabel: 'OVERDUE',
    detail: '1500-word draft on the causes of WWI. Must cite at least 4 primary sources. Submit via Canvas. Contact TA for late submission policy.',
  },
  {
    id: 't4', title: 'CS 3354 Project', course: 'CS',
    due: 'March 17, 11:59 PM', type: 'Project', status: 'upcoming', daysLabel: '8 DAYS',
    detail: 'Full-stack implementation: React frontend, Node.js backend, PostgreSQL database. Deploy to AWS. Include a README.md with setup instructions and architecture diagram.',
  },
  {
    id: 't5', title: 'Physics Quiz 2', course: 'PHY',
    due: 'March 12, 2:00 PM', type: 'Quiz', status: 'upcoming', daysLabel: '3 DAYS',
    detail: '30-minute in-class quiz. Covers Chapters 3–5: kinematics, dynamics, and work-energy theorem. No calculators. Bring a #2 pencil.',
  },
  {
    id: 't6', title: 'Calculus Exam 2', course: 'MATH',
    due: 'March 14, 10:00 AM', type: 'Exam', status: 'upcoming', daysLabel: '5 DAYS',
    detail: '90-minute closed-book exam. Topics: integration techniques (substitution, by parts), area between curves, volumes of revolution. 4 formula sheets allowed.',
  },
  {
    id: 't7', title: 'Study Session: Finals', course: 'SELF',
    due: 'March 15, 3:00 PM', type: 'Study Block', status: 'upcoming', daysLabel: 'PERSONAL',
    isPersonal: true,
    detail: 'Personal study block — Finals prep across all subjects. Allocated 2.5 hours. Location: Library Room 204. Bring all notes and practice exams.',
  },
];

// ─── Calendar Events ──────────────────────────────────────────────────────────

export interface CalEvent {
  id: string;
  title: string;
  course: keyof typeof COURSES;
  day: number;        // 1=Mon … 7=Sun
  startHour: number;  // 24h float e.g. 14.5 = 2:30 PM
  endHour: number;
  detail: string;
}

export const CAL_EVENTS: CalEvent[] = [
  { id: 'e1', title: 'Physics Quiz 2',     course: 'PHY',  day: 1, startHour: 14,   endHour: 15,   detail: 'Quiz in ECSS 2.312. Bring pencil & eraser. Covers Ch 3–5. No late arrivals admitted.' },
  { id: 'e2', title: 'CS Proj Meeting',    course: 'CS',   day: 3, startHour: 15,   endHour: 16.5, detail: 'Team sync in ECS 1.204. Review sprint deliverables and merge conflicts. Standup format.' },
  { id: 'e3', title: 'Study: Math',        course: 'SELF', day: 3, startHour: 17,   endHour: 18,   detail: 'Personal study block — integration techniques. Quiet room in library.' },
  { id: 'e4', title: 'Physics Lab',        course: 'PHY',  day: 3, startHour: 19,   endHour: 20.5, detail: 'Lab 6: Projectile Motion. Bring lab notebook. Pre-lab quiz at start of session.' },
  { id: 'e5', title: 'Calculus Exam 2',    course: 'MATH', day: 4, startHour: 10,   endHour: 11.5, detail: 'Exam in GR 2.302. Closed-book, 90 min. 4 formula sheets allowed. Arrive 10 min early.' },
  { id: 'e6', title: 'History Essay Due',  course: 'HIST', day: 5, startHour: 14,   endHour: 14.5, detail: 'Submit via Canvas by 2:00 PM. No late submissions accepted without dean approval.' },
  { id: 'e7', title: 'Study: Finals Prep', course: 'SELF', day: 6, startHour: 10,   endHour: 12.5, detail: 'Library Room 204. Finals prep — all subjects. Bring notes, past exams, and highlighters.' },
];

export function addCalendarEvent(ev: Omit<CalEvent, 'id'>) {
  const newId = `ev_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  CAL_EVENTS.push({ ...ev, id: newId });
}

// ─── AI Responses ─────────────────────────────────────────────────────────────

export const AI_REPLIES: Record<string, string> = {
  "What's my next most urgent task?":
    "Your most urgent tasks right now:\n\n🔴 Physics HW 4 — Due TODAY at 11:59 PM\n🔴 Calculus Problem Set 6 — OVERDUE (was due yesterday)\n🔴 History Essay Draft — OVERDUE (was due March 7)\n\nI recommend tackling Physics HW 4 first since the deadline is tonight!",

  "Generate a study plan for my upcoming exams.":
    "Here's your optimized study plan:\n\n📅 Today (Mon Mar 9)\n• 2 hrs: Physics HW 4 (due TONIGHT)\n\n📅 Tue Mar 10\n• 1.5 hrs: Physics Quiz 2 review (Ch 3–5)\n\n📅 Wed Mar 11\n• 2 hrs: Calculus Exam prep (integration)\n\n📅 Thu Mar 12\n• ✅ Physics Quiz 2 at 2:00 PM\n• 2 hrs: More Calculus practice\n\n📅 Fri–Sat\n• 3 hrs/day: Calculus Exam 2 prep\n\n📅 Sun Mar 14\n• 🛌 Rest — Calculus Exam tomorrow!",

  "Calculate what grade I need on the final to get an A in CS 3354.":
    "Let me crunch those numbers!\n\nAssuming current grades:\n• Project 1 (20%): 88 pts → 17.6\n• Project 2 (30%): ~85 pts (est.) → 25.5\n\nFor overall 90% (A):\n📊 You'd need 83.3% on the Final Exam (50%)\n\nThat's very achievable! Want me to break down the CS 3354 final exam topics so you can study more effectively?",

  "Give me exam tips for Physics Quiz 2 covering Chapters 3–5.":
    "Top tips for Physics Quiz 2:\n\n⚡ Ch 3 — Kinematics\n• Memorize the 4 kinematic equations\n• Always draw motion diagrams first\n\n⚡ Ch 4 — Newton's Laws\n• Draw free-body diagrams for every problem\n• ΣF = ma — always identify all forces\n\n⚡ Ch 5 — Work & Energy\n• W = Fd·cosθ (don't forget the angle!)\n• Use conservation of energy to save time\n\n⏰ You have 3 days — 1 focused hour per chapter is all you need!",

  "List all my upcoming due dates sorted by urgency.":
    "All deadlines, most urgent first:\n\n🔴 OVERDUE — Physics HW 4 (TODAY)\n🔴 OVERDUE — Calculus Problem Set 6\n🔴 OVERDUE — History Essay Draft\n──────────────────────\n⚠️  Mar 12, 2:00 PM — Physics Quiz 2\n⚠️  Mar 14, 10:00 AM — Calculus Exam 2\n⏳ Mar 15, 3:00 PM — Study Session\n⏳ Mar 17, 11:59 PM — CS 3354 Project\n\n3 items are already overdue — tackle those first!",
};

// ─── Prompt Chips ─────────────────────────────────────────────────────────────

export const PROMPT_CHIPS = [
  { label: "📋 What's next?",    color: '#3B82F6', msg: "What's my next most urgent task?" },
  { label: '📚 Study Plan',       color: '#22C55E', msg: 'Generate a study plan for my upcoming exams.' },
  { label: '🧮 Grade Calc',       color: '#A855F7', msg: 'Calculate what grade I need on the final to get an A in CS 3354.' },
  { label: '💡 Exam Tips',        color: '#F97316', msg: 'Give me exam tips for Physics Quiz 2 covering Chapters 3–5.' },
  { label: '📅 Due Dates',        color: '#DC2626', msg: 'List all my upcoming due dates sorted by urgency.' },
];

// ─── Calendar helpers ─────────────────────────────────────────────────────────

export const WEEK_DAYS  = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
export const WEEK_DATES = [9, 10, 11, 12, 13, 14, 15];
export const HOURS      = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
export const HOUR_LABELS = ['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM'];

export function formatHour(h: number): string {
  const hh   = Math.floor(h);
  const mm   = h % 1 === 0.5 ? '30' : '00';
  const ampm = hh < 12 ? 'AM' : 'PM';
  const disp = hh > 12 ? hh - 12 : hh;
  return `${disp}:${mm} ${ampm}`;
}

export function daysColor(label?: string): object {
  const n = parseInt(label ?? '99', 10);
  if (n <= 3) return { backgroundColor: '#FEE2E2' };
  if (n <= 5) return { backgroundColor: '#DBEAFE' };
  return { backgroundColor: '#DCFCE7' };
}

export function nowTime(): string {
  const d    = new Date();
  const h    = d.getHours();
  const m    = String(d.getMinutes()).padStart(2, '0');
  const ampm = h < 12 ? 'AM' : 'PM';
  const disp = h > 12 ? h - 12 : h;
  return `${disp}:${m} ${ampm}`;
}
