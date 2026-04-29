import { FileText, ClipboardList, FileCode, BookOpen } from "lucide-react";

const TEMPLATES = [
  {
    id: "blank",
    name: "空白页",
    desc: "从空白页开始",
    icon: FileText,
    content: { type: "doc", content: [{ type: "paragraph" }] },
  },
  {
    id: "meeting",
    name: "会议纪要",
    desc: "会议记录模板",
    icon: ClipboardList,
    content: {
      type: "doc", content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "会议纪要" }] },
        { type: "paragraph", content: [{ type: "text", text: "日期：" }, { type: "text", marks: [{ type: "bold" }], text: "YYYY-MM-DD" }] },
        { type: "paragraph", content: [{ type: "text", text: "参会人：" }] },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "议程" }] },
        { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "议题一" }] }] }] },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "讨论内容" }] },
        { type: "paragraph" },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "行动项" }] },
        { type: "taskList", content: [{ type: "taskItem", content: [{ type: "paragraph" }] }] },
      ],
    },
  },
  {
    id: "api",
    name: "API 文档",
    desc: "接口文档模板",
    icon: FileCode,
    content: {
      type: "doc", content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "API 文档" }] },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "接口说明" }] },
        { type: "paragraph" },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "请求方式" }] },
        { type: "paragraph" },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "请求参数" }] },
        { type: "table", content: [
          { type: "tableRow", content: [
            { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", marks: [{ type: "bold" }], text: "参数名" }] }] },
            { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", marks: [{ type: "bold" }], text: "类型" }] }] },
            { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", marks: [{ type: "bold" }], text: "说明" }] }] },
          ]},
          { type: "tableRow", content: [
            { type: "tableCell", content: [{ type: "paragraph" }] },
            { type: "tableCell", content: [{ type: "paragraph" }] },
            { type: "tableCell", content: [{ type: "paragraph" }] },
          ]},
        ]},
      ],
    },
  },
  {
    id: "docs",
    name: "需求文档",
    desc: "产品需求模板",
    icon: BookOpen,
    content: {
      type: "doc", content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "需求文档" }] },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "背景与目标" }] },
        { type: "paragraph" },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "功能需求" }] },
        { type: "orderedList", content: [
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "功能一" }] }] },
        ]},
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "非功能需求" }] },
        { type: "bulletList", content: [
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "性能要求" }] }] },
        ]},
      ],
    },
  },
];

export function TemplatePicker({ onSelect, onClose }: { onSelect: (content: any) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">选择模板</h2>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.content)}
              className="card p-4 hover:shadow-md transition-shadow text-left"
            >
              <t.icon className="w-8 h-8 text-blue-500 mb-2" />
              <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{t.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="btn btn-secondary w-full mt-4 text-sm">取消</button>
      </div>
    </div>
  );
}
