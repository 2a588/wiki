import { useState, useEffect } from "react";
import { api } from "../lib/api";
import SpaceCard from "../components/SpaceCard";

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
      setSpaces(data as any);
    } catch {
      setSpaces([]);
    }
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
    <div className="flex-1 p-4 sm:p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Spaces</h1>
          <button onClick={() => setShowCreate(true)} className="btn btn-primary">
            + Create Space
          </button>
        </div>

        {showCreate && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">New Space</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Space Key</label>
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
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Space Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Development Docs"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Optional"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary">Create</button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : spaces.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-lg mb-2">还没有空间</p>
            <p className="text-sm mb-6">空间是页面的容器，点击上方按钮创建你的第一个空间</p>
            <button onClick={() => setShowCreate(true)} className="btn btn-primary">
              创建空间
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {spaces.map((space: any) => (
              <SpaceCard key={space.id} space={space} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
