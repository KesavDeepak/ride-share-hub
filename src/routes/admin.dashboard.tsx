import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Save, Upload, Plus, Trash2, Eye, Download as DownloadIcon, Check, AlertCircle } from "lucide-react";
import { api, type Content, type Analytics, type Step } from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Ride Share Admin" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

type Toast = { kind: "ok" | "err"; msg: string } | null;
const DEFAULT_ANALYTICS: Analytics = { pageViews: 0, downloads: 0, history: [] };

function Dashboard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [content, setContent] = useState<Content | null>(null);
  const [analytics, setAnalytics] = useState<Analytics>(DEFAULT_ANALYTICS);
  const [toast, setToast] = useState<Toast>(null);
  const [apkUrlInput, setApkUrlInput] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!api.isAuthed()) {
      navigate({ to: "/admin" });
      return;
    }
    const currentContent = api.getContent();
    setContent(currentContent);
    setAnalytics(api.getAnalytics());
    setApkUrlInput(currentContent.apkUrl && !currentContent.apkUrl.startsWith("data:") ? currentContent.apkUrl : "");
    setReady(true);
  }, [navigate]);

  const showToast = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3000);
  };

  const saveContent = (c: Content) => {
    api.saveContent(c);
    setContent({ ...c });
    showToast({ kind: "ok", msg: "Saved successfully." });
  };

  const onVideoUpload = (file: File) => {
    if (!content) return;
    const reader = new FileReader();
    reader.onload = () => {
      saveContent({ ...content, videoUrl: reader.result as string });
    };
    reader.onerror = () => showToast({ kind: "err", msg: "Failed to read video." });
    reader.readAsDataURL(file);
  };

  const onApkUpload = (file: File) => {
    if (!content) return;
    if (file.size > 80 * 1024 * 1024) {
      showToast({ kind: "err", msg: "APK exceeds 80MB demo limit. Use a Drive/Dropbox link instead." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      saveContent({ ...content, apkUrl: reader.result as string, apkName: file.name });
      setApkUrlInput("");
    };
    reader.onerror = () => showToast({ kind: "err", msg: "Failed to read APK." });
    reader.readAsDataURL(file);
  };

  const saveApkUrl = () => {
    if (!content) return;
    if (!apkUrlInput.trim()) {
      showToast({ kind: "err", msg: "Please provide an APK URL." });
      return;
    }
    const url = apkUrlInput.trim();
    const apkNameFromUrl = url.split("/").pop()?.split("?")[0] || content.apkName || "rideshare.apk";
    saveContent({ ...content, apkUrl: url, apkName: apkNameFromUrl });
  };

  if (!ready || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-primary/5 text-center text-sm text-muted-foreground">
          Loading admin dashboard…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px] shadow-primary" />
            <h1 className="text-lg font-bold">Ride Share Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">View site</Link>
            <ThemeToggle />
            <button
              onClick={() => { api.logout(); navigate({ to: "/admin" }); }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-primary hover:text-primary"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        {/* Analytics */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Analytics</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard icon={Eye} label="Total page views" value={analytics.pageViews} />
            <MetricCard icon={DownloadIcon} label="Total APK downloads" value={analytics.downloads} />
          </div>
          <div className="mt-6 rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Last 30 days</h3>
                <p className="text-xs text-muted-foreground">Page views and APK downloads over time</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" /> Views
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary-glow" /> Downloads
                </span>
              </div>
            </div>
            <AnalyticsChart history={analytics.history} />
          </div>
        </section>

        {/* Tutorial video */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-1 text-base font-semibold">Tutorial video</h3>
          <p className="mb-4 text-xs text-muted-foreground">Paste an embed URL (YouTube /embed/...) or upload a file.</p>
          <input
            value={content.videoUrl}
            onChange={(e) => setContent({ ...content, videoUrl: e.target.value })}
            placeholder="https://www.youtube.com/embed/..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => saveContent(content)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-glow active:scale-95"
            >
              <Save className="h-4 w-4" /> Save URL
            </button>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm hover:border-primary hover:text-primary">
              <Upload className="h-4 w-4" /> Upload file
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onVideoUpload(e.target.files[0])}
              />
            </label>
          </div>
        </section>

        {/* Steps editor */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold">"How It Works" steps</h3>
            <button
              onClick={() => {
                const next = [...content.steps, { id: crypto.randomUUID(), title: "New step", description: "", icon: "Bike" } as Step];
                setContent({ ...content, steps: next });
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs hover:border-primary hover:text-primary"
            >
              <Plus className="h-3.5 w-3.5" /> Add step
            </button>
          </div>
          <div className="space-y-3">
            {content.steps.map((s, i) => (
              <div key={s.id} className="rounded-lg border border-border bg-background p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Step {i + 1}</span>
                  <button
                    onClick={() => setContent({ ...content, steps: content.steps.filter((x) => x.id !== s.id) })}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Delete step"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_140px]">
                  <input
                    value={s.title}
                    onChange={(e) => {
                      const steps = content.steps.map((x) => x.id === s.id ? { ...x, title: e.target.value } : x);
                      setContent({ ...content, steps });
                    }}
                    placeholder="Title"
                    className="rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    value={s.description}
                    onChange={(e) => {
                      const steps = content.steps.map((x) => x.id === s.id ? { ...x, description: e.target.value } : x);
                      setContent({ ...content, steps });
                    }}
                    placeholder="Description"
                    className="rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <select
                    value={s.icon}
                    onChange={(e) => {
                      const steps = content.steps.map((x) => x.id === s.id ? { ...x, icon: e.target.value } : x);
                      setContent({ ...content, steps });
                    }}
                    className="rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    {["Download","MapPin","UserPlus","Bike","Zap","Shield"].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => saveContent(content)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-glow active:scale-95"
          >
            <Save className="h-4 w-4" /> Save steps
          </button>
        </section>

        {/* APK upload */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-1 text-base font-semibold">APK file</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Current: {content.apkUrl ? <span className="text-primary">{content.apkName}</span> : <span className="text-muted-foreground">none</span>}
          </p>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) onApkUpload(file);
            }}
            className="group relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background px-5 py-10 text-sm text-center transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
          >
            <Upload className="mb-3 h-5 w-5 text-primary" />
            <span className="font-semibold">Drop APK here or click to upload</span>
            <span className="mt-1 text-xs text-muted-foreground">Only .apk files are accepted.</span>
            <input
              type="file"
              accept=".apk,application/vnd.android.package-archive"
              className="sr-only"
              onChange={(e) => e.target.files?.[0] && onApkUpload(e.target.files[0])}
            />
          </label>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              type="url"
              value={apkUrlInput}
              onChange={(e) => setApkUrlInput(e.target.value)}
              placeholder="https://drive.google.com/your-apk-link"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={saveApkUrl}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-glow active:scale-95"
            >
              Save APK URL
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Tip: paste a public APK URL from Google Drive, Dropbox, or another host.</p>
        </section>
      </main>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-xl backdrop-blur ${
            toast.kind === "ok"
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {toast.kind === "ok" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function AnalyticsChart({ history }: { history: { date: string; views: number; downloads: number }[] }) {
  if (history.length === 0) {
    return <p className="text-center text-sm text-muted-foreground">No activity yet — visit the landing page to generate data.</p>;
  }

  const width = 680;
  const height = 220;
  const padding = 40;
  const maxValue = Math.max(...history.map((item) => Math.max(item.views, item.downloads)), 1);
  const points = history.map((item, index) => {
    const x = padding + (index / Math.max(history.length - 1, 1)) * (width - padding * 2);
    const yViews = height - padding - (item.views / maxValue) * (height - padding * 2);
    const yDownloads = height - padding - (item.downloads / maxValue) * (height - padding * 2);
    return { ...item, x, yViews, yDownloads };
  });

  const viewsPath = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.yViews}`).join(" ");
  const downloadsPath = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.yDownloads}`).join(" ");

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <g opacity="0.4" stroke="currentColor" strokeWidth="1">
          {[0, 1, 2, 3].map((line) => (
            <line
              key={line}
              x1={padding}
              x2={width - padding}
              y1={padding + ((height - padding * 2) / 3) * line}
              y2={padding + ((height - padding * 2) / 3) * line}
            />
          ))}
        </g>
        <path d={viewsPath} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
        <path d={downloadsPath} fill="none" stroke="var(--primary-glow)" strokeWidth="2" strokeLinecap="round" />
        {points.map((point) => (
          <circle key={`views-${point.date}`} cx={point.x} cy={point.yViews} r="3" fill="var(--primary)" />
        ))}
        {points.map((point) => (
          <circle key={`downloads-${point.date}`} cx={point.x} cy={point.yDownloads} r="3" fill="var(--primary-glow)" />
        ))}
        {points.map((point, idx) => (
          <text key={point.date} x={point.x} y={height - padding + 18} textAnchor="middle" fontSize="9" fill="currentColor">
            {idx === 0 || idx === history.length - 1 || history.length <= 5 ? point.date.slice(5) : ""}
          </text>
        ))}
      </svg>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold tabular-nums">{value.toLocaleString()}</div>
    </div>
  );
}
