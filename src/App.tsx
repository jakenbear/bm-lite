import { useEffect, useState } from "react";
import { Authenticated, AuthLoading, Unauthenticated, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { BarChart3, CalendarDays, Download, Dumbbell, History, LogOut } from "lucide-react";
import { BrowserRouter, Navigate, NavLink, Route, Routes } from "react-router-dom";
import { AuthPage } from "./features/auth/AuthPage";
import { RoundMapPage } from "./features/map/RoundMapPage";
import { RoundHistoryPage } from "./features/rounds/RoundHistoryPage";
import { RoundSetup } from "./features/rounds/RoundSetup";
import { StatsPage } from "./features/stats/StatsPage";
import { TodayPage } from "./features/today/TodayPage";
import { trackerApi } from "./lib/api";

export default function App() {
  return (
    <>
      <AuthLoading><LoadingScreen /></AuthLoading>
      <Unauthenticated><AuthPage /></Unauthenticated>
      <Authenticated><Tracker /></Authenticated>
    </>
  );
}

function Tracker() {
  const dashboard = useQuery(trackerApi.dashboard);
  const { signOut } = useAuthActions();

  if (dashboard === undefined) return <LoadingScreen />;
  if (!dashboard.activeRound) return <RoundSetup />;

  const { activeRound, entries, history, profile, today } = dashboard;
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="topbar">
          <NavLink to="/" className="wordmark">
            <span className="brand-mark small"><Dumbbell aria-hidden="true" /></span>
            <span><strong>BEAST MODE</strong><small>LITE</small></span>
          </NavLink>
          <div className="topbar-actions">
            <InstallButton />
            <button className="icon-button" type="button" onClick={() => void signOut()} aria-label="Sign out">
              <LogOut aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="content">
          <Routes>
            <Route path="/" element={<TodayPage round={activeRound} entries={entries} today={today} />} />
            <Route path="/day/:dayIndex" element={<TodayPage round={activeRound} entries={entries} today={today} />} />
            <Route path="/map" element={<RoundMapPage round={activeRound} entries={entries} today={today} />} />
            <Route path="/stats" element={<StatsPage round={activeRound} entries={entries} profile={profile} today={today} />} />
            <Route path="/rounds" element={<RoundHistoryPage activeRound={activeRound} history={history} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <nav className="bottom-nav" aria-label="Primary navigation">
          <NavItem to="/" end icon={Dumbbell} label="Today" />
          <NavItem to="/map" icon={CalendarDays} label="90-Day Map" />
          <NavItem to="/stats" icon={BarChart3} label="Stats" />
          <NavItem to="/rounds" icon={History} label="Rounds" />
        </nav>
      </div>
    </BrowserRouter>
  );
}

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const ready = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const installed = () => setInstallPrompt(null);
    window.addEventListener("beforeinstallprompt", ready);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", ready);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  if (!installPrompt) return null;

  return (
    <button
      className="install-button"
      type="button"
      onClick={async () => {
        await installPrompt.prompt();
        await installPrompt.userChoice;
        setInstallPrompt(null);
      }}
    >
      <Download aria-hidden="true" />
      <span>Install app</span>
    </button>
  );
}

type NavItemProps = {
  to: string;
  label: string;
  icon: typeof Dumbbell;
  end?: boolean;
};

function NavItem({ to, label, icon: Icon, end }: NavItemProps) {
  return (
    <NavLink to={to} end={end}>
      <Icon aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  );
}

function LoadingScreen() {
  return (
    <main className="loading-screen">
      <span className="loader" />
      <p>Loading your round…</p>
    </main>
  );
}
