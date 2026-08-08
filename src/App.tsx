import { Authenticated, AuthLoading, Unauthenticated, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { BarChart3, CalendarDays, Dumbbell, History, LogOut } from "lucide-react";
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
          <button className="icon-button" type="button" onClick={() => void signOut()} aria-label="Sign out">
            <LogOut aria-hidden="true" />
          </button>
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
