import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useDaycare, type AttendanceStatus } from "@/lib/daycare-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { Camera, Activity as ActivityIcon, NotebookPen, Utensils, Moon, Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/children/$childId")({
  component: ChildPage,
});

const colorMap = {
  peach: "bg-peach text-peach-foreground",
  sage: "bg-sage text-sage-foreground",
  sky: "bg-sky text-sky-foreground",
  butter: "bg-butter text-butter-foreground",
} as const;

function ChildPage() {
  const { childId } = Route.useParams();
  const { state, setAttendance, getAttendance, addActivity, addNote, addPhoto, addMeal, addNap } = useDaycare();
  const child = state.children.find((c) => c.id === childId);
  if (!child) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl">Child not found</h1>
        <Link to="/" className="text-primary underline mt-2 inline-block">Back home</Link>
      </div>
    );
  }

  const status = getAttendance(child.id);
  const activities = state.activities.filter((a) => a.childId === child.id);
  const notes = state.notes.filter((n) => n.childId === child.id);
  const photos = state.photos.filter((p) => p.childId === child.id);
  const meals = state.meals.filter((m) => m.childId === child.id);
  const naps = state.naps.filter((n) => n.childId === child.id);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      {/* Profile header */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm flex items-center gap-4">
        <div className={cn("h-20 w-20 rounded-3xl grid place-items-center text-4xl shrink-0", colorMap[child.color])}>
          {child.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl truncate">{child.name}</h1>
          <div className="text-sm text-muted-foreground">Age {child.age} · Parent: {child.parent}</div>
          {child.allergies && (
            <div className="mt-1 text-xs inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive px-2 py-0.5">
              ⚠ Allergy: {child.allergies}
            </div>
          )}
        </div>
      </div>

      {/* Attendance */}
      <div className="mt-4 rounded-3xl border border-border bg-card p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Attendance today</div>
        <div className="grid grid-cols-3 gap-2">
          <AttBtn current={status} value="present" onClick={() => setAttendance(child.id, "present")} icon={<Check className="h-4 w-4" />} label="Present" tone="bg-sage" />
          <AttBtn current={status} value="late" onClick={() => setAttendance(child.id, "late")} icon={<Clock className="h-4 w-4" />} label="Late" tone="bg-butter" />
          <AttBtn current={status} value="absent" onClick={() => setAttendance(child.id, "absent")} icon={<X className="h-4 w-4" />} label="Absent" tone="bg-peach" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activities" className="mt-4">
        <TabsList className="w-full grid grid-cols-5 rounded-2xl bg-muted p-1 h-auto">
          <TabsTrigger value="activities" className="rounded-xl flex-col py-2 gap-0.5"><ActivityIcon className="h-4 w-4" /><span className="text-[10px]">Activities</span></TabsTrigger>
          <TabsTrigger value="notes" className="rounded-xl flex-col py-2 gap-0.5"><NotebookPen className="h-4 w-4" /><span className="text-[10px]">Notes</span></TabsTrigger>
          <TabsTrigger value="photos" className="rounded-xl flex-col py-2 gap-0.5"><Camera className="h-4 w-4" /><span className="text-[10px]">Photos</span></TabsTrigger>
          <TabsTrigger value="meals" className="rounded-xl flex-col py-2 gap-0.5"><Utensils className="h-4 w-4" /><span className="text-[10px]">Meals</span></TabsTrigger>
          <TabsTrigger value="naps" className="rounded-xl flex-col py-2 gap-0.5"><Moon className="h-4 w-4" /><span className="text-[10px]">Naps</span></TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="mt-4 space-y-3">
          <ActivityForm onAdd={(title, description) => addActivity({ childId: child.id, title, description })} />
          {activities.length === 0 && <Empty text="No activities yet today." />}
          {activities.map((a) => (
            <Card key={a.id}>
              <div className="font-medium">{a.title}</div>
              {a.description && <div className="text-sm text-muted-foreground mt-0.5">{a.description}</div>}
              <Stamp date={a.date} />
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="notes" className="mt-4 space-y-3">
          <NoteForm onAdd={(body) => addNote({ childId: child.id, body })} />
          {notes.length === 0 && <Empty text="No notes for parents yet." />}
          {notes.map((n) => (
            <Card key={n.id} tone="sky">
              <div className="text-sm">{n.body}</div>
              <Stamp date={n.date} />
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="photos" className="mt-4 space-y-3">
          <PhotoForm onAdd={(dataUrl, caption) => addPhoto({ childId: child.id, dataUrl, caption })} />
          {photos.length === 0 && <Empty text="No photos shared yet." />}
          <div className="grid grid-cols-2 gap-3">
            {photos.map((p) => (
              <div key={p.id} className="rounded-2xl overflow-hidden border border-border bg-card">
                <img src={p.dataUrl} alt={p.caption || "Photo"} className="w-full aspect-square object-cover" />
                {p.caption && <div className="p-2 text-xs">{p.caption}</div>}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="meals" className="mt-4 space-y-3">
          <MealForm onAdd={(type, what, amount) => addMeal({ childId: child.id, type, what, amount })} />
          {meals.length === 0 && <Empty text="No meals logged today." />}
          {meals.map((m) => (
            <Card key={m.id} tone="butter">
              <div className="flex items-center justify-between">
                <div className="font-medium capitalize">{m.type} — {m.what}</div>
                <span className="text-xs rounded-full bg-background/60 px-2 py-0.5">Ate {m.amount}</span>
              </div>
              <Stamp date={m.date} />
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="naps" className="mt-4 space-y-3">
          <NapForm onAdd={(start, end) => addNap({ childId: child.id, start, end })} />
          {naps.length === 0 && <Empty text="No naps yet today." />}
          {naps.map((n) => (
            <Card key={n.id} tone="sage">
              <div className="font-medium">😴 {n.start} → {n.end}</div>
              <div className="text-xs text-muted-foreground">{n.date}</div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AttBtn({ current, value, onClick, icon, label, tone }: { current?: AttendanceStatus; value: AttendanceStatus; onClick: () => void; icon: React.ReactNode; label: string; tone: string }) {
  const active = current === value;
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-2xl py-3 text-sm font-medium border transition-all flex flex-col items-center gap-1",
        active ? `${tone} border-transparent shadow-sm scale-[1.02]` : "bg-background border-border hover:bg-muted",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function Card({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "sky" | "butter" | "sage" }) {
  const toneMap = { default: "bg-card", sky: "bg-sky/40", butter: "bg-butter/50", sage: "bg-sage/40" };
  return <div className={cn("rounded-2xl border border-border p-3", toneMap[tone])}>{children}</div>;
}

function Stamp({ date }: { date: string }) {
  return <div className="text-[11px] text-muted-foreground mt-1">{new Date(date).toLocaleString()}</div>;
}

function Empty({ text }: { text: string }) {
  return <div className="text-center text-sm text-muted-foreground py-6">{text}</div>;
}

function ActivityForm({ onAdd }: { onAdd: (title: string, description?: string) => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  return (
    <Card>
      <Label className="text-xs">New activity</Label>
      <Input className="mt-1" placeholder="e.g. Story time" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea className="mt-2" placeholder="Optional notes" value={desc} onChange={(e) => setDesc(e.target.value)} />
      <Button className="mt-2 rounded-full" disabled={!title.trim()} onClick={() => { onAdd(title.trim(), desc.trim() || undefined); setTitle(""); setDesc(""); }}>Add activity</Button>
    </Card>
  );
}

function NoteForm({ onAdd }: { onAdd: (body: string) => void }) {
  const [body, setBody] = useState("");
  return (
    <Card>
      <Label className="text-xs">Share a note with parents</Label>
      <Textarea className="mt-1" placeholder="What was special about today?" value={body} onChange={(e) => setBody(e.target.value)} />
      <Button className="mt-2 rounded-full" disabled={!body.trim()} onClick={() => { onAdd(body.trim()); setBody(""); }}>Share note</Button>
    </Card>
  );
}

function PhotoForm({ onAdd }: { onAdd: (dataUrl: string, caption?: string) => void }) {
  const [caption, setCaption] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handle = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      if (dataUrl) onAdd(dataUrl, caption.trim() || undefined);
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card>
      <Label className="text-xs">Upload a photo</Label>
      <Input className="mt-1" placeholder="Optional caption" value={caption} onChange={(e) => setCaption(e.target.value)} />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="mt-2 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary file:text-primary-foreground file:px-3 file:py-1.5"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }}
      />
    </Card>
  );
}

function MealForm({ onAdd }: { onAdd: (type: "breakfast" | "lunch" | "snack", what: string, amount: "all" | "most" | "some" | "none") => void }) {
  const [type, setType] = useState<"breakfast" | "lunch" | "snack">("lunch");
  const [what, setWhat] = useState("");
  const [amount, setAmount] = useState<"all" | "most" | "some" | "none">("most");
  return (
    <Card>
      <Label className="text-xs">Log a meal</Label>
      <div className="grid grid-cols-2 gap-2 mt-1">
        <Select value={type} onValueChange={(v) => setType(v as any)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="breakfast">Breakfast</SelectItem>
            <SelectItem value="lunch">Lunch</SelectItem>
            <SelectItem value="snack">Snack</SelectItem>
          </SelectContent>
        </Select>
        <Select value={amount} onValueChange={(v) => setAmount(v as any)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Ate all</SelectItem>
            <SelectItem value="most">Ate most</SelectItem>
            <SelectItem value="some">Ate some</SelectItem>
            <SelectItem value="none">Didn't eat</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Input className="mt-2" placeholder="What did they eat?" value={what} onChange={(e) => setWhat(e.target.value)} />
      <Button className="mt-2 rounded-full" disabled={!what.trim()} onClick={() => { onAdd(type, what.trim(), amount); setWhat(""); }}>Log meal</Button>
    </Card>
  );
}

function NapForm({ onAdd }: { onAdd: (start: string, end: string) => void }) {
  const [start, setStart] = useState("12:30");
  const [end, setEnd] = useState("14:00");
  return (
    <Card>
      <Label className="text-xs">Log a nap</Label>
      <div className="grid grid-cols-2 gap-2 mt-1">
        <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
      </div>
      <Button className="mt-2 rounded-full" onClick={() => onAdd(start, end)}>Log nap</Button>
    </Card>
  );
}
