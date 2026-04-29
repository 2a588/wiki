import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

interface PageNode {
  id: number;
  title: string;
  icon: string | null;
  children: PageNode[];
}

function PageTreeItem({ node, spaceId, onDelete, depth = 0 }: { node: PageNode; spaceId: number; onDelete: (id: number) => void; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-1 py-1.5 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 group"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="w-4 h-4 flex items-center justify-center text-gray-400">
            <svg className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="w-4" />
        )}
        <Link to={`/page/${node.id}`} className="flex-1 text-sm flex items-center gap-1.5 truncate text-gray-900 dark:text-gray-100">
          <span>{node.icon || "📄"}</span>
          <span className="truncate">{node.title}</span>
        </Link>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onDelete(node.id)}
            className="text-gray-400 hover:text-red-500 p-0.5"
            title="删除页面"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <PageTreeItem key={child.id} node={child} spaceId={spaceId} onDelete={onDelete} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SpaceDetailPage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const [space, setSpace] = useState<any>(null);
  const [pages, setPages] = useState<PageNode[]>([]);
  const [showNewPage, setShowNewPage] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const load = async () => {
    if (!spaceId) return;
    try {
      const [s, p] = await Promise.all([
        api.spaces.get(Number(spaceId)),
        api.spaces.pages(Number(spaceId)),
      ]);
      setSpace(s);
      setPages(p);
    } catch (e) {
      console.error("Failed to load space:", e);
    }
  };

  useEffect(() => { load(); }, [spaceId]);

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceId || !newTitle.trim()) return;
    try {
      const page = await api.pages.create({ spaceId: Number(spaceId), title: newTitle.trim() });
      setNewTitle("");
      setShowNewPage(false);
      navigate(`/page/${page.id}/edit`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeletePage = async (id: number) => {
    if (!confirm("确定删除此页面吗？")) return;
    await api.pages.delete(id);
    load();
  };

  if (!space) {
    return <div className="flex-1 p-8"><p className="text-gray-500 dark:text-gray-400">加载中...</p></div>;
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="w-56 sm:w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-800 shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-xl">{space.icon}</span>
            <div>
              <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{space.name}</h2>
              <span className="text-xs text-gray-400 font-mono">{space.key}</span>
            </div>
          </div>
        </div>
        <div className="p-2 flex-1 overflow-auto">
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">页面</span>
            <button
              onClick={() => setShowNewPage(true)}
              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              title="新建页面"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {showNewPage && (
            <form onSubmit={handleCreatePage} className="px-2 mb-2">
              <input
                type="text"
                className="input text-sm py-1"
                placeholder="页面标题"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
              />
              <div className="flex gap-1 mt-1">
                <button type="submit" className="btn btn-primary text-xs py-1 px-2">创建</button>
                <button type="button" onClick={() => setShowNewPage(false)} className="btn btn-secondary text-xs py-1 px-2">取消</button>
              </div>
            </form>
          )}

          {pages.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <p className="text-3xl mb-2">📄</p>
              <p className="text-xs">暂无页面</p>
              <p className="text-xs mt-1">点击 + 创建第一个页面</p>
            </div>
          ) : (
            pages.map((page) => (
              <PageTreeItem key={page.id} node={page} spaceId={Number(spaceId)} onDelete={handleDeletePage} />
            ))
          )}
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
        <div className="text-center">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-lg mb-2">选择左侧页面开始编辑</p>
          <p className="text-sm">或点击 + 按钮创建新页面</p>
        </div>
      </main>
    </div>
  );
}
