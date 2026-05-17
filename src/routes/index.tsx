import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, MapPin, UserPlus, Bike, Zap, Shield, type LucideIcon } from "lucide-react";
import Hyperspeed from "@/components/Hyperspeed";
import { ThemeToggle, useTheme } from "@/components/ThemeToggle";
import { api, type Content } from "@/lib/api";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ride Share — Move smarter, ride faster" },
      { name: "description", content: "Download the Ride Share APK. Book rides in seconds with a sleek, lightning-fast Android app." },
      { property: "og:title", content: "Ride Share — Move smarter, ride faster" },
      { property: "og:description", content: "Download the Ride Share APK and start booking in seconds." },
    ],
  }),
  component: LandingPage,
});

const ICON_MAP: Record<string, LucideIcon> = { Download, MapPin, UserPlus, Bike, Zap, Shield };

function LandingPage() {
  const [content, setContent] = useState<Content | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    api.trackPageView();
    setContent(api.getContent());
  }, []);

  const hyperOptions = useMemo(
    () =>
      theme === "dark"
        ? {
            distortion: "turbulentDistortion",
            colors: {
              roadColor: 0x0a1a10,
              islandColor: 0x081208,
              background: 0x000000,
              shoulderLines: 0x1a3a22,
              brokenLines: 0x1a3a22,
              leftCars: [0x16a34a, 0x22c55e, 0x15803d],
              rightCars: [0x84cc16, 0xa3e635, 0x65a30d],
              sticks: 0x22c55e,
            },
          }
        : {
            distortion: "turbulentDistortion",
            colors: {
              roadColor: 0xe5f5ea,
              islandColor: 0xdaf0e0,
              background: 0xffffff,
              shoulderLines: 0xbfead0,
              brokenLines: 0xbfead0,
              leftCars: [0x16a34a, 0x10b981, 0x059669],
              rightCars: [0x65a30d, 0x84cc16, 0x4ade80],
              sticks: 0x16a34a,
            },
          },
    [theme]
  );

  const handleDownload = () => {
    api.trackDownload();
    const url = content?.apkUrl;
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = content?.apkName || "rideshare.apk";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      alert("APK isn't available yet. Please check back soon.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-60 dark:opacity-90">
        <Hyperspeed effectOptions={hyperOptions} />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />

      {/* Header */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Ride Share logo" className="h-10 w-10 rounded-xl shadow-lg shadow-primary/20" />
          <span className="text-lg font-bold tracking-tight">Ride Share</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-24 text-center sm:pt-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur">
          <Zap className="h-3.5 w-3.5" /> New build available
        </div>
        <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
          Move smarter.{" "}
          <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Ride faster.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Ride Share is the easiest way to book a ride on Android. Lightweight, lightning fast, and built for your city.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={handleDownload}
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-[1.03] hover:bg-primary-glow hover:shadow-primary/50 active:scale-95"
          >
            <Download className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
            Download APK
          </button>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-6 py-4 text-base font-medium backdrop-blur transition-all hover:border-primary hover:text-primary"
          >
            See how it works
          </a>
        </div>
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> Safe & secure</span>
          <span className="inline-flex items-center gap-1.5"><Bike className="h-3.5 w-3.5 text-primary" /> Free to download</span>
          <span className="hidden sm:inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Lightweight APK</span>
        </div>
      </section>

      {/* Video */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">See it in action</h2>
          <p className="mt-2 text-muted-foreground">A quick tour of Ride Share.</p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/80 shadow-2xl shadow-primary/10 backdrop-blur">
          <div className="aspect-video">
            {content?.videoUrl ? (
              <iframe
                src={content.videoUrl}
                title="Ride Share tutorial"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">No video yet.</div>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 mx-auto max-w-6xl px-6 pb-32">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
          <p className="mt-2 text-muted-foreground">Three steps from download to destination.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {content?.steps.map((s, i) => {
            const Icon = ICON_MAP[s.icon] ?? Bike;
            return (
              <div
                key={s.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/80 p-6 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="absolute right-4 top-4 text-5xl font-bold text-primary/10">{i + 1}</div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Ride Share
      </footer>
    </div>
  );
}
