import { createFileRoute } from "@tanstack/react-router";
import { useDaycare } from "@/lib/daycare-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Megaphone, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/announcements")({
  head: () => ({ meta: [{ title: "Announcements · Little Stars" }] }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  const { state, addAnnouncement, removeAnnouncement } = useDaycare();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <h1 className="font-display text-3xl flex items-center gap-2"><Megaphone className="h-6 w-6 text-primary" /> Announcements</h1>
      <p className="text-sm text-muted-foreground mt-1">Share important updates with all parents.</p>

      <div className="mt-6 rounded-3xl border border-border bg-card p-4 space-y-3">
        <div>
          <Label className="text-xs">Title</Label>
          <Input className="mt-1" placeholder="e.g. Field trip on Thursday" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Message</Label>
          <Textarea className="mt-1" placeholder="What do parents need to know?" value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <Button
          className="rounded-full"
          disabled={!title.trim() || !body.trim()}
          onClick={() => {
            addAnnouncement({ title: title.trim(), body: body.trim() });
            setTitle(""); setBody("");
          }}
        >
          Post announcement
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {state.announcements.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">No announcements yet.</div>
        )}
        {state.announcements.map((a) => (
          <div key={a.id} className="rounded-2xl border border-border bg-butter/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium">{a.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{a.body}</div>
                <div className="text-[11px] text-muted-foreground mt-2">{new Date(a.date).toLocaleString()}</div>
              </div>
              <button
                onClick={() => removeAnnouncement(a.id)}
                className="text-muted-foreground hover:text-destructive p-1"
                aria-label="Remove announcement"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
