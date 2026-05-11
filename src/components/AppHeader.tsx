import { Link, useRouterState } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function AppHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-background/80 border-b border-border">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid place-items-center h-9 w-9 rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold">Little Stars</div>
            <div className="text-[11px] text-muted-foreground -mt-0.5">Daycare Manager</div>
          </div>
        </Link>
        {path !== "/" && (
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← All children
          </Link>
        )}
      </div>
    </header>
  );
}
