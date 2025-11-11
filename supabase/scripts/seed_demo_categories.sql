-- Seed demo categories into public.categories
-- Use upsert on unique slug to make operation idempotent.

BEGIN;

INSERT INTO public.categories (name, name_en, slug, description, description_en, is_active, sort_order)
VALUES
  ('官方服务器', 'Official Servers', 'official-servers', '官方服务器与服务集成', 'Official servers and service integrations', true, 1),
  ('研究与数据', 'Research And Data', 'research-and-data', '研究与数据处理工具与平台', 'Research and data tools and platforms', true, 2),
  ('云平台', 'Cloud Platforms', 'cloud-platforms', '云计算平台与服务', 'Cloud computing platforms and services', true, 3),
  ('浏览器自动化', 'Browser Automation', 'browser-automation', '浏览器脚本与自动化', 'Browser scripting and automation', true, 4),
  ('数据库', 'Databases', 'databases', '数据库与数据存储', 'Databases and data storage', true, 5),
  ('AI 聊天机器人', 'AI Chatbot', 'ai-chatbot', '聊天机器人与对话式 AI', 'Chatbots and conversational AI', true, 6),
  ('文件系统', 'File Systems', 'file-systems', '文件系统与存储管理', 'File systems and storage management', true, 7),
  ('操作系统自动化', 'Os Automation', 'os-automation', '操作系统自动化与脚本', 'Operating system automation and scripting', true, 8),
  ('金融', 'Finance', 'finance', '金融与交易相关工具', 'Finance and trading tools', true, 9),
  ('通信', 'Communication', 'communication', '消息通信与协作', 'Messaging, communication and collaboration', true, 10),
  ('开发者工具', 'Developer Tools', 'developer-tools', '开发者工具与生产力', 'Developer tools and productivity', true, 11),
  ('知识与记忆', 'Knowledge And Memory', 'knowledge-and-memory', '知识库与记忆管理', 'Knowledge base and memory management', true, 12),
  ('娱乐与媒体', 'Entertainment And Media', 'entertainment-and-media', '娱乐、媒体与内容', 'Entertainment, media and content', true, 13)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  description = EXCLUDED.description,
  description_en = EXCLUDED.description_en,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

COMMIT;