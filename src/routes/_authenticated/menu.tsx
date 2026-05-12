import { createFileRoute } from "@tanstack/react-router";
import { useDaycare, MENU_DAYS, type MenuDay } from "@/lib/daycare-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UtensilsCrossed } from "lucide-react";

export const Route = createFileRoute("/_authenticated/menu")({
  head: () => ({ meta: [{ title: "Weekly menu · Little Stars" }] }),
  component: MenuPage,
});

const dayNames: Record<MenuDay, string> = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday",
};

function MenuPage() {
  const { state, updateMenu } = useDaycare();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <h1 className="font-display text-3xl flex items-center gap-2"><UtensilsCrossed className="h-6 w-6 text-primary" /> Weekly menu</h1>
      <p className="text-sm text-muted-foreground mt-1">Plan breakfast, lunch and snack for each day. Changes save automatically.</p>

      <div className="mt-6 space-y-3">
        {MENU_DAYS.map((day) => {
          const entry = state.menu.find((m) => m.day === day);
          if (!entry) return null;
          return (
            <div key={day} className="rounded-2xl border border-border bg-card p-4">
              <div className="font-display text-lg mb-2">{dayNames[day]}</div>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Breakfast" value={entry.breakfast} onChange={(v) => updateMenu(day, { breakfast: v })} />
                <Field label="Lunch" value={entry.lunch} onChange={(v) => updateMenu(day, { lunch: v })} />
                <Field label="Snack" value={entry.snack} onChange={(v) => updateMenu(day, { snack: v })} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input className="mt-1" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
