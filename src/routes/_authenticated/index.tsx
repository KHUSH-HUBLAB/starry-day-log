import { createFileRoute, Link } from "@tanstack/react-router";
import { useDaycare } from "@/lib/daycare-store";
import { ChildCard } from "@/components/ChildCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Users, CalendarCheck, Camera } from "lucide-react";
import heroImg from "@/assets/hero-daycare.jpg";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Little Stars Daycare Manager" },
      { name: "description", content: "A warm, mobile-friendly app for educators to manage children, attendance, activities, photos, meals and naps." },
      { property: "og:title", content: "Little Stars Daycare Manager" },
      { property: "og:description", content: "Care for little ones, beautifully organized." },
    ],
  }),
  component: Index,
});

function Index() {
  const { state, addChild } = useDaycare();
  const [open, setOpen] = useState(false);

  const present = state.attendance.filter((a) => a.date === new Date().toISOString().slice(0, 10) && a.status === "present").length;
  const photosToday = state.photos.length;

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
                <Link to="/">
                  <CalendarCheck className="h-4 w-4" /> Mark attendance
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative h-48 md:h-full">
            <img
              src={heroImg}
              alt="Children playing in a sunny daycare garden"
              width={1280}
              height={800}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat icon={<Users className="h-4 w-4" />} label="Enrolled" value={state.children.length} tone="peach" />
        <Stat icon={<CalendarCheck className="h-4 w-4" />} label="Present today" value={present} tone="sage" />
        <Stat icon={<Camera className="h-4 w-4" />} label="Photos shared" value={photosToday} tone="sky" />
      </section>

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
