# 短剧翻译平台

一个完整的短剧翻译管理平台，支持项目管理、翻译编辑、数据分析等核心功能。

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 yarn

### 安装和运行

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 打开浏览器访问
# http://localhost:3000
```

### 构建生产版本

```bash
# 构建
npm run build

# 启动生产服务器
npm start
```

## 📋 核心功能

### 🎬 项目管理
- 短剧项目创建和管理
- 多语种版本支持
- 工作流状态跟踪

### 📝 翻译编辑器
- 可视化字幕编辑
- 实时预览功能
- 字幕样式自定义
- 历史版本管理

### 📊 数据分析仪表盘
- 项目进度统计
- 译员绩效分析
- 成本和ROI分析
- 多维度数据筛选

### 👥 权限管理
- 基于角色的访问控制(RBAC)
- 细粒度权限设置
- 多用户协作支持

### 🔄 工作流管理
- AI提取 → 视频擦除 → 翻译 → 质检 → 成片
- 任务自动分配
- 进度实时跟踪

## 📁 项目结构

```
├── app/                    # Next.js 应用入口
├── components/             # React 组件
│   ├── analytics/         # 数据分析组件
│   ├── dashboard/         # 主仪表盘
│   ├── editor/           # 翻译编辑器
│   ├── layout/           # 布局组件
│   ├── projects/         # 项目管理
│   ├── tasks/            # 任务管理
│   ├── ui/               # 基础UI组件
│   └── workspace/        # 工作空间
├── contexts/              # React Context
├── hooks/                 # 自定义Hooks
├── lib/                   # 工具函数和Mock数据
├── public/                # 静态资源
├── styles/                # 样式文件
└── docs/                  # 设计文档
```

## 📖 重要文档

- [`docs/SHORT_DRAMA_PLATFORM_PRD.md`](docs/SHORT_DRAMA_PLATFORM_PRD.md) - 平台整体产品需求文档
- [`docs/ANALYTICS_DASHBOARD_PRD.md`](docs/ANALYTICS_DASHBOARD_PRD.md) - 数据仪表盘详细设计
- [`docs/PLATFORM_ARCHITECTURE_DESIGN.md`](docs/PLATFORM_ARCHITECTURE_DESIGN.md) - 系统架构设计
- [`docs/DATABASE_SCHEMA_DESIGN.md`](docs/DATABASE_SCHEMA_DESIGN.md) - 数据库设计
- [`docs/RBAC_PERMISSION_RULES.md`](docs/RBAC_PERMISSION_RULES.md) - 权限规则说明
- [`QUICK_DEPLOY.md`](QUICK_DEPLOY.md) - 快速部署指南

## 🛠 技术栈

- **前端框架**: Next.js 14 + React 18
- **UI组件**: shadcn/ui + Tailwind CSS
- **图表库**: Recharts
- **状态管理**: React Hooks + Context
- **类型检查**: TypeScript
- **样式方案**: Tailwind CSS

## 🎨 界面预览

### 主仪表盘
- 项目概览卡片
- 快速操作入口
- 最新动态展示

### 翻译编辑器
- 视频播放器 (支持9:16比例)
- 字幕编辑面板
- 样式设置面板
- 历史版本对比

### 数据分析
- 概览页面 (8个核心指标卡片 + 6个可视化图表)
- 数据列表 (短剧进度、任务进度、译员绩效、投放效果)
- 译员详情页 (个人绩效、任务记录、月度统计)

## 🔧 开发说明

### Mock数据
项目使用Mock数据进行演示，主要数据文件：
- `lib/mock-analytics-data.ts` - 分析数据
- `lib/permissions.ts` - 权限数据
- `lib/progress-utils.ts` - 进度计算
- `lib/upload-utils.ts` - 上传工具

### 组件开发
- 使用shadcn/ui作为基础组件库
- 遵循组件化开发原则
- 支持响应式设计

### 样式规范
- 使用Tailwind CSS
- 支持深色/浅色主题
- 响应式布局适配

## 📝 更新日志

### v1.0.0 (2026-02-01)
- ✅ 完整的项目管理功能
- ✅ 翻译编辑器核心功能
- ✅ 数据分析仪表盘
- ✅ 用户权限管理
- ✅ 工作流管理系统

## 📄 许可证

本项目仅供学习和演示使用。

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目。

---

**注意**: 这是一个演示项目，使用了Mock数据。在生产环境中需要连接真实的后端API。