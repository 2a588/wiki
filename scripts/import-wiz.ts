/**
 * WizNote (为知笔记) 批量导入脚本
 *
 * 用法:
 *   Step 1. 在 WizNote 客户端中，导出笔记文件夹为 Markdown 格式
 *   Step 2. bun run scripts/import-wiz.ts /path/to/export/dir
 *
 * 导出目录结构示例:
 *   export/
 *   ├── 技术文档/
 *   │   ├── 笔记1.md
 *   │   └── 笔记2.md
 *   ├── 项目记录/
 *   │   ├── 笔记3.md
 *   │   └── 笔记4.md
 *   ...
 *
 * 每个文件夹 → 一个 Space，每个 .md 文件 → 一个 Page
 */

const BASE_URL = process.env.WIKI_URL || "http://localhost:3456";
const USERNAME = process.env.WIKI_USER || "admin";
const PASSWORD = process.env.WIKI_PASS || "123456";

let TOKEN = "";

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      ...(options?.headers || {}),
    },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "API error");
  return data.data;
}

async function login() {
  console.log(`🔑 登录 ${BASE_URL} ...`);
  const data = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  });
  TOKEN = data.token;
  console.log(`✅ 登录成功: ${data.user.displayName}`);
}

// Markdown → Tiptap JSON
function markdownToTiptap(md: string) {
  const content: any[] = [];
  const lines = md.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const nextLine = lines[i + 1];

    // Code block (```)
    if (line.trimStart().startsWith("```")) {
      const lang = line.trimStart().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      const codeAttrs: any = {};
      if (lang) codeAttrs.language = lang;
      content.push({
        type: "codeBlock",
        attrs: codeAttrs,
        content: [{ type: "text", text: codeLines.join("\n") }],
      });
      continue;
    }

    // Horizontal rule
    if (/^---+\s*$/.test(line) || /^\*\*\*+\s*$/.test(line)) {
      content.push({ type: "horizontalRule" });
      i++;
      continue;
    }

    // Heading
    const hMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (hMatch) {
      const level = hMatch[1].length;
      const text = inlineParse(hMatch[2]);
      content.push({
        type: "heading",
        attrs: { level },
        content: [{ type: "text", text }],
      });
      i++;
      continue;
    }

    // Blockquote
    if (line.trimStart().startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith("> ")) {
        quoteLines.push(lines[i].trimStart().slice(2));
        i++;
      }
      content.push({
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: quoteLines.join("\n") }],
          },
        ],
      });
      continue;
    }

    // Unordered list
    if (/^[-*+]\s+/.test(line.trimStart())) {
      const listItems: any[] = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trimStart())) {
        listItems.push({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: inlineParse(lines[i].trimStart().replace(/^[-*+]\s+/, "")) },
              ],
            },
          ],
        });
        i++;
      }
      content.push({ type: "bulletList", content: listItems });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line.trimStart())) {
      const listItems: any[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trimStart())) {
        listItems.push({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: inlineParse(lines[i].trimStart().replace(/^\d+\.\s+/, "")) },
              ],
            },
          ],
        });
        i++;
      }
      content.push({ type: "orderedList", content: listItems });
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph (default)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trimStart().startsWith("#") &&
      !lines[i].trimStart().startsWith("```") &&
      !lines[i].trimStart().startsWith("> ") &&
      !/^[-*+]\s+/.test(lines[i].trimStart()) &&
      !/^\d+\.\s+/.test(lines[i].trimStart()) &&
      !/^---+\s*$/.test(lines[i]) &&
      !/^\*\*\*+\s*$/.test(lines[i])
    ) {
      if (lines[i].trim() !== "") paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      content.push({
        type: "paragraph",
        content: [{ type: "text", text: inlineParse(paraLines.join("\n")) }],
      });
    }
  }

  return { type: "doc", content: content.length > 0 ? content : [{ type: "paragraph" }] };
}

function inlineParse(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1 ($2)")
    .replace(/~~(.+?)~~/g, "$1");
}

async function importDir(dirPath: string) {
  const fs = await import("fs");
  const path = await import("path");

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const folders = entries.filter((e) => e.isDirectory());
  const mdFiles = entries.filter((e) => e.isFile() && e.name.endsWith(".md"));

  // Import root-level .md files into a default space
  if (mdFiles.length > 0) {
    const spaceName = path.basename(dirPath);
    let space: any;
    try {
      space = await api("/spaces", {
        method: "POST",
        body: JSON.stringify({
          key: slugify(spaceName),
          name: spaceName,
          description: `从 WizNote 导入 - ${spaceName}`,
        }),
      });
      console.log(`  📁 创建空间: ${space.name}`);
    } catch {
      // Space may already exist
      const spaces = await api("/spaces");
      space = spaces.find((s: any) => s.key === slugify(spaceName));
      if (!space) throw new Error(`Cannot create space for ${spaceName}`);
      console.log(`  📁 使用已有空间: ${space.name}`);
    }

    for (const file of mdFiles) {
      await importMdFile(path.join(dirPath, file.name), space.id);
    }
  }

  // Recursively process subdirectories (each becomes a space)
  for (const folder of folders) {
    const folderPath = path.join(dirPath, folder.name);
    const spaceName = folder.name;
    let space: any;

    try {
      space = await api("/spaces", {
        method: "POST",
        body: JSON.stringify({
          key: slugify(spaceName),
          name: spaceName,
          description: `从 WizNote 导入 - ${spaceName}`,
        }),
      });
      console.log(`📁 创建空间: ${space.name}`);
    } catch {
      const spaces = await api("/spaces");
      space = spaces.find((s: any) => s.key === slugify(spaceName));
      if (!space) throw new Error(`Cannot create space for ${spaceName}`);
      console.log(`📁 使用已有空间: ${space.name}`);
    }

    const subFiles = fs.readdirSync(folderPath).filter((f: string) => f.endsWith(".md"));
    for (const file of subFiles) {
      await importMdFile(path.join(folderPath, file), space.id);
    }
  }
}

async function importMdFile(filePath: string, spaceId: number) {
  const fs = await import("fs");
  const path = await import("path");

  const content = fs.readFileSync(filePath, "utf-8");
  const basename = path.basename(filePath, ".md");

  // Try to extract title from first heading
  let title = basename;
  const firstLine = content.trim().split("\n")[0];
  const h1Match = firstLine?.match(/^#\s+(.+)$/);
  if (h1Match) title = h1Match[1];

  const tiptapContent = markdownToTiptap(content);

  try {
    const page = await api("/pages", {
      method: "POST",
      body: JSON.stringify({
        spaceId,
        title,
        content: JSON.stringify(tiptapContent),
      }),
    });
    console.log(`  📄 ${title}`);
    return page;
  } catch (err: any) {
    console.error(`  ❌ 导入失败: ${title} - ${err.message}`);
    return null;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "")
    || `import-${Date.now()}`;
}

// Main
async function main() {
  const dir = process.argv[2];
  if (!dir) {
    console.error("请指定 WizNote 导出目录路径");
    console.error("用法: bun run scripts/import-wiz.ts /path/to/export/dir");
    process.exit(1);
  }

  const fs = await import("fs");
  if (!fs.existsSync(dir)) {
    console.error(`目录不存在: ${dir}`);
    process.exit(1);
  }

  console.log(`📚 WizNote 导入工具`);
  console.log(`   目录: ${dir}`);
  console.log();

  await login();
  console.log();
  await importDir(dir);

  console.log();
  console.log("✅ 导入完成！");
}

main().catch((err) => {
  console.error("❌ 导入失败:", err.message);
  process.exit(1);
});
