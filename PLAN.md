# Wiki 优化方案 — 对标 Confluence

## 一、信息架构与导航

### 1.1 首页 Dashboard
> Confluence 的 Dashboard 是工作入口。

**目标：** 将当前空白首页改造为信息聚合页。

| 模块 | 说明 |
|------|------|
| 🔥 最近编辑 | 展示用户最近编辑的 10 个页面（标题、时间、所属空间） |
| ⭐ 收藏页面 | 用户标记收藏的页面列表 |
| 📌 快捷入口 | 常用空间的快速跳转卡片 |
| 📊 空间概览 | 每个空间的页面数、最近更新时间统计 |
| 👤 个人动态 | 当前用户的编辑历史、创建记录 |

**后端新增：** `GET /api/dashboard` 聚合接口
**前端新增：** `DashboardPage.tsx` + `DashboardCard` 组件

### 1.2 面包屑导航
> Confluence 每页顶部显示空间 > 父页面 > 当前页面的层级。

- 编辑器顶部显示：`空间名 › 父页面 › 当前页面`
- 点击可快速跳转
- **后端新增：** 页面 API 返回 `ancestors[]` 路径

### 1.3 响应式侧边栏
> Confluence 侧边栏可收起/展开。

- 侧边栏增加折叠按钮
- 小屏自动隐藏，显示汉堡菜单
- 添加**页面树搜索**（快速筛选页面）

---

## 二、编辑器体验升级

### 2.1 Slash 命令菜单
> 输入 `/` 弹出命令面板，类似 Notion / Confluence。

```
/1  标题1     /2  标题2     /3  标题3
/bq 引用      /cb 代码块    /tb 表格
/tl 任务列表  /ul 列表      /ol 有序列表
/hr 分割线    /img 图片     /lnk 链接
```

**实现：** Tiptap `SlashCommand` 扩展（自定义 Extension + Popover）

### 2.2 自动保存
> Confluence 有实时自动保存。

- 内容变更后 5s 无操作自动保存
- 显示 "已保存 / 保存中 / 未保存" 状态指示器
- 不创建新版本（仅定时保存触发版本创建）

### 2.3 全宽 / 默认宽切换
> Confluence 编辑器右上角有宽幅切换按钮。

- 编辑器增加宽幅切换
- 默认宽度 `max-w-4xl`
- 全宽模式取消最大宽度限制

### 2.4 行内评论
> Confluence 选中文本后出现评论按钮。

- 选中文本 → 浮动工具栏 → "评论"
- 评论显示在右侧面板
- 后端已有评论 API，只需前端 UI

### 2.5 目录生成（Table of Contents）
> 长文档自动生成目录导航。

- 基于 `h1/h2/h3` 自动提取标题
- 编辑器右侧显示浮动 TOC
- 点击滚动到对应标题

### 2.6 Emoji 选择器
> Confluence 支持丰富的 emoji 反应和图标。

- 标题前的 emoji 使用完整的 emoji picker（而非固定 20 个）
- 使用 `emoji-mart` 或简化的 emoji 面板

---

## 三、页面交互增强

### 3.1 拖拽排序
> Confluence 页面树可直接拖拽调整层级和顺序。

- 后端已有 `PUT /:id/move` API
- 前端集成 `dnd-kit` 拖拽库
- 支持：拖拽到同级调整顺序、拖拽为子页面

### 3.2 回收站
> Confluence 有 Trash 可恢复已删除页面。

- 软删除：在 pages 表增加 `deleted_at` 字段
- 回收站页面：显示 30 天内可恢复的页面
- 空回收站自动物理删除
- 空间级回收站

### 3.3 页面模板
> Confluence 提供空白页、会议记录、决策日志等模板。

- 定义 JSON 模板格式
- 新建页面时弹出模板选择器
- 内置模板：空白页、会议纪要、需求文档、API 文档

### 3.4 页面标签 / 分类
> Confluence 用 Label 组织内容。

- **新增 `page_labels` 表**：`(id, page_id, label, created_by)`
- 编辑器底部可添加标签
- 标签聚合页：按标签展示页面列表
- 标签搜索建议

### 3.5 收藏 / 关注
> Confluence Star 功能。

- **新增 `favorites` 表**：`(id, user_id, page_id, created_at)`
- 页面顶部星标按钮
- Dashboard 显示收藏列表
- 关注页面有更新时通知

---

## 四、UI / 视觉优化

### 4.1 加载骨架屏
当前加载状态："加载中..." → 改为 Skeleton 骨架屏动画。

