import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SpacesPage } from "./pages/SpacesPage";
import { SpaceDetailPage } from "./pages/SpaceDetailPage";
import { PageEditor } from "./pages/PageEditor";
import { RecycleBinPage } from "./pages/RecycleBinPage";
import { NotFoundPage } from "./pages/NotFoundPage";

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

  useEffect(() => {
    const isDark = localStorage.getItem("wiki_dark") === "true";
    if (isDark) document.documentElement.classList.add("dark");
  }, []);

  return (
    <>
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
          <Route index element={<DashboardPage />} />
          <Route path="spaces" element={<SpacesPage />} />
          <Route path="space/:spaceId" element={<SpaceDetailPage />} />
          <Route path="page/:pageId" element={<PageEditor />} />
          <Route path="page/:pageId/edit" element={<PageEditor />} />
          <Route path="recycle" element={<RecycleBinPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
