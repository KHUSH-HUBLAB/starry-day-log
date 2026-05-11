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

type State = {
  children: Child[];
  attendance: Attendance[];
  activities: Activity[];
  notes: Note[];
  photos: Photo[];
  meals: Meal[];
  naps: Nap[];
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
};

const DaycareCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "little-stars-daycare-v1";

export function DaycareProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => {
    if (typeof window === "undefined") return initialState;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as State) : initialState;
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
  };

  return <DaycareCtx.Provider value={value}>{children}</DaycareCtx.Provider>;
}

export function useDaycare() {
  const ctx = useContext(DaycareCtx);
  if (!ctx) throw new Error("useDaycare must be used inside DaycareProvider");
  return ctx;
}
