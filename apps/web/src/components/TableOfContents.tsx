import { useState, useEffect } from "react";
import { ListOrdered } from "lucide-react";

export function TableOfContents({ editor }: { editor: any }) {
  const [headings, setHeadings] = useState<{ level: number; text: string; id: string }[]>([]);

  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const items: { level: number; text: string; id: string }[] = [];
      editor.state.doc.descendants((node: any, pos: number) => {
        if (node.type.name === "heading") {
          const text = node.textContent;
          const id = `heading-${pos}`;
          items.push({ level: node.attrs.level, text, id });
        }
      });
      setHeadings(items);
    };
    update();
    editor.on("update", update);
    return () => editor.off("update", update);
  }, [editor]);

  if (headings.length < 2) return null;

  return (
    <div className="hidden xl:block w-56 shrink-0 border-l border-gray-200 dark:border-gray-700 p-4 overflow-auto">
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase">
        <ListOrdered className="w-3.5 h-3.5" /> 目录
      </div>
      <nav className="space-y-1">
        {headings.map((h, i) => (
          <button
            key={i}
            onClick={() => {
              const pos = editor.state.doc.resolve(editor.state.selection.from);
              let found = 0;
              editor.state.doc.descendants((node: any, pos: number) => {
                if (node.type.name === "heading") {
                  if (found === i) {
                    editor.commands.scrollIntoView();
                    editor.commands.setTextSelection({ from: pos, to: pos + 1 });
                    return false;
                  }
                  found++;
                }
              });
            }}
            className={`block text-left w-full text-xs py-1 rounded transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
              h.level === 1 ? "pl-0 font-medium" : h.level === 2 ? "pl-3" : "pl-6"
            } text-gray-600 dark:text-gray-400`}
          >
            {h.text}
          </button>
        ))}
      </nav>
    </div>
  );
}
