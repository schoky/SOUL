import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "../stores/authStore";

function AdminRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
