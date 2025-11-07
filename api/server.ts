/**
 * local server entry file, for local development
 */
import app from './app.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});

/**
 * 提高 Node HTTP 服务器的超时设置，缓解代理下的 socket hang up。
 * - keepAliveTimeout 用于持久连接（默认 5s），此处提高到 60s。
 * - headersTimeout 应略大于 keepAliveTimeout，避免报错。
 */
try {
  // @ts-expect-error Node http.Server 属性
  (server as any).keepAliveTimeout = 60_000;
  // @ts-expect-error Node http.Server 属性
  (server as any).headersTimeout = 65_000;
} catch {}

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;