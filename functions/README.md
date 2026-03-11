# Cloudflare Pages 访客追踪系统

## 概述

此目录包含 Cloudflare Pages Functions，用于抓取和存储访客信息。

## 文件结构

```
functions/
├── _middleware.js          # 主中间件，所有请求都会经过
├── api/
│   └── stats.js            # 统计 API 端点
├── db/
│   └── init.sql            # D1 数据库初始化脚本
└── README.md               # 本文档
```

## 配置步骤

### 1. 创建 D1 数据库

在 Cloudflare Dashboard 中：
1. 进入 **Workers & Pages** → **D1**
2. 点击 **Create a database**
3. 命名为 `visitor-db`
4. 点击 **Console** 标签
5. 复制 `db/init.sql` 中的 SQL 并执行

### 2. 绑定 D1 到 Pages 项目

1. 进入你的 Pages 项目
2. 点击 **Settings** → **Functions**
3. 在 **D1 database bindings** 中添加：
   - Variable name: `DB`
   - D1 database: `visitor-db`

### 3.（可选）创建 KV 命名空间

用于实时统计和频率限制：

1. 进入 **Workers & Pages** → **KV**
2. 点击 **Create a namespace**
3. 命名为 `visit-logs`
4. 在 Pages 项目 **Settings** → **Functions** 中绑定：
   - Variable name: `VISIT_LOGS`
   - KV namespace: `visit-logs`

### 4. 设置管理员 Token（可选）

为了保护统计 API：

1. 在 Pages 项目 **Settings** → **Environment variables** 中添加：
   - Variable name: `ADMIN_TOKEN`
   - Value: 你的随机字符串（如 `your-secure-token-12345`）

## 使用说明

### 自动访客记录

部署后，`_middleware.js` 会自动：
- 抓取每个页面访问的访客信息
- 存储到 D1 和 KV
- 排除静态资源（js/css/图片等）

抓取的字段包括：
- IP 地址（通过 `cf-connecting-ip`）
- 国家/城市/地区（通过 Cloudflare）
- User-Agent
- Referer
- 访问路径
- 时间戳
- TLS 版本
- ASN/ISP

### 查看统计数据

访问统计 API：

```bash
# 24 小时统计（需要 ADMIN_TOKEN）
https://your-domain.com/api/stats?token=your-secure-token-12345

# 7 天统计
https://your-domain.com/api/stats?token=your-secure-token-12345&range=7d

# 30 天统计
https://your-domain.com/api/stats?token=your-secure-token-12345&range=30d

# 限制返回记录数
https://your-domain.com/api/stats?token=your-secure-token-12345&limit=50
```

返回示例：

```json
{
  "range": "24h",
  "timestamp": "2026-03-11T14:30:00.000Z",
  "hourly": {
    "2026-03-11_13": 45,
    "2026-03-11_12": 32
  },
  "countries": {
    "CN": 50,
    "US": 15,
    "JP": 8
  },
  "pages": {
    "/": 30,
    "/blog": 20,
    "/about": 15
  },
  "recent": [
    {
      "ip": "1.2.3.4",
      "country": "CN",
      "path": "/blog",
      "timestamp": "2026-03-11T14:25:00.000Z"
    }
  ],
  "details": {
    "totalVisits": 100,
    "uniqueIPs": 80,
    "topCountries": [
      { "country": "CN", "count": 50 }
    ],
    "topPages": [
      { "path": "/", "count": 30 }
    ],
    "recentVisits": [...]
  }
}
```

## 隐私合规

### GDPR/CCPA 合规建议

1. **添加隐私政策页面**
   - 说明收集的数据类型
   - 数据用途（安全、分析）
   - 数据保留期限

2. **IP 匿名化（可选）**

在 `_middleware.js` 中修改 IP 处理：

```javascript
// 匿名化 IP（移除最后一段）
const rawIp = request.headers.get('cf-connecting-ip') || 'unknown';
const ip = rawIp !== 'unknown'
  ? rawIp.replace(/\.\d+$/, '.0')  // IPv4
  : rawIp;
```

3. **数据保留策略**

定期清理旧数据：

```sql
-- 删除 90 天前的数据
DELETE FROM visitor_logs WHERE timestamp < datetime('now', '-90 days');
```

## 故障排查

### 访客信息未记录

1. 检查 D1 绑定是否正确（Variable name 必须是 `DB`）
2. 检查 `db/init.sql` 是否已执行
3. 查看 Pages Functions 日志：
   - Dashboard → Pages → 你的项目 → Functions → Real-time logs

### 统计 API 返回 401

- 确认 `ADMIN_TOKEN` 环境变量已设置
- 确认 URL 中 `token` 参数正确

### 性能问题

如果访问量很大：

1. 只记录页面访问，排除更多静态资源类型
2. 调整 `waitUntil` 超时设置
3. 考虑使用 D1 的批量插入

## 扩展功能

### 添加频率限制

在 `_middleware.js` 中添加：

```javascript
// 频率限制检查
const ip = request.headers.get('cf-connecting-ip');
const rateKey = `rate:${ip}`;
const requestCount = await env.VISIT_LOGS.get(rateKey) || 0;

if (requestCount > 100) { // 每小时 100 请求
  return new Response('Rate limited', { status: 429 });
}

await env.VISIT_LOGS.put(rateKey, parseInt(requestCount) + 1, {
  expirationTtl: 3600 // 1 小时
});
```

### 添加 Bot 检测

```javascript
const ua = request.headers.get('user-agent') || '';
const isBot = /bot|crawler|spider|crawling/i.test(ua);

if (!isBot) {
  context.waitUntil(logVisitor(context));
}
```

## 费用说明

- **Cloudflare Pages**: 免费（10万次请求/天）
- **D1**: 免费（500万行读取/天，10万行写入/天）
- **KV**: 免费（10万次读取/天，1千次写入/天）

对于个人博客，免费额度完全足够。
