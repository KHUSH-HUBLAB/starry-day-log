import { createFileRoute, Link } from "@tanstack/react-router";
import { useDaycare, MOOD_META } from "@/lib/daycare-store";
import { ChildCard } from "@/components/ChildCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Users, CalendarCheck, Camera, Megaphone, Sparkles, UtensilsCrossed, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-daycare.jpg";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Little Stars Daycare Manager" },
      { name: "description", content: "A warm, mobile-friendly app for educators to manage children, attendance, activities, photos, meals and naps." },
    ],
  }),
  component: Index,
});

function Index() {
  const { state, addChild } = useDaycare();
  const [open, setOpen] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const present = state.attendance.filter((a) => a.date === today && a.status === "present").length;
  const photosToday = state.photos.length;
  const todaysActivities = state.activities
    .filter((a) => a.date.slice(0, 10) === today)
    .slice(0, 6);
  const childById = (id: string) => state.children.find((c) => c.id === id);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="grid md:grid-cols-2 items-center">
          <div className="p-6 md:p-8">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Today, {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
            <h1 className="mt-1 text-3xl md:text-4xl font-display">Good morning, Educator ✨</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              {state.children.length} little stars in your care. Take a deep breath — today's going to be lovely.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <AddChildDialog open={open} setOpen={setOpen} onAdd={addChild} />
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/menu"><UtensilsCrossed className="h-4 w-4" /> Weekly menu</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/announcements"><Megaphone className="h-4 w-4" /> Announcements</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-48 md:h-full">
            <img src={heroImg} alt="Children playing in a sunny daycare garden" width={1280} height={800} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat icon={<Users className="h-4 w-4" />} label="Enrolled" value={state.children.length} tone="peach" />
        <Stat icon={<CalendarCheck className="h-4 w-4" />} label="Present today" value={present} tone="sage" />
        <Stat icon={<Camera className="h-4 w-4" />} label="Photos shared" value={photosToday} tone="sky" />
      </section>

      {/* Daily Activity Feed */}
      <section className="mt-8">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-xl font-display flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Today's activity feed</h2>
          <span className="text-xs text-muted-foreground">{todaysActivities.length} updates</span>
        </div>
        {todaysActivities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
            No activities logged yet today. Open a child's profile to share what they're up to.
          </div>
        ) : (
          <ul className="space-y-2">
            {todaysActivities.map((a) => {
              const c = childById(a.childId);
              return (
                <li key={a.id} className="rounded-2xl border border-border bg-card p-3 flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-2xl grid place-items-center text-lg shrink-0 bg-${c?.color ?? "muted"}/60`}>
                    {c?.emoji ?? "✨"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">
                      <span className="font-medium">{c?.name ?? "A child"}</span>{" "}
                      <span className="text-muted-foreground">— {a.title}</span>
                    </div>
                    {a.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.description}</div>}
                    <div className="text-[11px] text-muted-foreground mt-1">{new Date(a.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Mood snapshot */}
      <section className="mt-8">
        <h2 className="text-xl font-display mb-3">Mood snapshot</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {state.children.map((c) => {
            const m = state.moods.find((mm) => mm.childId === c.id && mm.date === today);
            const meta = m ? MOOD_META[m.value] : null;
            return (
              <Link key={c.id} to="/children/$childId" params={{ childId: c.id }} className={`rounded-2xl border border-border p-3 ${meta ? meta.tone + "/60" : "bg-card"}`}>
                <div className="text-2xl">{meta?.emoji ?? "❔"}</div>
                <div className="text-sm font-medium mt-1 truncate">{c.name.split(" ")[0]}</div>
                <div className="text-[11px] text-muted-foreground">{meta?.label ?? "Not logged"}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Latest announcement preview */}
      {state.announcements[0] && (
        <section className="mt-8">
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-xl font-display flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" /> Latest announcement</h2>
            <Link to="/announcements" className="text-xs text-primary inline-flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="rounded-2xl border border-border bg-butter/40 p-4">
            <div className="font-medium">{state.announcements[0].title}</div>
            <div className="text-sm text-muted-foreground mt-1">{state.announcements[0].body}</div>
          </div>
        </section>
      )}

      {/* Children */}
      <section className="mt-8">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-xl font-display">Children</h2>
          <span className="text-xs text-muted-foreground">Tap a card to open</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {state.children.map((c) => (
            <ChildCard key={c.id} child={c} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "peach" | "sage" | "sky" }) {
  const toneMap = { peach: "bg-peach/60", sage: "bg-sage/60", sky: "bg-sky/60" };
  return (
    <div className={`rounded-2xl border border-border ${toneMap[tone]} p-3`}>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-foreground/70">
        {icon} {label}
      </div>
      <div className="mt-1 font-display text-2xl">{value}</div>
    </div>
  );
}

function AddChildDialog({ open, setOpen, onAdd }: { open: boolean; setOpen: (b: boolean) => void; onAdd: (c: { name: string; age: number; parent: string; emoji: string; color: "peach" | "sage" | "sky" | "butter" }) => void }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("3");
  const [parent, setParent] = useState("");
  const emojis = ["🌸", "🦊", "🐻", "⭐", "🦄", "🐝", "🦖", "🌈"];
  const colors = ["peach", "sage", "sky", "butter"] as const;
  const [emoji, setEmoji] = useState(emojis[0]);
  const [color, setColor] = useState<typeof colors[number]>("peach");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full">
          <Plus className="h-4 w-4" /> Add child
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Welcome a new little star</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="First and last name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Age</Label>
              <Input type="number" min={0} max={12} value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div>
              <Label>Parent</Label>
              <Input value={parent} onChange={(e) => setParent(e.target.value)} placeholder="Parent name" />
            </div>
          </div>
          <div>
            <Label>Emoji</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {emojis.map((e) => (
                <button key={e} type="button" onClick={() => setEmoji(e)} className={`h-9 w-9 rounded-xl text-lg ${emoji === e ? "ring-2 ring-primary" : "bg-muted"}`}>{e}</button>
              ))}
            </div>
          </div>
          <div>
            <Label>Color</Label>
            <div className="flex gap-2 mt-1">
              {colors.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} className={`h-8 w-8 rounded-full bg-${c} ${color === c ? "ring-2 ring-foreground" : ""}`} aria-label={c} />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!name.trim()}
            onClick={() => {
              onAdd({ name: name.trim(), age: Number(age) || 0, parent: parent.trim(), emoji, color });
              setName(""); setParent(""); setAge("3"); setOpen(false);
            }}
          >
            Add child
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
