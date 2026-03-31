import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { SpacesPage } from "./pages/SpacesPage";
import { SpaceDetailPage } from "./pages/SpaceDetailPage";
import { PageEditor } from "./pages/PageEditor";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, []);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SpacesPage />} />
        <Route path="space/:spaceId" element={<SpaceDetailPage />} />
        <Route path="page/:pageId" element={<PageEditor />} />
        <Route path="page/:pageId/edit" element={<PageEditor />} />
      </Route>
    </Routes>
  );
}
