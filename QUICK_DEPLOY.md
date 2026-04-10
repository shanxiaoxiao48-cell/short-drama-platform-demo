# 短剧翻译平台 - 部署指南

## 🚀 快速部署

### 方式一：Vercel部署 (推荐)

1. **准备代码仓库**
   ```bash
   # 将项目推送到GitHub
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Vercel部署**
   - 访问 [vercel.com](https://vercel.com)
   - 连接GitHub账号
   - 选择项目仓库
   - 点击Deploy

3. **自动部署**
   - 每次推送代码到main分支会自动部署
   - 部署完成后获得访问链接

### 方式二：本地部署

1. **安装依赖**
   ```bash
   npm install
   ```

2. **构建项目**
   ```bash
   npm run build
   ```

3. **启动服务**
   ```bash
   npm start
   ```

4. **访问应用**
   - 打开浏览器访问: http://localhost:3000

### 方式三：Docker部署

1. **创建Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3000
   
   CMD ["npm", "start"]
   ```

2. **构建镜像**
   ```bash
   docker build -t short-drama-platform .
   ```

3. **运行容器**
   ```bash
   docker run -p 3000:3000 short-drama-platform
   ```

## ⚙️ 环境配置

### 环境变量 (可选)
创建 `.env.local` 文件：

```env
# 应用配置
NEXT_PUBLIC_APP_NAME=短剧翻译平台
NEXT_PUBLIC_APP_VERSION=1.0.0

# API配置 (如果有后端API)
# NEXT_PUBLIC_API_URL=https://api.example.com

# 其他配置
# NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### 生产环境优化

1. **性能优化**
   ```javascript
   // next.config.mjs
   const nextConfig = {
     compress: true,
     poweredByHeader: false,
     generateEtags: false,
     images: {
       domains: ['your-domain.com'],
     },
   }
   ```

2. **缓存配置**
   - 静态资源自动缓存
   - API响应可配置缓存策略

## 🔧 常见问题

### Q: 部署后页面空白？
A: 检查构建日志，确保没有TypeScript错误

### Q: 图片无法显示？
A: 确保图片文件在public目录下，检查路径是否正确

### Q: 样式丢失？
A: 确保Tailwind CSS配置正确，检查globals.css是否正确导入

### Q: 路由404错误？
A: 确保使用Next.js的Link组件进行页面跳转

## 📊 监控和维护

### 性能监控
- 使用Vercel Analytics (如果部署在Vercel)
- 或集成Google Analytics

### 错误监控
- 可集成Sentry等错误监控服务
- 查看Vercel部署日志

### 更新部署
```bash
# 更新代码
git add .
git commit -m "Update features"
git push origin main

# Vercel会自动重新部署
```

## 🛡️ 安全建议

1. **环境变量**
   - 敏感信息使用环境变量
   - 不要将密钥提交到代码仓库

2. **HTTPS**
   - 生产环境必须使用HTTPS
   - Vercel自动提供SSL证书

3. **CSP配置**
   ```javascript
   // next.config.mjs
   const nextConfig = {
     async headers() {
       return [
         {
           source: '/(.*)',
           headers: [
             {
               key: 'Content-Security-Policy',
               value: "default-src 'self'; script-src 'self' 'unsafe-eval';"
             }
           ]
         }
       ]
     }
   }
   ```

## 📈 扩展部署

### 多环境部署
- 开发环境: `dev` 分支
- 测试环境: `staging` 分支  
- 生产环境: `main` 分支

### CI/CD流程
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
```

---

**提示**: 这是一个前端项目，使用Mock数据。如需连接真实后端，请修改API调用部分。