# 短剧翻译平台 Demo

一个专业的短剧翻译管理平台，支持完整的翻译工作流程、多角色协作和实时编辑。

## 🌐 在线演示

**Demo 地址：** [https://short-drama-platform-demo.vercel.app](https://short-drama-platform-demo.vercel.app)

> 💡 **重要提示：** 
> - 推荐使用 Chrome 浏览器
> - **请将浏览器缩放至 80%** 以获得最佳体验
> - 快捷键：`Ctrl + -` (Windows) 或 `Cmd + -` (Mac)
> - 或点击浏览器地址栏右侧的缩放按钮调整

## ✨ 核心功能

- 📁 **项目管理** - 创建项目、上传视频、配置翻译语言
- 🔄 **工作流程** - AI提取 → 人工翻译 → 质量检查 → 视频压制
- ✏️ **字幕编辑器** - 双语编辑、时间轴调整、实时预览
- 🎨 **画面字管理** - 识别、翻译、定位画面文字
- 📚 **术语表** - 统一术语翻译，保持一致性
- 👥 **权限管理** - 多角色协作，精细权限控制

## 🚀 快速开始

### 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 测试账号

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 管理员 | admin | admin123 | 全部权限 |
| 项目经理 | pm | pm123 | 项目管理 |
| 译者 | translator | trans123 | 翻译编辑 |
| 质检 | checker | check123 | 质量检查 |

## 🏗️ 技术栈

- **框架：** Next.js 14 (App Router)
- **语言：** TypeScript
- **样式：** Tailwind CSS
- **UI 组件：** shadcn/ui
- **状态管理：** React Context

## 📁 项目结构

```
short-drama-platform/
├── app/                    # Next.js 应用路由
│   ├── page.tsx           # 首页
│   └── ...
├── components/            # React 组件
│   ├── dashboard/        # 项目管理
│   ├── workspace/        # 工作台
│   ├── editor/          # 编辑器
│   └── ui/              # UI 组件库
├── contexts/             # React Context
├── lib/                 # 工具函数
├── public/              # 静态资源
└── styles/              # 全局样式
```

## 🎯 工作流程

```
1. 创建项目 → 上传视频
2. AI 提取 → 字幕、画面字、术语表
3. 人工翻译 → 编辑器翻译
4. 质量检查 → 审核确认
5. 视频压制 → 导出成品
```

## 📸 界面预览

### 项目管理
![项目列表](docs/screenshots/projects.png)

### 工作台
![工作台](docs/screenshots/workspace.png)

### 编辑器
![编辑器](docs/screenshots/editor.png)

## 📝 注意事项

- 这是演示版本，数据存储在浏览器本地（localStorage）
- 刷新页面会保留数据，清除缓存会丢失数据
- 最佳体验：Chrome 浏览器 + 80% 缩放

## 📄 文档

- [完整 PRD](SHORT_DRAMA_PLATFORM_PRD.md)
- [部署指南](QUICK_DEPLOY.md)
- [Demo 说明](DEMO_README.md)

## 🔗 相关链接

- [Vercel 部署](https://vercel.com)
- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)

## 📞 联系方式

如有问题或建议，欢迎联系开发团队。

---

**版本：** v1.0.0  
**更新日期：** 2026-01-26  
**许可证：** MIT
