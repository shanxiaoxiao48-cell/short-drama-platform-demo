# 🚀 快速部署指南

## 方案：Vercel 一键部署（推荐）

### 第一步：准备 GitHub 仓库

1. **在 GitHub 创建新仓库**
   - 访问：https://github.com/new
   - 仓库名：`short-drama-platform-demo`
   - 设置为 Public（公开）
   - 不要初始化 README

2. **推送代码到 GitHub**
   
   在项目根目录打开终端，执行：
   
   ```bash
   # 初始化 Git（如果还没有）
   git init
   
   # 添加所有文件
   git add .
   
   # 提交
   git commit -m "Initial commit: Short drama platform demo"
   
   # 添加远程仓库（替换成你的仓库地址）
   git remote add origin https://github.com/你的用户名/short-drama-platform-demo.git
   
   # 推送到 GitHub
   git branch -M main
   git push -u origin main
   ```

### 第二步：部署到 Vercel

1. **访问 Vercel**
   - 打开：https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择刚才创建的 GitHub 仓库
   - 点击 "Import"

3. **配置项目**
   - Framework Preset: Next.js（自动检测）
   - Root Directory: `./`（默认）
   - Build Command: `npm run build`（默认）
   - Output Directory: `.next`（默认）
   - 点击 "Deploy"

4. **等待部署**
   - 大约 2-3 分钟
   - 部署成功后会显示链接

5. **获取链接**
   - 格式：`https://short-drama-platform-demo.vercel.app`
   - 或者：`https://short-drama-platform-demo-你的用户名.vercel.app`

### 第三步：在 PRD 中使用

在 `SHORT_DRAMA_PLATFORM_PRD.md` 文件顶部添加：

```markdown
# 短剧翻译平台 PRD

## 📱 产品演示

### 在线体验
🌐 **Demo 地址：** https://your-demo.vercel.app

> 💡 **使用提示：**
> - 推荐使用 Chrome 浏览器
> - 建议缩放至 80% 以获得最佳体验
> - 演示数据存储在浏览器本地

### 测试账号
| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 译者 | translator | trans123 |
| 质检 | checker | check123 |

---
```

## 🎯 完整部署命令（复制粘贴）

```bash
# 1. 初始化并提交
git init
git add .
git commit -m "Short drama platform demo"

# 2. 连接 GitHub（替换成你的仓库地址）
git remote add origin https://github.com/你的用户名/short-drama-platform-demo.git
git branch -M main
git push -u origin main

# 3. 然后去 Vercel 导入项目即可
```

## 📋 检查清单

部署前确认：

- ✅ `package.json` 存在
- ✅ `next.config.mjs` 存在
- ✅ `/public/drama-posters/` 文件夹存在
- ✅ 所有组件文件完整
- ✅ 本地可以正常运行（`npm run dev`）

## 🔧 常见问题

### Q1: 部署失败怎么办？
**A:** 检查 Vercel 的构建日志，通常是依赖问题。确保本地 `npm run build` 可以成功。

### Q2: 图片不显示？
**A:** 确保 `/public/drama-posters/` 文件夹中的图片都已提交到 GitHub。

### Q3: 页面空白？
**A:** 检查浏览器控制台的错误信息，可能是路由配置问题。

### Q4: 想要自定义域名？
**A:** 在 Vercel 项目设置中，可以添加自定义域名。

## 🎨 可选：录制演示视频

如果想要更直观的展示，可以录制演示视频：

### 使用 Loom（推荐）
1. 安装 Loom 浏览器插件
2. 点击录制
3. 演示核心功能（5分钟内）
4. 获得分享链接
5. 在 PRD 中添加：
   ```markdown
   📺 **演示视频：** [观看完整演示](https://loom.com/share/xxx)
   ```

### 使用 OBS Studio（免费）
1. 下载 OBS Studio
2. 设置录制区域
3. 录制演示
4. 上传到 YouTube 或 B站
5. 在 PRD 中添加视频链接

## 📸 可选：添加截图

在 PRD 中添加关键界面截图：

```markdown
### 界面预览

#### 项目管理
![项目列表](https://your-demo.vercel.app/screenshots/projects.png)

#### 工作台
![工作台](https://your-demo.vercel.app/screenshots/workspace.png)

#### 编辑器
![编辑器](https://your-demo.vercel.app/screenshots/editor.png)
```

## ✅ 完成！

部署完成后，您将拥有：
- ✅ 一个可访问的在线 Demo
- ✅ 自动 HTTPS 加密
- ✅ 全球 CDN 加速
- ✅ 自动部署（推送代码即更新）

现在可以在 PRD、演示文档、邮件中直接分享链接了！

---

**需要帮助？** 如果遇到问题，可以查看：
- Vercel 文档：https://vercel.com/docs
- Next.js 文档：https://nextjs.org/docs
