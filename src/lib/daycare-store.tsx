import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Child = {
  id: string;
  name: string;
  age: number;
  parent: string;
  allergies?: string;
  emoji: string;
  color: "peach" | "sage" | "sky" | "butter";
};

export type AttendanceStatus = "present" | "absent" | "late";

export type Activity = {
  id: string;
  childId: string;
  date: string; // ISO
  title: string;
  description?: string;
};

export type Note = {
  id: string;
  childId: string;
  date: string;
  body: string;
};

export type Photo = {
  id: string;
  childId: string;
  date: string;
  dataUrl: string;
  caption?: string;
};

export type Meal = {
  id: string;
  childId: string;
  date: string;
  type: "breakfast" | "lunch" | "snack";
  what: string;
  amount: "all" | "most" | "some" | "none";
};

export type Nap = {
  id: string;
  childId: string;
  date: string;
  start: string;
  end: string;
};

export type Attendance = {
  childId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
};

export type MoodValue = "happy" | "calm" | "tired" | "fussy" | "sad";

export type Mood = {
  childId: string;
  date: string; // YYYY-MM-DD
  value: MoodValue;
  note?: string;
};

export const MOOD_META: Record<MoodValue, { label: string; emoji: string; tone: string }> = {
  happy: { label: "Happy", emoji: "😄", tone: "bg-butter" },
  calm: { label: "Calm", emoji: "😊", tone: "bg-sage" },
  tired: { label: "Tired", emoji: "😴", tone: "bg-sky" },
  fussy: { label: "Fussy", emoji: "😣", tone: "bg-peach" },
  sad: { label: "Sad", emoji: "😢", tone: "bg-muted" },
};

export type Announcement = {
  id: string;
  date: string; // ISO
  title: string;
  body: string;
};

export type MenuDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
export const MENU_DAYS: MenuDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export type MenuEntry = {
  day: MenuDay;
  breakfast: string;
  lunch: string;
  snack: string;
};

type State = {
  children: Child[];
  attendance: Attendance[];
  activities: Activity[];
  notes: Note[];
  photos: Photo[];
  meals: Meal[];
  naps: Nap[];
  moods: Mood[];
  announcements: Announcement[];
  menu: MenuEntry[];
};

const today = () => new Date().toISOString().slice(0, 10);

const initialState: State = {
  children: [
    { id: "c1", name: "Mia Carter", age: 3, parent: "Sarah Carter", allergies: "Peanuts", emoji: "🌸", color: "peach" },
    { id: "c2", name: "Liam Park", age: 4, parent: "Jenny Park", emoji: "🦊", color: "sage" },
    { id: "c3", name: "Sofia Reyes", age: 2, parent: "Marco Reyes", emoji: "🐻", color: "sky" },
    { id: "c4", name: "Noah Kim", age: 3, parent: "Lina Kim", allergies: "Dairy", emoji: "⭐", color: "butter" },
  ],
  attendance: [
    { childId: "c1", date: today(), status: "present" },
    { childId: "c2", date: today(), status: "present" },
    { childId: "c3", date: today(), status: "late" },
  ],
  activities: [
    { id: "a1", childId: "c1", date: new Date().toISOString(), title: "Finger painting", description: "Painted a rainbow with her hands!" },
  ],
  notes: [
    { id: "n1", childId: "c1", date: new Date().toISOString(), body: "Mia had a wonderful morning. Shared snacks with Liam!" },
  ],
  photos: [],
  meals: [
    { id: "m1", childId: "c1", date: new Date().toISOString(), type: "lunch", what: "Pasta & veggies", amount: "most" },
  ],
  naps: [
    { id: "z1", childId: "c1", date: today(), start: "12:30", end: "14:00" },
  ],
  moods: [
    { childId: "c1", date: today(), value: "happy" },
    { childId: "c2", date: today(), value: "calm" },
  ],
  announcements: [
    { id: "an1", date: new Date().toISOString(), title: "Picture day on Friday 📸", body: "Please dress your little one in their favourite outfit. Smiles encouraged!" },
  ],
  menu: [
    { day: "Mon", breakfast: "Oatmeal & berries", lunch: "Chicken & rice", snack: "Apple slices" },
    { day: "Tue", breakfast: "Yogurt parfait", lunch: "Pasta primavera", snack: "Carrot sticks" },
    { day: "Wed", breakfast: "Pancakes", lunch: "Fish & potatoes", snack: "Cheese cubes" },
    { day: "Thu", breakfast: "Toast & eggs", lunch: "Veggie soup", snack: "Banana muffin" },
    { day: "Fri", breakfast: "Fruit bowl", lunch: "Mini pizzas", snack: "Popcorn" },
  ],
};

