import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Sparkles, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { session, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const isAuthPage = path === "/login" || path === "/signup";

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
        <div className="flex items-center gap-3">
          {path !== "/" && !isAuthPage && session && (
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← All children
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {session && !isAuthPage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await signOut();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="h-4 w-4 mr-1" />
              Sign out
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
