// Cloudflare Pages Middleware - 访客信息抓取
// 此中间件会在所有请求上执行，包括静态资源

export async function onRequest(context) {
  const { request, env, next } = context;

  // 只抓取页面请求（排除静态资源）
  const url = new URL(request.url);
  const isStaticAsset = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt)$/.test(url.pathname);
  const isApiRequest = url.pathname.startsWith('/api/');

  // 抓取访客信息（异步执行，不阻塞响应）
  if (!isStaticAsset && !isApiRequest) {
    // 使用 waitUntil 确保数据存储在后台完成，不阻塞页面响应
    context.waitUntil(logVisitor(context));
  }

  // 继续处理请求
  return next();
}

// 抓取并存储访客信息
async function logVisitor(context) {
  const { request, env } = context;

  try {
    // 获取 CF 专属信息
    const cf = request.cf || {};

    // 构建访客数据
    const visitorData = {
      // 基础信息
      ip: request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown',
      country: cf.country || 'unknown',
      city: cf.city || 'unknown',
      region: cf.region || 'unknown',
      timezone: cf.timezone || 'unknown',

      // 请求信息
      url: request.url,
      path: new URL(request.url).pathname,
      method: request.method,
      timestamp: new Date().toISOString(),

      // 客户端信息
      userAgent: request.headers.get('user-agent') || 'unknown',
      referer: request.headers.get('referer') || 'direct',
      acceptLanguage: request.headers.get('accept-language') || 'unknown',

      // 技术信息
      tlsVersion: cf.tlsVersion || 'unknown',
      httpProtocol: cf.httpProtocol || 'unknown',
      asn: cf.asn?.toString() || 'unknown',
      isp: cf.asOrganization || 'unknown',

      // 设备指纹（简单版）
      fingerprint: generateFingerprint(request)
    };

    // 存储到 D1 数据库（如果配置了 DB）
    if (env.DB) {
      await saveToD1(env.DB, visitorData);
    }

    // 同时存储到 KV（如果配置了 KV）- 用于实时统计
    if (env.VISIT_LOGS) {
      await saveToKV(env.VISIT_LOGS, visitorData);
    }

    // 控制台输出（开发调试）
    console.log(`[Visitor] ${visitorData.ip} | ${visitorData.country} | ${visitorData.path}`);

  } catch (error) {
    // 记录错误但不影响正常请求
    console.error('[Visitor Log Error]:', error);
  }
}

// 存储到 D1 数据库
async function saveToD1(db, data) {
  try {
    await db.prepare(`
      INSERT INTO visitor_logs (
        ip, country, city, region, timezone, url, path, method, timestamp,
        user_agent, referer, accept_language, tls_version, http_protocol, asn, isp, fingerprint
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.ip,
      data.country,
      data.city,
      data.region,
      data.timezone,
      data.url,
      data.path,
      data.method,
      data.timestamp,
      data.userAgent,
      data.referer,
      data.acceptLanguage,
      data.tlsVersion,
      data.httpProtocol,
      data.asn,
      data.isp,
      data.fingerprint
    ).run();

  } catch (error) {
    console.error('[D1 Save Error]:', error);
  }
}

// 存储到 KV（用于实时统计和频率限制）
async function saveToKV(kv, data) {
  try {
    const date = new Date();
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const hourKey = `${dateKey}_${date.getHours().toString().padStart(2, '0')}`;

    // 按小时统计访问数
    const hourCount = await kv.get(`stats:hour:${hourKey}`) || '0';
    await kv.put(`stats:hour:${hourKey}`, (parseInt(hourCount) + 1).toString());

    // 按国家统计
    const countryKey = `stats:country:${dateKey}:${data.country}`;
    const countryCount = await kv.get(countryKey) || '0';
    await kv.put(countryKey, (parseInt(countryCount) + 1).toString());

    // 按页面统计
    const pageKey = `stats:page:${dateKey}:${data.path}`;
    const pageCount = await kv.get(pageKey) || '0';
    await kv.put(pageKey, (parseInt(pageCount) + 1).toString());

    // 存储最近访问（保留最近 100 条）
    const recentKey = 'recent_visits';
    const recent = JSON.parse(await kv.get(recentKey) || '[]');
    recent.unshift({
      ip: data.ip,
      country: data.country,
      path: data.path,
      timestamp: data.timestamp
    });
    if (recent.length > 100) recent.pop();
    await kv.put(recentKey, JSON.stringify(recent));

  } catch (error) {
    console.error('[KV Save Error]:', error);
  }
}

// 生成简单设备指纹
function generateFingerprint(request) {
  const headers = request.headers;
  const components = [
    headers.get('user-agent'),
    headers.get('accept-language'),
    headers.get('accept-encoding'),
    headers.get('dnt')
  ].filter(Boolean).join('|');

  // 简单哈希
  let hash = 0;
  for (let i = 0; i < components.length; i++) {
    const char = components.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}