type Ctx = {
  state: State;
  addChild: (c: Omit<Child, "id">) => void;
  setAttendance: (childId: string, status: AttendanceStatus) => void;
  getAttendance: (childId: string) => AttendanceStatus | undefined;
  addActivity: (a: Omit<Activity, "id" | "date">) => void;
  addNote: (n: Omit<Note, "id" | "date">) => void;
  addPhoto: (p: Omit<Photo, "id" | "date">) => void;
  addMeal: (m: Omit<Meal, "id" | "date">) => void;
  addNap: (n: Omit<Nap, "id" | "date">) => void;
  setMood: (childId: string, value: MoodValue, note?: string) => void;
  getMood: (childId: string) => Mood | undefined;
  addAnnouncement: (a: Omit<Announcement, "id" | "date">) => void;
  removeAnnouncement: (id: string) => void;
  updateMenu: (day: MenuDay, patch: Partial<Omit<MenuEntry, "day">>) => void;
};

const DaycareCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "little-stars-daycare-v2";

export function DaycareProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => {
    if (typeof window === "undefined") return initialState;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return initialState;
      const parsed = JSON.parse(raw) as Partial<State>;
      // Merge to ensure new keys exist for older stored data
      return { ...initialState, ...parsed };
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  const id = () => Math.random().toString(36).slice(2, 10);
  const now = () => new Date().toISOString();

  const value: Ctx = {
    state,
    addChild: (c) => setState((s) => ({ ...s, children: [...s.children, { ...c, id: id() }] })),
    setAttendance: (childId, status) =>
      setState((s) => {
        const d = today();
        const others = s.attendance.filter((a) => !(a.childId === childId && a.date === d));
        return { ...s, attendance: [...others, { childId, date: d, status }] };
      }),
    getAttendance: (childId) => state.attendance.find((a) => a.childId === childId && a.date === today())?.status,
    addActivity: (a) => setState((s) => ({ ...s, activities: [{ ...a, id: id(), date: now() }, ...s.activities] })),
    addNote: (n) => setState((s) => ({ ...s, notes: [{ ...n, id: id(), date: now() }, ...s.notes] })),
    addPhoto: (p) => setState((s) => ({ ...s, photos: [{ ...p, id: id(), date: now() }, ...s.photos] })),
    addMeal: (m) => setState((s) => ({ ...s, meals: [{ ...m, id: id(), date: now() }, ...s.meals] })),
    addNap: (n) => setState((s) => ({ ...s, naps: [{ ...n, id: id(), date: now() }, ...s.naps] })),
    setMood: (childId, val, note) =>
      setState((s) => {
        const d = today();
        const others = s.moods.filter((m) => !(m.childId === childId && m.date === d));
        return { ...s, moods: [...others, { childId, date: d, value: val, note }] };
      }),
    getMood: (childId) => state.moods.find((m) => m.childId === childId && m.date === today()),
    addAnnouncement: (a) =>
      setState((s) => ({ ...s, announcements: [{ ...a, id: id(), date: now() }, ...s.announcements] })),
    removeAnnouncement: (rid) =>
      setState((s) => ({ ...s, announcements: s.announcements.filter((a) => a.id !== rid) })),
    updateMenu: (day, patch) =>
      setState((s) => ({
        ...s,
        menu: s.menu.map((m) => (m.day === day ? { ...m, ...patch } : m)),
      })),
  };

  return <DaycareCtx.Provider value={value}>{children}</DaycareCtx.Provider>;
}

export function useDaycare() {
  const ctx = useContext(DaycareCtx);
  if (!ctx) throw new Error("useDaycare must be used inside DaycareProvider");
  return ctx;
}
