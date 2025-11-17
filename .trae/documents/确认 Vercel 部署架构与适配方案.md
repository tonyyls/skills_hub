## 结论
- **不是传统容器化部署**：Vercel 默认运行在 Serverless Functions 与 Edge Functions（V8 Isolates）模型；不提供用户自定义 Docker 容器的长驻服务。
- **可行架构**：静态资源走 CDN；后端逻辑用 Serverless/Edge；如需容器/长驻进程，推荐独立托管（Cloud Run/ECS/Fly.io/Render/Railway），前端仍用 Vercel。

## 运行模型
- **静态站点/CDN**：构建出的静态文件全球分发。
- **Serverless Functions**（Node.js 等）：按请求触发、短时执行、无长驻状态；文件系统只读、网络受限、存在冷启动与执行时长限制。
  - 官方文档：https://vercel.com/docs/functions/serverless-functions
- **Edge Functions**：基于 V8 Isolates，极低延迟、受更严格的运行时限制；适合轻量逻辑与中间层。
  - 官方文档：https://vercel.com/docs/functions/edge-functions

## 与容器化的差异
- **不支持 Dockerfile 部署**：不提供直接运行自定义容器的能力。
- **无长驻进程**：常驻任务/队列消费者/自管理 WebSocket 服务器不适合直接部署在 Vercel。
- **适合的场景**：API 网关、SSR/SSG、轻量后端、边缘计算逻辑。

## 典型适配方案
- **前后端分离**：
  1) 前端/SSR 部署到 Vercel（Next.js/静态）
  2) 后端容器化服务部署到独立平台（Cloud Run/ECS/Fly.io 等）
  3) 通过环境变量配置后端 API 地址；必要时用 Edge Functions 作为中间层。
- **纯 Serverless**：轻量 API 直接用 Serverless Functions；需要低延迟则用 Edge Functions。

## 配置示例
- `vercel.json`（按需路由到 Serverless/Edge）：
```json
{
  "functions": {
    "api/*.ts": { "runtime": "nodejs18.x" },
    "edge/*.ts": { "runtime": "edge" }
  },
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/edge/(.*)", "dest": "/edge/$1" }
  ]
}
```

## 下一步
- 明确后端需求（是否长驻、是否需容器）
- 若需容器：选用外部容器平台并配置 API 域名；Vercel 前端通过环境变量调用
- 若走 Serverless/Edge：梳理运行时限制与资源需求，按文档落地