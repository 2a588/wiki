# AGENTS.md

## 项目概述

Wiki 是一个类似 Confluence 的知识库/文档协作系统，使用 SQLite 作为数据库后端，面向个人和小团队使用。

## 技术栈

### 运行时
- **Bun** v1.3.11 — JavaScript/TypeScript 运行时，内置 HTTP server、SQLite 驱动

### 后端
| 组件 | 选型 | 说明 |
|------|------|------|
| Web 框架 | Hono | 轻量级、类型安全、原生 Bun 支持 |
| 数据库 | SQLite (`bun:sqlite`) | 单文件存储，WAL 模式，开启外键约束 |
| 认证 | Cookie + bcrypt | Session 存储在内存 Map 中 |
| 文件存储 | 本地磁盘 | 存放在项目根目录 `uploads/` |

### 前端
| 组件 | 选型 | 说明 |
|------|------|------|
| 构建工具 | Vite | 开发服务器 + 生产构建 |
| UI 框架 | React 18 + TypeScript | |
| 样式 | Tailwind CSS | 通过 PostCSS 处理 |
| 富文本编辑器 | Tiptap (ProseMirror) | 支持多种扩展 |
| 路由 | React Router v6 | |
| 状态管理 | Zustand | 轻量级状态管理 |

### Tiptap 扩展
- StarterKit (标题、列表、引用、代码块、分割线等)
- Underline、Highlight、Link、Image
- TaskList + TaskItem
- Table + TableRow + TableCell + TableHeader
- CodeBlockLowlight (语法高亮)
- Placeholder

## 项目结构

```
wiki/
├── packages/
│   ├── shared/           # 共享类型定义 (TypeScript interfaces)
│   └── db/               # SQLite schema 初始化
├── apps/
│   ├── server/           # Hono 后端 API
│   │   └── src/
│   │       ├── index.ts              # 入口，静态文件托管 + API 路由
│   │       ├── middleware/auth.ts    # 认证中间件（Session 管理）
│   │       └── routes/
│   │           ├── auth.ts           # 注册/登录/登出/获取当前用户
│   │           ├── spaces.ts         # 空间 CRUD + 页面树
│   │           ├── pages.ts          # 页面 CRUD + 版本历史 + 搜索
│   │           └── attachments.ts    # 附件上传/下载/删除
│   └── web/              # React 前端 SPA
│       └── src/
│           ├── App.tsx               # 路由配置
│           ├── components/
│           │   └── Layout.tsx        # 顶部导航栏 + 搜索
│           ├── pages/
│           │   ├── LoginPage.tsx     # 登录/注册
│           │   ├── SpacesPage.tsx    # 空间列表
│           │   ├── SpaceDetailPage.tsx  # 空间详情 + 页面树
│           │   └── PageEditor.tsx    # 页面编辑器
│           ├── store/auth.ts         # 认证状态 (Zustand)
│           └── lib/api.ts            # API 请求封装
├── uploads/              # 附件存储目录
├── data/                 # SQLite 数据库文件
├── package.json          # Bun workspace 根配置
└── start.sh              # 生产启动脚本
```

## 已实现功能

### 用户认证
- [x] 用户注册（用户名、邮箱、密码、显示名称）
- [x] 用户登录（用户名 + 密码）
- [x] 用户登出
- [x] 获取当前用户信息
- [x] Token 认证（Bearer token）
- [x] 前端自动从 localStorage 恢复登录状态

### 空间管理
- [x] 创建空间（key、name、description、icon）
- [x] 编辑空间
- [x] 删除空间（级联删除页面）
- [x] 空间列表展示（卡片布局）
- [x] 空间页面树状结构

### 页面管理
- [x] 创建页面（指定空间、可选父页面）
- [x] 编辑页面标题和内容
- [x] 删除页面（级联删除子页面，自动重新排序）
- [x] 页面层级（parent_id 自引用）
- [x] 页面树侧边栏（可展开/折叠）
- [x] Slug 自动生成
- [x] 页面图标选择（20 种图标）
- [x] Markdown 导出

### 富文本编辑器
- [x] Tiptap 编辑器 + 工具栏
- [x] 标题 H1/H2/H3
- [x] 粗体、斜体、下划线、删除线
- [x] 无序列表、有序列表、任务列表
- [x] 引用、代码块、行内代码
- [x] 高亮、链接、图片
- [x] 表格（支持行列）
- [x] 分割线
- [x] 内容以 JSON 格式存储

### 版本历史
- [x] 每次保存自动创建新版本
- [x] 版本列表展示（版本号、作者、时间）
- [x] 版本号自动递增
- [x] 版本一键恢复

### 附件管理
- [x] 文件上传（图片自动插入编辑器）
- [x] 文件下载
- [x] 文件删除
- [x] 附件列表展示

### 搜索
- [x] 按标题和正文内容模糊搜索
- [x] 顶部搜索栏实时搜索

## 数据库表结构

```sql
-- 用户表
users (id, username, email, password_hash, display_name, created_at, updated_at)

-- 空间表
spaces (id, key, name, description, icon, created_by, created_at, updated_at)

-- 页面表
pages (id, space_id, parent_id, title, slug, icon, position, created_by, updated_by, created_at, updated_at)

-- 页面版本表
page_versions (id, page_id, content, version, created_by, created_at)

-- 附件表
attachments (id, page_id, filename, original_name, mime_type, size, created_by, created_at)
```

## API 端点

### 认证 `/api/auth`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /register | 注册 |
| POST | /login | 登录 |
| POST | /logout | 登出 |
| GET | /me | 获取当前用户 |

### 空间 `/api/spaces`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | / | 列出所有空间 |
| GET | /:id | 获取单个空间 |
| POST | / | 创建空间 |
| PUT | /:id | 更新空间 |
| DELETE | /:id | 删除空间 |
| GET | /:id/pages | 获取空间页面树 |

### 页面 `/api/pages`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /:id | 获取页面及内容 |
| POST | / | 创建页面 |
| PUT | /:id | 更新页面 |
| DELETE | /:id | 删除页面 |
| GET | /:id/versions | 获取版本历史 |
| GET | /search/:query | 搜索页面 |

### 附件 `/api/attachments`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | / | 上传附件 |
| GET | /page/:pageId | 列出页面附件 |
| GET | /:id | 下载附件 |
| DELETE | /:id | 删除附件 |

## 启动方式

### 开发模式
```bash
bun run dev:server   # 后端 http://localhost:3456
bun run dev:web      # 前端 http://localhost:5173 (通过 proxy 转发 API)
```

### 生产模式
```bash
./start.sh           # 构建前端 + 启动后端，统一在 http://0.0.0.0:3456
```

### 测试账号
```
用户名: admin
密码: 123456
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 3456 | 服务监听端口 |

## 待扩展功能

- [ ] 协同编辑 (CRDT)
- [ ] 页面评论 UI
- [ ] @提及通知
- [ ] 回收站
- [ ] Markdown 导入
- [ ] 页面拖拽排序
- [ ] 权限管理 (空间级)
- [ ] 自动保存
- [ ] 页面模板
