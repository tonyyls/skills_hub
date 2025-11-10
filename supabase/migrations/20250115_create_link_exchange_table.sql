-- 创建友情链接交换表
CREATE TABLE IF NOT EXISTS public.link_exchange (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_link_exchange_sort_order ON public.link_exchange(sort_order);
CREATE INDEX IF NOT EXISTS idx_link_exchange_enabled ON public.link_exchange(enabled);
CREATE INDEX IF NOT EXISTS idx_link_exchange_created_at ON public.link_exchange(created_at);

-- 添加注释
COMMENT ON TABLE public.link_exchange IS '友情链接交换表，用于存储网站的外部链接信息';
COMMENT ON COLUMN public.link_exchange.name IS '链接名称';
COMMENT ON COLUMN public.link_exchange.url IS '链接URL';
COMMENT ON COLUMN public.link_exchange.description IS '链接描述';
COMMENT ON COLUMN public.link_exchange.sort_order IS '排序顺序';
COMMENT ON COLUMN public.link_exchange.enabled IS '是否启用';

-- 启用行级安全策略（如果需要的话）
-- ALTER TABLE public.link_exchange ENABLE ROW LEVEL SECURITY;