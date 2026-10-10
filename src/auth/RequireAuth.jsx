import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import GlobalLoader from "../components/loaders/GlobalLoader";

export default function RequireAuth({ children, roles }) {
  const { user, checking } = useAuth();
  const location = useLocation();
  if (checking) return <GlobalLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}