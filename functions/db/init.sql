-- D1 数据库初始化脚本 - 访客日志表
-- 在 Cloudflare Dashboard 中执行此 SQL 创建表

-- 访客日志主表
CREATE TABLE IF NOT EXISTS visitor_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT NOT NULL,
    country TEXT,
    city TEXT,
    region TEXT,
    timezone TEXT,
    url TEXT,
    path TEXT,
    method TEXT,
    timestamp TEXT NOT NULL,
    user_agent TEXT,
    referer TEXT,
    accept_language TEXT,
    tls_version TEXT,
    http_protocol TEXT,
    asn TEXT,
    isp TEXT,
    fingerprint TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_timestamp ON visitor_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_ip ON visitor_logs(ip);
CREATE INDEX IF NOT EXISTS idx_country ON visitor_logs(country);
CREATE INDEX IF NOT EXISTS idx_path ON visitor_logs(path);
CREATE INDEX IF NOT EXISTS idx_created_at ON visitor_logs(created_at);

-- 每日统计表（预聚合，提高查询效率）
CREATE TABLE IF NOT EXISTS daily_stats (
    date TEXT PRIMARY KEY,
    total_visits INTEGER DEFAULT 0,
    unique_ips INTEGER DEFAULT 0,
    top_countries TEXT, -- JSON 格式
    top_pages TEXT,     -- JSON 格式
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 访问频率限制表（用于防止恶意爬取）
CREATE TABLE IF NOT EXISTS rate_limits (
    ip TEXT PRIMARY KEY,
    request_count INTEGER DEFAULT 1,
    window_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    blocked_until DATETIME
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);
