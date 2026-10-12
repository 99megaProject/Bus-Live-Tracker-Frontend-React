import { NavLink, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Clock, Settings as SettingsIcon, ShieldCheck, User } from "lucide-react";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";
import OfflineBanner from "./components/OfflineBanner";
import Login from "./pages/Login";
import EtaChart from "./pages/EtaChart";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AdminPanel from "./pages/AdminPanel";

const MEMBER = ["stu", "tea", "driv"];
const NAV = [
  { to: "/", label: "ETA", Icon: Clock, end: true, roles: MEMBER },
  { to: "/profile", label: "Profile", Icon: User, roles: MEMBER },
  { to: "/settings", label: "Settings", Icon: SettingsIcon, roles: MEMBER },
  { to: "/admin", label: "Admin", Icon: ShieldCheck, roles: ["admin"] },
];

function Layout() {
  const { user } = useAuth();
  return (
    <div className="layout">
      <nav className="nav">
        <div className="brand">Bus Tracker</div>
        {NAV.filter((n) => n.roles.includes(user.role)).map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <main className="content">
        <OfflineBanner />
        <Outlet />
      </main>
    </div>
  );
}

function Home() {
  const { user } = useAuth();
  return user.role === "admin" ? <Navigate to="/admin" replace /> : <EtaChart />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* every page that needs the nav must be a child of THIS route */}
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Home />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route
            path="admin"
            element={
              <RequireAuth roles={["admin"]}>
                <AdminPanel />
              </RequireAuth>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}