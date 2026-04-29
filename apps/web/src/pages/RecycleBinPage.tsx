import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useToastStore } from "../store/toast";
import { Trash2, RotateCcw, Archive } from "lucide-react";

export function RecycleBinPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();

  const load = () => api.recycle.list().then(setPages).catch(console.error).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleRestore = async (id: number) => {
    try {
      await api.recycle.restore(id);
      addToast("success", "页面已恢复");
      load();
    } catch (e: any) { addToast("error", e.message); }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.recycle.delete(id);
      addToast("info", "页面已永久删除");
      load();
    } catch (e: any) { addToast("error", e.message); }
  };

  return (
    <div className="flex-1 p-6 sm:p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Trash2 className="w-6 h-6 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">回收站</h1>
        </div>

        {loading ? (
          <p className="text-gray-400">加载中...</p>
        ) : pages.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Archive className="w-12 h-12 mx-auto mb-3" />
            <p>回收站是空的</p>
            <p className="text-sm mt-1">删除的页面会出现在这里，30 天内可恢复</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pages.map((p: any) => (
              <div key={p.id} className="card p-3 flex items-center gap-3">
                <span className="text-lg">{p.icon || "📄"}</span>
                <div className="flex-1 min-w-0">
                  <Link to={`/page/${p.id}`} className="font-medium text-sm hover:text-blue-600 truncate block">
                    {p.title}
                  </Link>
                  <span className="text-xs text-gray-400">删除于 {new Date(p.deleted_at).toLocaleString()}</span>
                </div>
                <button onClick={() => handleRestore(p.id)} className="btn btn-secondary text-xs py-1 px-2" title="恢复">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="btn btn-secondary text-xs py-1 px-2 text-red-500 hover:bg-red-50" title="永久删除">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
