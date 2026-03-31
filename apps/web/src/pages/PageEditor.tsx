import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { api } from "../lib/api";

const lowlight = createLowlight(common);

function EditorToolbar({ editor }: { editor: any }) {
  if (!editor) return null;

  const addImage = () => {
    const url = prompt("输入图片URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const url = prompt("输入链接URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const btn = (active: boolean) =>
    `p-1.5 rounded hover:bg-gray-200 transition-colors ${active ? "bg-gray-200 text-blue-600" : "text-gray-600"}`;

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))} title="粗体 (Ctrl+B)">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg>
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))} title="斜体 (Ctrl+I)">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M10 4h4m-2 0l-4 16m0 0h4" /></svg>
      </button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive("underline"))} title="下划线 (Ctrl+U)">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M7 4v7a5 5 0 0010 0V4M5 20h14" /></svg>
      </button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive("strike"))} title="删除线">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17.3 4.9c-1.2-1.1-2.9-1.5-4.5-1.5-3.5 0-5.5 2-5.5 4 0 1 .3 1.8 1 2.4m8.8 1.7c.3.4.4.9.4 1.4 0 2.5-2.5 4-5.5 4-1.8 0-3.5-.5-4.7-1.5M4 12h16" /></svg>
      </button>
      <span className="w-px h-5 bg-gray-300 mx-1" />
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btn(editor.isActive("heading", { level: 1 }))} title="标题1">H1</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))} title="标题2">H2</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))} title="标题3">H3</button>
      <span className="w-px h-5 bg-gray-300 mx-1" />
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))} title="无序列表">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))} title="有序列表">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>
      </button>
      <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={btn(editor.isActive("taskList"))} title="任务列表">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
      </button>
      <span className="w-px h-5 bg-gray-300 mx-1" />
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))} title="引用">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" /></svg>
      </button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btn(editor.isActive("codeBlock"))} title="代码块">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
      </button>
      <button onClick={() => editor.chain().focus().toggleCode().run()} className={btn(editor.isActive("code"))} title="行内代码">
        <span className="text-xs font-mono">&lt;/&gt;</span>
      </button>
      <span className="w-px h-5 bg-gray-300 mx-1" />
      <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={btn(editor.isActive("highlight"))} title="高亮">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.243 4.515l-6.738 6.737-.707 2.121-1.04 1.041 2.828 2.829 1.04-1.041 2.122-.707 6.737-6.738-4.242-4.242zm6.364 3.536a1 1 0 010 1.414l-7.778 7.778-2.122.707-1.414 1.414a1 1 0 01-1.414 0l-4.243-4.243a1 1 0 010-1.414l1.414-1.414.707-2.121 7.778-7.778a1 1 0 011.414 0l5.658 5.656z" /></svg>
      </button>
      <button onClick={addLink} className={btn(editor.isActive("link"))} title="链接">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
      </button>
      <button onClick={addImage} className={btn(false)} title="图片">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      </button>
      <span className="w-px h-5 bg-gray-300 mx-1" />
      <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={btn(false)} title="表格">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M3 10h18M3 14h18M10 3v18M14 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" /></svg>
      </button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btn(false)} title="分割线">
        <span className="text-xs">—</span>
      </button>
    </div>
  );
}

export function PageEditor() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Highlight,
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension.configure({ inline: true }),
      Placeholder.configure({ placeholder: "开始编写内容..." }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "tiptap",
      },
    },
  });

  const loadPage = useCallback(async () => {
    if (!pageId) return;
    try {
      const data = await api.pages.get(Number(pageId));
      setPage(data);
      setTitle(data.title);
      if (editor && data.content) {
        try {
          const json = typeof data.content === "string" ? JSON.parse(data.content) : data.content;
          editor.commands.setContent(json);
        } catch {}
      }
      const att = await api.attachments.list(Number(pageId));
      setAttachments(att);
    } catch {}
  }, [pageId, editor]);

  useEffect(() => { loadPage(); }, [loadPage]);

  const goBack = () => {
    if (page?.space_id) {
      navigate(`/space/${page.space_id}`);
    } else {
      navigate("/");
    }
  };

  const handleSave = async () => {
    if (!pageId || !editor) return;
    setSaving(true);
    try {
      const content = JSON.stringify(editor.getJSON());
      await api.pages.update(Number(pageId), { title, content });
    } catch (err: any) {
      alert(err.message);
    }
    setSaving(false);
  };

  const handleSaveAndBack = async () => {
    if (!pageId || !editor) return;
    setSaving(true);
    try {
      const content = JSON.stringify(editor.getJSON());
      await api.pages.update(Number(pageId), { title, content });
      goBack();
    } catch (err: any) {
      alert(err.message);
    }
    setSaving(false);
  };

  const loadVersions = async () => {
    if (!pageId) return;
    try {
      const v = await api.pages.versions(Number(pageId));
      setVersions(v);
      setShowVersions(true);
    } catch {}
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pageId) return;
    try {
      const att = await api.attachments.upload(file, Number(pageId));
      setAttachments((prev) => [att, ...prev]);
      if (file.type.startsWith("image/") && editor) {
        editor.chain().focus().setImage({ src: `/uploads/${att.filename}` }).run();
      }
    } catch (err: any) {
      alert(err.message);
    }
    e.target.value = "";
  };

  const handleDeleteAttachment = async (id: number) => {
    if (!confirm("确定删除此附件？")) return;
    await api.attachments.delete(id);
    setAttachments((prev) => prev.filter((a: any) => a.id !== id));
  };

  if (!page) {
    return <div className="flex-1 p-8"><p className="text-gray-500">加载中...</p></div>;
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Editor area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              title="返回目录"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-lg">{page.icon || "📄"}</span>
            <input
              type="text"
              className="text-lg font-semibold bg-transparent border-none outline-none focus:ring-0 w-80"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="页面标题"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="btn btn-secondary text-sm py-1.5 px-3 cursor-pointer">
              <input type="file" className="hidden" onChange={handleFileUpload} />
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                附件
              </span>
            </label>
            <button onClick={loadVersions} className="btn btn-secondary text-sm py-1.5 px-3">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                历史
              </span>
            </button>
            <button onClick={handleSave} className="btn btn-secondary text-sm py-1.5 px-3" disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </button>
            <button onClick={handleSaveAndBack} className="btn btn-primary text-sm py-1.5 px-4" disabled={saving}>
              {saving ? "保存中..." : "保存并返回"}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-white">
          <EditorToolbar editor={editor} />
          <div className="max-w-4xl mx-auto py-6">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Sidebar for versions or attachments */}
      {(showVersions || attachments.length > 0) && (
        <aside className="w-72 border-l border-gray-200 bg-gray-50 overflow-auto shrink-0">
          {showVersions && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">版本历史</h3>
                <button onClick={() => setShowVersions(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-auto">
                {versions.map((v: any) => (
                  <div key={v.id} className="text-xs p-2 bg-white rounded border border-gray-200">
                    <div className="font-medium">v{v.version}</div>
                    <div className="text-gray-400">{v.author_name} · {new Date(v.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {attachments.length > 0 && (
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-3">附件</h3>
              <div className="space-y-2">
                {attachments.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between text-xs p-2 bg-white rounded border border-gray-200 group">
                    <a href={`/uploads/${a.filename}`} target="_blank" rel="noopener" className="truncate flex-1 hover:text-blue-600">
                      {a.original_name}
                    </a>
                    <button
                      onClick={() => handleDeleteAttachment(a.id)}
                      className="text-gray-400 hover:text-red-500 ml-2 opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
