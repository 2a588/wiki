import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { api } from "../lib/api";
import { Menu, Search, Sun, Moon, LogOut, LayoutDashboard, Layers, Trash2 } from "lucide-react";

export function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("wiki_dark", String(next));
  };

  const handleLogout = async () => {
    try { await api.auth.logout(); } catch (e) { console.error(e); }
    logout();
    navigate("/login");
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); setShowSearch(false); return; }
    try {
      const results = await api.pages.search(q);
      setSearchResults(results);
      setShowSearch(true);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-3 bg-white dark:bg-gray-900 shrink-0">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/" className="font-bold text-lg text-blue-600 dark:text-blue-400 flex items-center gap-2 shrink-0">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Wiki
        </Link>

        <div className="relative flex-1 max-w-md min-w-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="搜索页面..."
            className="input text-sm py-1.5 pl-8 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
          />
          {showSearch && searchResults.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 max-h-64 overflow-auto">
              {searchResults.map((r: any) => (
                <Link key={r.id} to={`/page/${r.id}`}
                  className="block px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                >
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{r.icon} {r.title}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button onClick={toggleDark} className="btn btn-secondary text-sm py-1.5 px-2 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700" title={dark ? "浅色模式" : "深色模式"}>
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">{user?.displayName}</span>
          <button onClick={handleLogout} className="btn btn-secondary text-sm py-1.5 px-2 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700" title="登出">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {sidebarOpen && (
          <aside className="w-48 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0 overflow-auto hidden md:block">
            <nav className="p-3 space-y-1">
              <NavItem to="/" icon={LayoutDashboard} label="首页" />
              <NavItem to="/spaces" icon={Layers} label="空间" />
              <NavItem to="/recycle" icon={Trash2} label="回收站" />
            </nav>
          </aside>
        )}
        <Outlet />
      </div>
    </div>
  );
}

function NavItem({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(to)}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
