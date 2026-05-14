import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;