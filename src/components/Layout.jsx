import { NavLink, Outlet } from "react-router-dom";
import { Home, Route, Settings , User} from "lucide-react";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/eta", label: "ETA Chart", icon: Route },
  { to: "/settings", label: "Settings", icon: Settings },
 { to: "/profile", label: "Profile", Icon: User, roles: MEMBER }
];

export default function Layout() {
  return (
    <div className="layout">
      <nav className="nav">
        <div className="brand">Kinetic Transit</div>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}