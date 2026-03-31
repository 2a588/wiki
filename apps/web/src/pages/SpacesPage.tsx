import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export function SpacesPage() {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [loading, setLoading] = useState(true);

  const loadSpaces = async () => {
    try {
      const data = await api.spaces.list();
      setSpaces(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadSpaces(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.spaces.create({ key: newKey, name: newName, description: newDesc });
      setNewKey(""); setNewName(""); setNewDesc("");
      setShowCreate(false);
      loadSpaces();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除这个空间吗？所有页面也会被删除。")) return;
    await api.spaces.delete(id);
    loadSpaces();
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">空间</h1>
          <button onClick={() => setShowCreate(true)} className="btn btn-primary">
            + 新建空间
          </button>
        </div>

        {showCreate && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">新建空间</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">空间标识 (key)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="DEV"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">空间名称</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="开发文档"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">描述</label>
                <input
                  type="text"
                  className="input"
                  placeholder="可选"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary">创建</button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn btn-secondary">取消</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">加载中...</p>
        ) : spaces.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-2">还没有空间</p>
            <p className="text-sm">点击上方按钮创建第一个空间</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space: any) => (
              <Link
                key={space.id}
                to={`/space/${space.id}`}
                className="card p-5 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{space.icon}</span>
                    <div>
                      <h3 className="font-semibold group-hover:text-blue-600">{space.name}</h3>
                      <span className="text-xs text-gray-400 font-mono">{space.key}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); handleDelete(space.id); }}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="删除空间"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                {space.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{space.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
