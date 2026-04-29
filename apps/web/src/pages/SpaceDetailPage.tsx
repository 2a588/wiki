import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useToastStore } from "../store/toast";
import { Plus, GripVertical, X } from "lucide-react";

interface PageNode {
  id: number;
  title: string;
  icon: string | null;
  children: PageNode[];
}

function PageTreeItem({ node, spaceId, onDelete, depth = 0, onMove }: {
  node: PageNode; spaceId: number; onDelete: (id: number) => void; depth?: number;
  onMove: (id: number, parentId: number | null) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [dragOver, setDragOver] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const draggedId = Number(e.dataTransfer.getData("pageId"));
    if (draggedId && draggedId !== node.id) onMove(draggedId, node.id);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1.5 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 group ${dragOver ? "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400" : ""}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        draggable
        onDragStart={(e) => { e.dataTransfer.setData("pageId", String(node.id)); e.currentTarget.classList.add("opacity-50"); }}
        onDragEnd={(e) => e.currentTarget.classList.remove("opacity-50")}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100">
          <GripVertical className="w-3.5 h-3.5" />
        </div>
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="w-4 h-4 flex items-center justify-center text-gray-400">
            <svg className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : <span className="w-4" />}
        <Link to={`/page/${node.id}`} className="flex-1 text-sm flex items-center gap-1.5 truncate text-gray-900 dark:text-gray-100">
          <span>{node.icon || "📄"}</span>
          <span className="truncate">{node.title}</span>
        </Link>
        <button onClick={() => onDelete(node.id)} className="text-gray-400 hover:text-red-500 p-0.5 opacity-0 group-hover:opacity-100" title="删除">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {expanded && hasChildren && node.children.map((child) => (
        <PageTreeItem key={child.id} node={child} spaceId={spaceId} onDelete={onDelete} depth={depth + 1} onMove={onMove} />
      ))}
    </div>
  );
}

export function SpaceDetailPage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
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
    } catch (e) { console.error(e); }
  };

  useEffect(() => { load(); }, [spaceId]);

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceId || !newTitle.trim()) return;
    try {
      const page = await api.pages.create({ spaceId: Number(spaceId), title: newTitle.trim() });
      setNewTitle(""); setShowNewPage(false);
      navigate(`/page/${page.id}/edit`);
    } catch (err: any) { addToast("error", err.message); }
  };

  const handleDeletePage = async (id: number) => {
    if (!confirm("确定删除此页面？")) return;
    try { await api.pages.delete(id); load(); } catch (err: any) { addToast("error", err.message); }
  };

  const handleMove = async (id: number, parentId: number | null) => {
    try {
      await api.pages.move(id, { parentId });
      addToast("success", "页面已移动");
      load();
    } catch (err: any) { addToast("error", err.message); }
  };

  if (!space) {
    return <div className="flex-1 flex items-center justify-center"><div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" /></div>;
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
            <button onClick={() => setShowNewPage(true)} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" title="新建页面">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {showNewPage && (
            <form onSubmit={handleCreatePage} className="px-2 mb-2">
              <input type="text" className="input text-sm py-1" placeholder="页面标题" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} autoFocus />
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
              <p className="text-xs mt-1">拖拽页面到父页面上可以改变层级</p>
            </div>
          ) : (
            pages.map((page) => (
              <PageTreeItem key={page.id} node={page} spaceId={Number(spaceId)} onDelete={handleDeletePage} onMove={handleMove} />
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
