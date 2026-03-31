import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { api } from "../lib/api";

export function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {}
    logout();
    navigate("/login");
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    try {
      const results = await api.pages.search(q);
      setSearchResults(results);
      setShowSearch(true);
    } catch {}
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="h-12 border-b border-gray-200 flex items-center px-4 gap-4 bg-white">
        <Link to="/" className="font-bold text-lg text-blue-600 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Wiki
        </Link>

        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="搜索页面..."
            className="input text-sm py-1.5"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
          />
          {showSearch && searchResults.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-auto">
              {searchResults.map((r: any) => (
                <Link
                  key={r.id}
                  to={`/page/${r.id}`}
                  className="block px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                >
                  <div className="font-medium text-sm">{r.icon} {r.title}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <span className="text-sm text-gray-600">{user?.displayName}</span>
          <button onClick={handleLogout} className="btn btn-secondary text-sm py-1.5 px-3">
            登出
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
