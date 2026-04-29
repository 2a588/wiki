# Wiki MVP - 问题分析与改进计划

## ✅ 已修复的问题

### 🐛 功能性 Bug

- [x] **SpaceCard.tsx 组件定义重复** — 去除重复的定义和 iconFor 未定义引用
- [x] **评论 API 路由路径不匹配** — 独立出 comments.ts 路由，/api/pages/:pageId/comments 和 /api/comments/:id 统一
- [x] **编辑器内容加载时序问题** — 添加 loadedContent ref + 独立 useEffect 确保内容设置
- [x] **附件删除不清理磁盘文件** — 增加错误日志输出
- [x] **大量 catch {} 静默吞错误** — 所有 catch 增加 console.error 输出

### 🎨 UI / 用户体验

- [x] **版本历史可恢复** — 版本列表增加"恢复"按钮，点击后恢复内容到编辑器
- [x] **Ctrl+S 快捷键保存** — 支持 Ctrl+S / Cmd+S 保存
- [x] **未保存提示** — 页面标题含"未保存"标识 + beforeunload 提示
- [x] **页面标题响应式** — 改为 flex-1 + min-w-0 自适应
- [x] **搜索内容优化** — 搜索同时匹配标题和正文内容
- [x] **页面图标编辑** — 添加图标选择器（20 种图标）
- [x] **空白状态优化** — 添加图标 + 引导按钮
- [x] **登录页 autoFocus** — 用户名输入框自动聚焦
- [x] **404 页面** — 添加 NotFoundPage，路由通配符匹配
- [x] **附件侧边栏交互优化** — 添加 lg:block 响应式

### 🧹 代码质量

- [x] **require("fs") → ESM import** — attachments.ts 和 db/index.ts 改为 import
- [x] **Cookie Session 死代码清理** — 移除未使用的 cookie 认证分支
- [x] **页面删除重新排序** — 删除后更新同级页面的 position

### 📋 新功能

- [x] **暗色主题** — 支持类名切换 dark mode，持久化到 localStorage
- [x] **Markdown 导出** — 编辑器工具栏增加 MD 导出按钮

## 🔲 待处理

### 📋 功能缺失

- [ ] **回收站** — 页面和空间软删除
- [ ] **Markdown 导入** — 上传 md 文件创建页面
- [ ] **页面拖拽排序** — 利用已有的 move API 做拖拽重排
- [ ] **使用共享类型** — 前端用 packages/shared 的接口替代 any
- [ ] **自动保存** — 定时自动保存
- [ ] **页面评论 UI** — 后端已有评论 API，前端无界面
- [ ] **协同编辑 (CRDT)**
- [ ] **权限管理**
