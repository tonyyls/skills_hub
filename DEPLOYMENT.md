# Skills Hub 部署指南（Vercel）

> 本文档说明如何将本项目部署到 **Vercel** 生产环境，并正确配置前端与服务端环境变量。

## 1. 构建与框架
- 构建命令：`pnpm run build`
- 产物目录：`dist/`
- 前端框架：Vite + Vue3
- 服务端：Vercel Serverless（`api/index.ts` 作为入口，Express 应用在 `api/app.ts`）

## 2. 环境变量
请在 Vercel 项目 Settings → Environment Variables 中添加以下变量（不要提交到仓库）：

### 前端（Vite）
- `VITE_SUPABASE_URL`：Supabase 项目 URL
- `VITE_SUPABASE_ANON_KEY`：Supabase 匿名 Key（仅前端可用）
- `VITE_SUPABASE_SERVICE_ROLE_KEY`：仅用于脚本（如批量导入），不要在前端使用

### 服务端（Serverless Functions）
- `SUPABASE_SERVICE_ROLE_KEY`：Supabase Service Role Key（仅服务端使用）
- `ADMIN_USERNAME`：管理员用户名（生产不要使用默认值）
- `ADMIN_PASSWORD`：管理员密码（生产不要使用默认值）
- `ADMIN_JWT_SECRET`：管理员 JWT 密钥（必须设置为强随机值）

参考 `.env.example`，本地开发可复制为 `.env.local`。

## 3. 路由与重写
`vercel.json` 已配置：
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
- 前端所有路由走 `index.html`（SPA）。
- `/api/*` 路径由 Vercel Serverless 函数处理。

## 4. 启动与调试
- 本地前端：`pnpm run dev`
- 本地后端：`pnpm run start:api`（端口默认 `3010`，由 `nodemon.json` 控制）
- 本地前后端联调：Vite 代理在 `vite.config.ts` 中配置了 `/api` 到 `http://127.0.0.1:3010`。

## 5. 安全建议
- **切勿**在仓库中提交真实密钥；使用 `.env.local` + `.gitignore` 避免泄露。
- 生产环境的 `ADMIN_*` 与 `ADMIN_JWT_SECRET` 必须是强随机值，并与数据库中管理员同步。
- `SUPABASE_SERVICE_ROLE_KEY` 仅在服务端使用，前端不要引用。

## 6. 常见问题
- 构建类型检查报错：当前 `build` 不含 `vue-tsc`，可使用 `pnpm run check` 单独执行并逐步修复再恢复到构建流程。
- Serverless 404：确认 `vercel.json` 的重写规则生效，且 `api/index.ts` 导出默认 `handler`。

---
如需 CI/CD 与预览环境区分，可在 Vercel 中分别设置 **Preview** 与 **Production** 环境变量。