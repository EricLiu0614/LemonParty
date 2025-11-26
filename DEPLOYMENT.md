# GitHub Pages 部署指南

本项目已配置为自动部署到 GitHub Pages。

## 自动部署配置

项目使用 GitHub Actions 自动部署。每次推送到 `main` 分支时都会自动构建和部署。

### 部署前的准备工作

#### 1. 在 GitHub 仓库设置中启用 GitHub Pages

1. 进入你的 GitHub 仓库
2. 点击 **Settings** > **Pages**
3. 在 **Source** 下选择 **GitHub Actions**

#### 2. 配置 API Key（可选）

如果需要使用 Gemini AI 功能：

1. 进入仓库的 **Settings** > **Secrets and variables** > **Actions**
2. 点击 **New repository secret**
3. 名称：`GEMINI_API_KEY`
4. 值：你的 Gemini API Key

### 手动部署（使用 gh-pages）

如果你想使用传统的 `gh-pages` 分支部署方式：

```bash
# 安装依赖（如果还没有安装）
npm install

# 构建并部署
npm run deploy
```

这会：
1. 运行 `npm run build` 构建项目
2. 将 `dist` 文件夹的内容推送到 `gh-pages` 分支
3. GitHub Pages 会自动从 `gh-pages` 分支部署

### 本地预览构建结果

```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 配置说明

### 已完成的配置

1. ✅ **vite.config.ts**: 添加了 `base: '/LemonParty/'` 配置
2. ✅ **package.json**: 配置了 `homepage` 和部署脚本
3. ✅ **public/.nojekyll**: 防止 GitHub Pages 忽略下划线开头的文件
4. ✅ **.github/workflows/deploy.yml**: 自动部署工作流

### 部署 URL

项目将部署到：
**https://ericliu0614.github.io/LemonParty**

## 常见问题

### 1. 页面显示 404
- 检查 GitHub Pages 设置是否正确
- 确认 `vite.config.ts` 中的 `base` 路径与仓库名称匹配

### 2. 资源加载失败
- 确保 `base` 路径正确配置
- 检查构建后的 `dist/index.html` 中的资源路径

### 3. GitHub Actions 部署失败
- 检查 Actions 日志
- 确认仓库有 Pages 写入权限

## 开发流程

```bash
# 本地开发
npm run dev

# 构建测试
npm run build
npm run preview

# 推送到 GitHub（会自动触发部署）
git add .
git commit -m "Update"
git push origin main
```

