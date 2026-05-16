// Lightweight localStorage-backed API. Swap implementations here to migrate
// to a real backend without touching the UI.

export type Step = { id: string; title: string; description: string; icon: string };
export type Content = {
  videoUrl: string;
  steps: Step[];
  apkUrl: string;
  apkName: string;
  skippedQuestions: string[];
};
export type Analytics = {
  pageViews: number;
  downloads: number;
  history: { date: string; views: number; downloads: number }[];
};

const KEYS = {
  content: "rideshare:content",
  analytics: "rideshare:analytics",
  session: "rideshare:session",
  viewed: "rideshare:viewed-session",
};

const DEFAULT_CONTENT: Content = {
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  apkUrl: "",
  apkName: "rideshare-latest.apk",
  steps: [
    { id: "1", title: "Download & Install", description: "Grab the latest Ride Share APK and install it on your Android device in seconds.", icon: "Download" },
    { id: "2", title: "Create Your Account", description: "Sign up with your phone number, verify, and add a payment method to get rolling.", icon: "UserPlus" },
    { id: "3", title: "Book Your Ride", description: "Set your destination, pick a ride type, and a nearby driver will be on the way.", icon: "MapPin" },
  ],
  skippedQuestions: [],
};

const todayKey = () => new Date().toISOString().slice(0, 10);

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const api = {
  getContent(): Content {
    return readJSON<Content>(KEYS.content, DEFAULT_CONTENT);
  },
  saveContent(c: Content) {
    writeJSON(KEYS.content, c);
  },
  getAnalytics(): Analytics {
    return readJSON<Analytics>(KEYS.analytics, { pageViews: 0, downloads: 0, history: [] });
  },
  trackPageView() {
    // dedupe per tab session
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(KEYS.viewed)) return;
    sessionStorage.setItem(KEYS.viewed, "1");
    const a = api.getAnalytics();
    a.pageViews += 1;
    bumpToday(a, "views");
    writeJSON(KEYS.analytics, a);
  },
  trackDownload() {
    const a = api.getAnalytics();
    a.downloads += 1;
    bumpToday(a, "downloads");
    writeJSON(KEYS.analytics, a);
  },
  // Auth (demo only — default admin/admin123, change after first login)
  login(username: string, password: string): boolean {
    const stored = readJSON<{ username: string; password: string } | null>(
      "rideshare:admin",
      null
    );
    const creds = stored ?? { username: "admin", password: "admin123" };
    if (username === creds.username && password === creds.password) {
      const token = btoa(`${username}:${Date.now()}`);
      writeJSON(KEYS.session, { token, at: Date.now() });
      return true;
    }
    return false;
  },
  logout() {
    if (typeof window !== "undefined") localStorage.removeItem(KEYS.session);
  },
  isAuthed(): boolean {
    const s = readJSON<{ token: string; at: number } | null>(KEYS.session, null);
    if (!s) return false;
    // 7-day session
    return Date.now() - s.at < 7 * 24 * 60 * 60 * 1000;
  },
};

function bumpToday(a: Analytics, kind: "views" | "downloads") {
  const d = todayKey();
  let row = a.history.find((r) => r.date === d);
  if (!row) {
    row = { date: d, views: 0, downloads: 0 };
    a.history.push(row);
  }
  if (kind === "views") row.views += 1;
  else row.downloads += 1;
  // keep last 30 days
  a.history = a.history.slice(-30);
}
