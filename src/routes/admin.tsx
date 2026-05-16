import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Ride Share" }, { name: "robots", content: "noindex" }] }),
  component: AdminGate,
});

function AdminGate() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const ok = api.isAuthed();
    setAuthed(ok);
    setChecked(true);
    if (ok) navigate({ to: "/admin/dashboard" });
  }, [navigate]);

  if (!checked) return null;
  if (authed) return null;
  return <Login onSuccess={() => navigate({ to: "/admin/dashboard" })} />;
}

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (api.login(u, p)) onSuccess();
    else setErr("Invalid credentials.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute right-6 top-6 flex items-center gap-3">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <ThemeToggle />
      </div>
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl shadow-primary/5"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Admin sign in</h1>
            <p className="text-xs text-muted-foreground">Restricted access</p>
          </div>
        </div>
        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Username</span>
          <input
            value={u}
            onChange={(e) => setU(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
            autoComplete="username"
            required
          />
        </label>
        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Password</span>
          <input
            type="password"
            value={p}
            onChange={(e) => setP(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
            autoComplete="current-password"
            required
          />
        </label>
        {err && <p className="mb-3 text-xs text-destructive">{err}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-glow active:scale-[0.98]"
        >
          Sign in
        </button>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Default: admin / admin123
        </p>
      </form>
    </div>
  );
}
