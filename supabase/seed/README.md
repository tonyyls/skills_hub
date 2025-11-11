# seed 目录

用于存放开发环境或演示数据的种子脚本（例如 `seed.sql` 或 JSON -> SQL 导入脚本）。

注意事项：
- 不在生产部署流程中自动执行。
- 与 `supabase/scripts` 区分：`seed` 专注于初始化示例数据，`scripts` 面向维护/修复/清理。