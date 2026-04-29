import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import Mention from "@tiptap/extension-mention";
import { common, createLowlight } from "lowlight";
import { api } from "../lib/api";
import { useToastStore } from "../store/toast";
import { TableOfContents } from "../components/TableOfContents";
import { EmojiPicker } from "../components/EmojiPicker";
import { ImageLightbox } from "../components/ImageLightbox";
import { Comments } from "../components/Comments";
import { VersionsDiff } from "../components/VersionsDiff";
import { TemplatePicker } from "../components/TemplatePicker";
import { SlashCommand } from "../lib/slashCommand";
import {
  ArrowLeft, Save, Star, StarOff, Maximize2, Minimize2, FileDown,
  History, Paperclip, GitCompare, LayoutTemplate
} from "lucide-react";

const lowlight = createLowlight(common);
const AUTO_SAVE_DELAY = 5000;

function htmlToMarkdown(html: string): string {
  let md = html;
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<u>(.*?)<\/u>/gi, '__$1__');
  md = md.replace(/<s>(.*?)<\/s>/gi, '~~$1~~');
  md = md.replace(/<code>(.*?)<\/code>/gi, '`$1`');
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![image]($1)');
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '> $1\n\n');
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<pre><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n\n');
  md = md.replace(/<hr[^>]*>/gi, '---\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<[^>]*>/g, '');
  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
}

function EditorToolbar({ editor }: { editor: any }) {
  if (!editor) return null;
  const addImage = () => { const url = prompt("输入图片URL:"); if (url) editor.chain().focus().setImage({ src: url }).run(); };
  const addLink = () => { const url = prompt("输入链接URL:"); if (url) editor.chain().focus().setLink({ href: url }).run(); };
  const btn = (active: boolean) => `p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${active ? "bg-gray-200 dark:bg-gray-600 text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"}`;
  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))} title="粗体"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))} title="斜体"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M10 4h4m-2 0l-4 16m0 0h4" /></svg></button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive("underline"))} title="下划线"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M7 4v7a5 5 0 0010 0V4M5 20h14" /></svg></button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive("strike"))} title="删除线"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17.3 4.9c-1.2-1.1-2.9-1.5-4.5-1.5-3.5 0-5.5 2-5.5 4 0 1 .3 1.8 1 2.4m8.8 1.7c.3.4.4.9.4 1.4 0 2.5-2.5 4-5.5 4-1.8 0-3.5-.5-4.7-1.5M4 12h16" /></svg></button>
      <span className="w-px h-5 bg-gray-300 dark:bg-gray-500 mx-1" />
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btn(editor.isActive("heading", { level: 1 }))}>H1</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}>H2</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))}>H3</button>
      <span className="w-px h-5 bg-gray-300 dark:bg-gray-500 mx-1" />
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))} title="无序列表"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg></button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))} title="有序列表"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg></button>
      <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={btn(editor.isActive("taskList"))} title="任务列表"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg></button>
      <span className="w-px h-5 bg-gray-300 dark:bg-gray-500 mx-1" />
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))} title="引用"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" /></svg></button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btn(editor.isActive("codeBlock"))} title="代码块"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg></button>
      <button onClick={() => editor.chain().focus().toggleCode().run()} className={btn(editor.isActive("code"))} title="行内代码"><span className="text-xs font-mono">&lt;/&gt;</span></button>
      <span className="w-px h-5 bg-gray-300 dark:bg-gray-500 mx-1" />
      <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={btn(editor.isActive("highlight"))} title="高亮"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.243 4.515l-6.738 6.737-.707 2.121-1.04 1.041 2.828 2.829 1.04-1.041 2.122-.707 6.737-6.738-4.242-4.242z" /></svg></button>
      <button onClick={addLink} className={btn(editor.isActive("link"))} title="链接"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg></button>
      <button onClick={addImage} className={btn(false)} title="图片"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
      <span className="w-px h-5 bg-gray-300 dark:bg-gray-500 mx-1" />
      <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={btn(false)} title="表格"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M3 10h18M3 14h18M10 3v18M14 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" /></svg></button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btn(false)} title="分割线"><span className="text-xs">—</span></button>
    </div>
  );
}

