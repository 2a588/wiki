import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { diffLines } from "diff";
import { GitCompare, ArrowLeft } from "lucide-react";

export function VersionsDiff({ pageId, onClose }: { pageId: number; onClose: () => void }) {
  const [versions, setVersions] = useState<any[]>([]);
  const [v1, setV1] = useState<number | null>(null);
  const [v2, setV2] = useState<number | null>(null);
  const [diffs, setDiffs] = useState<any[]>([]);

  useEffect(() => {
    api.pages.versions(pageId).then(setVersions).catch(console.error);
  }, [pageId]);

  useEffect(() => {
    if (!v1 || !v2) { setDiffs([]); return; }
    const load = async () => {
      try {
        const [a, b] = await Promise.all([
          api.pages.getVersion(pageId, v1),
          api.pages.getVersion(pageId, v2),
        ]);
        const text1 = JSON.stringify(JSON.parse(a.content), null, 2);
        const text2 = JSON.stringify(JSON.parse(b.content), null, 2);
        setDiffs(diffLines(text1, text2));
      } catch (e) { console.error(e); }
    };
    load();
  }, [v1, v2, pageId]);

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
      <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <GitCompare className="w-5 h-5 text-gray-500" />
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">版本对比</h2>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <select value={v1 ?? ""} onChange={(e) => setV1(Number(e.target.value))} className="input text-sm py-1 w-auto">
            <option value="">选择版本</option>
            {versions.map((v: any) => (
              <option key={v.id} value={v.id}>v{v.version} ({v.author_name})</option>
            ))}
          </select>
          <span className="text-gray-400">vs</span>
          <select value={v2 ?? ""} onChange={(e) => setV2(Number(e.target.value))} className="input text-sm py-1 w-auto">
            <option value="">选择版本</option>
            {versions.map((v: any) => (
              <option key={v.id} value={v.id}>v{v.version} ({v.author_name})</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto font-mono text-sm space-y-0.5">
          {diffs.map((part: any, i: number) => (
            <div
              key={i}
              className={`px-4 py-0.5 whitespace-pre-wrap ${
                part.added ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200" :
                part.removed ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200" : ""
              }`}
            >
              {part.value}
            </div>
          ))}
          {diffs.length === 0 && v1 && v2 && <p className="text-gray-400 text-center py-10">两个版本内容相同</p>}
        </div>
      </div>
    </div>
  );
}