### 4.2 Toast 通知
当前错误提示：`alert()` / `confirm()` → 改用 Toast 通知组件。

### 4.3 图片灯箱
编辑器内图片点击 → 全屏 Lightbox 预览。

### 4.4 页面动画
路由切换 + 列表展开/折叠 使用 `framer-motion` 过渡动画。

### 4.5 编辑器 `/` 菜单动画
弹出/收起时带平滑过渡。

### 4.6 图标系统升级
当前 text emoji → 使用 SVG 图标库（Heroicons 或 Lucide）+ emoji 混合。

---

## 五、协作与社交

### 5.1 页面评论 UI
> Confluence 页面底部有评论线程。

- 前端实现评论组件（列表 + 输入框）
- 支持回复（嵌套评论）
- 后端已有完整 API
- 编辑器右侧面板展示

### 5.2 @提及用户
> 输入 @ 弹出用户选择器。

- Tiptap Mention 扩展
- 自动完成用户列表
- 存储为特殊节点，渲染为 pill 样式

### 5.3 页面历史对比
> Confluence 的版本对比显示增删差异。

- 选中两个版本 → Diff 视图
- 使用 `diff` 库对比 JSON/HTML
- 红色删除行 / 绿色新增行

### 5.4 编辑者信息
> 页面顶部显示"最后编辑：张三 · 5 分钟前"。

---

## 六、数据与设置

### 6.1 用户设置页
> 修改密码、显示名称、头像。

- 无头像 → 用首字母圆形头像替代
- 修改密码 API

### 6.2 空间设置
> 空间 icon、描述、删除的完整编辑界面。

- 当前空间编辑用弹窗
- 改为独立设置页：编辑信息 + 删除空间 + 成员管理

### 6.3 Markdown 导入
> 上传 .md 文件自动创建页面。

- 解析 Frontmatter（标题、标签）
- 使用 `marked` 或自定义转换器转为 Tiptap JSON

### 6.4 PDF 导出
> 页面内容导出为 PDF。

- 使用浏览器 `window.print()` 或 `jsPDF`

---

## 七、实施优先级

| 阶段 | 功能 | 复杂度 | 影响面 |
|------|------|--------|--------|
| **P0 核心体验** | 自动保存 | ⭐⭐ | 编辑器 |
| | Slash 命令菜单 | ⭐⭐⭐ | 编辑器 |
| | Toast 通知替代 alert | ⭐ | 全局 |
| | 加载骨架屏 | ⭐ | 全局 |
| | Dashboard 首页 | ⭐⭐⭐ | 新页面 |
| **P1 日常增强** | 面包屑导航 | ⭐ | 编辑器 |
| | 页面评论 UI | ⭐⭐⭐ | 新功能 |
| | 全宽切换 | ⭐ | 编辑器 |
| | 拖拽排序 | ⭐⭐⭐ | 页面树 |
| | 目录生成 TOC | ⭐⭐ | 编辑器 |
| **P2 内容管理** | 回收站 | ⭐⭐⭐⭐ | 后端+前端 |
| | 页面模板 | ⭐⭐ | 新建页面 |
| | 标签系统 | ⭐⭐⭐ | 新功能 |
| | 收藏功能 | ⭐⭐ | 新功能 |
| **P3 深度体验** | 版本对比 Diff | ⭐⭐⭐⭐ | 版本历史 |
| | @提及用户 | ⭐⭐⭐ | 编辑器 |
| | 图片灯箱 | ⭐ | 编辑器 |
| | PDF 导出 | ⭐⭐ | 编辑器 |
| | 响应式侧边栏折叠 | ⭐⭐ | 布局 |

---

## 八、数据库变更总览

```sql
-- 标签
CREATE TABLE page_labels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 收藏
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, page_id)
);

-- 页面软删除（pages 表增加字段）
-- ALTER TABLE pages ADD COLUMN deleted_at TEXT;
```

---

## 九、技术选型建议

| 用途 | 推荐库 | 说明 |
|------|--------|------|
| 拖拽排序 | `@dnd-kit/core` | 轻量、React 原生 |
| 动画 | `framer-motion` | 页面过渡 + 列表动画 |
| Emoji Picker | `@emoji-mart/data` + `@emoji-mart/react` | 完整的 emoji 选择器 |
| Toast | 自建简单组件（无需库） | 基于 Zustand 的 toast store |
| Diff | `diff` | 文本行级对比 |
| 骨架屏 | Tailwind `animate-pulse` | 无需额外库 |
| 图标 | `lucide-react` | 一致性好的 SVG 图标 |