export function PageEditor() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const [page, setPage] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">("saved");
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [favorited, setFavorited] = useState(false);
  const [fullWidth, setFullWidth] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [labels, setLabels] = useState<any[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [ancestors, setAncestors] = useState<any[]>([]);
  const [contentLoaded, setContentLoaded] = useState(false);
  const autoSaveTimer = useRef<any>(null);
  const loadedContent = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline, Highlight,
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension.configure({ inline: true }),
      Placeholder.configure({ placeholder: "开始编写内容... 输入 / 唤出命令菜单" }),
      TaskList, TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }), TableRow, TableCell, TableHeader,
      CodeBlockLowlight.configure({ lowlight }),
      SlashCommand,
      Mention.configure({
        HTMLAttributes: { class: "mention" },
        suggestion: {
          char: "@",
          items: async ({ query }: { query: string }) => {
            const users = await api.mentions.users(query || "");
            return users.map((u: any) => ({ id: u.id, label: u.display_name }));
          },
          render: () => {
            let dom: HTMLDivElement | null = null;
            return {
              onStart: (props: any) => {
                dom = document.createElement("div");
                dom.className = "fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl py-1 max-h-48 overflow-auto";
                props.items.forEach((item: any) => {
                  const btn = document.createElement("button");
                  btn.className = "block w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200";
                  btn.textContent = `@${item.label}`;
                  btn.onclick = () => {
                    props.command({ id: item.id, label: item.label });
                    api.mentions.create(Number(pageId!), item.id).catch(console.error);
                  };
                  dom!.appendChild(btn);
                });
                document.body.appendChild(dom);
                const editorEl = document.querySelector(".tiptap");
                if (editorEl) {
                  const rect = editorEl.getBoundingClientRect();
                  dom.style.left = rect.left + "px";
                  dom.style.top = (rect.top + window.scrollY) + "px";
                }
              },
              onUpdate: (props: any) => {
                if (!dom) return;
                dom.innerHTML = "";
                props.items.forEach((item: any) => {
                  const btn = document.createElement("button");
                  btn.className = "block w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200";
                  btn.textContent = `@${item.label}`;
                  btn.onclick = () => {
                    props.command({ id: item.id, label: item.label });
                    api.mentions.create(Number(pageId!), item.id).catch(console.error);
                  };
                  dom!.appendChild(btn);
                });
              },
              onExit: () => { if (dom) { dom.remove(); dom = null; } },
            };
          },
        },
      }),
    ],
    content: "",
    editorProps: {
      attributes: { class: "tiptap" },
      handleClick: (view: any, pos: number, event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName === "IMG") {
          setLightboxSrc(target.getAttribute("src"));
          return true;
        }
        return false;
      },
    },
    onUpdate: () => {
      if (contentLoaded) {
        setSaveStatus("unsaved");
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(doSave, AUTO_SAVE_DELAY);
      }
    },
  });

  const doSave = async () => {
    if (!pageId || !editor) return;
    setSaveStatus("saving");
    setSaving(true);
    try {
      const content = JSON.stringify(editor.getJSON());
      await api.pages.update(Number(pageId), { title, content });
      setSaveStatus("saved");
    } catch (err: any) {
      addToast("error", err.message);
      setSaveStatus("unsaved");
    }
    setSaving(false);
  };

  const loadPage = useCallback(async () => {
    if (!pageId) return;
    try {
      const data = await api.pages.get(Number(pageId));
      setPage(data);
      setTitle(data.title);
      loadedContent.current = false;
      setContentLoaded(false);

      const [fav, lbl] = await Promise.all([
        api.favorites.check(Number(pageId)),
        api.labels.get(Number(pageId)),
        api.attachments.list(Number(pageId)),
      ]);
      setFavorited(fav.favorited);
      setLabels(lbl);

      const att = await api.attachments.list(Number(pageId));
      setAttachments(att);

      if (data.space_id) {
        try {
          const tree = await api.spaces.pages(data.space_id);
          const findAncestors = (nodes: any[], targetId: number, path: any[] = []): any[] | null => {
            for (const n of nodes) {
              if (n.id === targetId) return path;
              if (n.children) {
                const found = findAncestors(n.children, targetId, [...path, { id: n.id, title: n.title }]);
                if (found) return found;
              }
            }
            return null;
          };
          const path = findAncestors(tree, data.id);
          setAncestors(path || []);
        } catch {}
      }
    } catch (e) { console.error(e); }
  }, [pageId]);

  useEffect(() => { loadPage(); }, [loadPage]);

  useEffect(() => {
    if (editor && page?.content && !loadedContent.current) {
      try {
        const json = typeof page.content === "string" ? JSON.parse(page.content) : page.content;
        editor.commands.setContent(json);
        loadedContent.current = true;
        setContentLoaded(true);
        setSaveStatus("saved");
      } catch (e) { console.error(e); }
    }
  }, [editor, page]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (saveStatus === "unsaved") e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saveStatus]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); doSave(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editor, pageId, title]);

  useEffect(() => {
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, []);

  const goBack = () => { navigate(page?.space_id ? `/space/${page.space_id}` : "/"); };

  const handleSaveAndBack = async () => {
    await doSave();
    goBack();
  };

  const loadVersions = async () => {
    if (!pageId) return;
    try { setVersions(await api.pages.versions(Number(pageId))); setShowVersions(true); } catch (e) { console.error(e); }
  };

  const restoreVersion = async (version: any) => {
    if (!editor) return;
    try {
      const json = typeof version.content === "string" ? JSON.parse(version.content) : version.content;
      editor.commands.setContent(json);
      setSaveStatus("unsaved");
      addToast("info", `已恢复 v${version.version}，点击保存生效`);
    } catch (e) { console.error(e); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pageId) return;
    try {
      const att = await api.attachments.upload(file, Number(pageId));
      setAttachments((prev) => [att, ...prev]);
      if (file.type.startsWith("image/") && editor) {
        editor.chain().focus().setImage({ src: `/uploads/${att.filename}` }).run();
      } else if (editor) {
        editor.chain().focus().setLink({ href: `/uploads/${att.filename}` }).insertContent(` ${att.original_name} `).run();
      }
    } catch (err: any) { addToast("error", err.message); }
    e.target.value = "";
  };

  const handleDeleteAttachment = async (id: number) => {
    try { await api.attachments.delete(id); setAttachments((prev) => prev.filter((a: any) => a.id !== id)); }
    catch (err: any) { addToast("error", err.message); }
  };

  const toggleFavorite = async () => {
    if (!pageId) return;
    try {
      if (favorited) { await api.favorites.remove(Number(pageId)); setFavorited(false); addToast("info", "已取消收藏"); }
      else { await api.favorites.add(Number(pageId)); setFavorited(true); addToast("success", "已收藏"); }
    } catch (err: any) { addToast("error", err.message); }
  };

  const addLabel = async () => {
    if (!pageId || !newLabel.trim()) return;
    try {
      await api.labels.add(Number(pageId), newLabel.trim());
      setLabels((prev) => [...prev, { id: Date.now(), label: newLabel.trim() }]);
      setNewLabel("");
    } catch (err: any) { addToast("error", err.message); }
  };

  const removeLabel = async (id: number) => {
    try { await api.labels.remove(id); setLabels((prev) => prev.filter((l: any) => l.id !== id)); }
    catch (err: any) { addToast("error", err.message); }
  };

  const exportMarkdown = () => {
    if (!editor) return;
    const md = htmlToMarkdown(editor.getHTML());
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${title || "untitled"}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400">加载中...</span>
        </div>
      </div>
    );
  }

  const saveColor = saveStatus === "saved" ? "text-green-500" : saveStatus === "saving" ? "text-blue-500" : "text-orange-500";
  const saveLabel = saveStatus === "saved" ? "已保存" : saveStatus === "saving" ? "保存中..." : "未保存";

  return (
    <div className="flex flex-1 overflow-hidden">
      {showDiff && <VersionsDiff pageId={Number(pageId!)} onClose={() => setShowDiff(false)} />}
      {showTemplate && (
        <TemplatePicker
          onSelect={(content) => { editor?.commands.setContent(content); setShowTemplate(false); setSaveStatus("unsaved"); }}
          onClose={() => setShowTemplate(false)}
        />
      )}
      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={goBack} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative">
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1" title="选择图标"
              >
                {page.icon || "📄"}
              </button>
              {showEmojiPicker && <EmojiPicker onSelect={(emoji) => { api.pages.update(Number(pageId!), { icon: emoji }).then(() => setPage((p: any) => ({ ...p, icon: emoji }))).catch(() => {}); setShowEmojiPicker(false); }} onClose={() => setShowEmojiPicker(false)} />}
            </div>
            <div className="min-w-0">
              {ancestors.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-0.5">
                  {ancestors.map((a, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <Link to={`/page/${a.id}`} className="hover:text-blue-500 truncate max-w-[120px]">{a.title}</Link>
                      <span>/</span>
                    </span>
                  ))}
                </div>
              )}
              <input type="text"
                className="text-lg font-semibold bg-transparent border-none outline-none focus:ring-0 min-w-0 w-full"
                value={title} onChange={(e) => { setTitle(e.target.value); setSaveStatus("unsaved"); }}
                placeholder="页面标题"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-xs ${saveColor} hidden sm:inline`}>{saveLabel}</span>
            <button onClick={toggleFavorite} className={`btn btn-secondary text-sm py-1.5 px-2 ${favorited ? "text-yellow-500" : ""}`} title="收藏">
              {favorited ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
            </button>
            <button onClick={() => setFullWidth(!fullWidth)} className="btn btn-secondary text-sm py-1.5 px-2" title={fullWidth ? "默认宽度" : "全宽"}>
              {fullWidth ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button onClick={() => setShowTemplate(true)} className="btn btn-secondary text-sm py-1.5 px-2" title="模板">
              <LayoutTemplate className="w-4 h-4" />
            </button>
            <label className="btn btn-secondary text-sm py-1.5 px-2 cursor-pointer" title="上传附件">
              <input type="file" className="hidden" onChange={handleFileUpload} />
              <Paperclip className="w-4 h-4" />
            </label>
            <button onClick={loadVersions} className="btn btn-secondary text-sm py-1.5 px-2" title="历史版本">
              <History className="w-4 h-4" />
            </button>
            <button onClick={() => setShowDiff(true)} className="btn btn-secondary text-sm py-1.5 px-2" title="版本对比">
              <GitCompare className="w-4 h-4" />
            </button>
            <button onClick={exportMarkdown} className="btn btn-secondary text-sm py-1.5 px-2" title="导出 Markdown">
              <FileDown className="w-4 h-4" />
            </button>
            <button onClick={doSave} className="btn btn-secondary text-sm py-1.5 px-2" disabled={saving}>
              <Save className="w-4 h-4" />
            </button>
            <button onClick={handleSaveAndBack} className="btn btn-primary text-sm py-1.5 px-3" disabled={saving}>
              {saving ? "..." : "完成"}
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex overflow-hidden">
          <div className={`flex-1 overflow-auto bg-white dark:bg-gray-900 ${fullWidth ? "" : ""}`}>
            <EditorToolbar editor={editor} />
            <div className={`mx-auto py-6 ${fullWidth ? "px-8" : "max-w-4xl px-4"}`}>
              <EditorContent editor={editor} />

              {/* Labels */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center gap-1.5">
                  {labels.map((l: any) => (
                    <span key={l.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                      {l.label}
                      <button onClick={() => removeLabel(l.id)} className="hover:text-red-500">&times;</button>
                    </span>
                  ))}
                  <form onSubmit={(e) => { e.preventDefault(); addLabel(); }} className="flex items-center">
                    <input type="text" className="input text-xs py-0.5 px-2 w-24" placeholder="+ 标签"
                      value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                    />
                  </form>
                </div>
              </div>

              {/* Comments */}
              <Comments pageId={Number(pageId!)} />
            </div>
          </div>

          {/* Right sidebar: TOC + versions + attachments */}
          <div className="flex">
            <TableOfContents editor={editor} />
            {(showVersions || attachments.length > 0) && (
              <aside className="w-64 border-l border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 overflow-auto shrink-0 hidden lg:block">
                {showVersions && (
                  <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">版本历史</h3>
                      <button onClick={() => setShowVersions(false)} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-auto">
                      {versions.map((v: any) => (
                        <div key={v.id} className="text-xs p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 dark:text-gray-100">v{v.version}</span>
                            <button onClick={() => restoreVersion(v)} className="text-blue-600 hover:underline text-xs">恢复</button>
                          </div>
                          <div className="text-gray-400">{v.author_name} · {new Date(v.created_at).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {attachments.length > 0 && (
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-3 text-gray-900 dark:text-gray-100">附件</h3>
                    <div className="space-y-2">
                      {attachments.map((a: any) => (
                        <div key={a.id} className="flex items-center justify-between text-xs p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 group">
                          <a href={`/uploads/${a.filename}`} target="_blank" rel="noopener" className="truncate flex-1 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">{a.original_name}</a>
                          <button onClick={() => handleDeleteAttachment(a.id)} className="text-gray-400 hover:text-red-500 ml-2 opacity-0 group-hover:opacity-100"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
