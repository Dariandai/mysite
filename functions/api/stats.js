// API 端点：获取访客统计信息
// 访问路径：/api/stats

export async function onRequestGet(context) {
  const { env, request } = context;

  // 简单的身份验证（通过 query param 或 header）
  const url = new URL(request.url);
  const authToken = url.searchParams.get('token') || request.headers.get('X-Auth-Token');

  // 建议：在 Cloudflare Dashboard 中设置 ADMIN_TOKEN 环境变量
  if (env.ADMIN_TOKEN && authToken !== env.ADMIN_TOKEN) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 获取时间范围参数
    const range = url.searchParams.get('range') || '24h'; // 24h, 7d, 30d
    const limit = parseInt(url.searchParams.get('limit')) || 100;

    let stats = {
      range,
      timestamp: new Date().toISOString()
    };

    // 从 KV 获取实时统计（优先，速度快）
    if (env.VISIT_LOGS) {
      const kvStats = await getKVStats(env.VISIT_LOGS, range);
      stats = { ...stats, ...kvStats };
    }

    // 从 D1 获取详细统计
    if (env.DB) {
      const dbStats = await getDBStats(env.DB, range, limit);
      stats.details = dbStats;
    }

    return new Response(JSON.stringify(stats, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 从 KV 获取统计
async function getKVStats(kv, range) {
  const stats = {
    hourly: {},
    countries: {},
    pages: {},
    recent: []
  };

  try {
    const date = new Date();

    // 根据 range 获取不同时间范围的数据
    let hours = 24;
    if (range === '7d') hours = 24 * 7;
    if (range === '30d') hours = 24 * 30;

    // 获取小时统计
    for (let i = 0; i < Math.min(hours, 48); i++) {
      const d = new Date(date.getTime() - i * 3600000);
      const dateKey = d.toISOString().split('T')[0];
      const hourKey = `${dateKey}_${d.getHours().toString().padStart(2, '0')}`;
      const count = await kv.get(`stats:hour:${hourKey}`);
      if (count) {
        stats.hourly[hourKey] = parseInt(count);
      }
    }

    // 获取今日国家统计
    const today = date.toISOString().split('T')[0];
    const countryList = await kv.list({ prefix: `stats:country:${today}:` });
    for (const key of countryList.keys) {
      const country = key.name.split(':').pop();
      const count = await kv.get(key.name);
      stats.countries[country] = parseInt(count);
    }

    // 获取今日页面统计
    const pageList = await kv.list({ prefix: `stats:page:${today}:` });
    for (const key of pageList.keys) {
      const page = key.name.split(':').pop();
      const count = await kv.get(key.name);
      stats.pages[page] = parseInt(count);
    }

    // 获取最近访问
    const recent = await kv.get('recent_visits');
    if (recent) {
      stats.recent = JSON.parse(recent);
    }

  } catch (error) {
    console.error('[KV Stats Error]:', error);
  }

  return stats;
}

// 从 D1 获取详细统计
async function getDBStats(db, range, limit) {
  const details = {
    totalVisits: 0,
    uniqueIPs: 0,
    topCountries: [],
    topPages: [],
    recentVisits: []
  };

  try {
    // 计算时间范围
    let timeFilter = "datetime('now', '-1 day')";
    if (range === '7d') timeFilter = "datetime('now', '-7 days')";
    if (range === '30d') timeFilter = "datetime('now', '-30 days')";

    // 总访问数
    const totalResult = await db.prepare(`
      SELECT COUNT(*) as count FROM visitor_logs WHERE timestamp > ${timeFilter}
    `).first();
    details.totalVisits = totalResult?.count || 0;

    // 独立 IP 数
    const uniqueResult = await db.prepare(`
      SELECT COUNT(DISTINCT ip) as count FROM visitor_logs WHERE timestamp > ${timeFilter}
    `).first();
    details.uniqueIPs = uniqueResult?.count || 0;

    // Top 10 国家
    const countriesResult = await db.prepare(`
      SELECT country, COUNT(*) as count
      FROM visitor_logs
      WHERE timestamp > ${timeFilter}
      GROUP BY country
      ORDER BY count DESC
      LIMIT 10
    `).all();
    details.topCountries = countriesResult?.results || [];

    // Top 10 页面
    const pagesResult = await db.prepare(`
      SELECT path, COUNT(*) as count
      FROM visitor_logs
      WHERE timestamp > ${timeFilter}
      GROUP BY path
      ORDER BY count DESC
      LIMIT 10
    `).all();
    details.topPages = pagesResult?.results || [];

    // 最近访问记录
    const recentResult = await db.prepare(`
      SELECT ip, country, city, path, timestamp, referer, user_agent
      FROM visitor_logs
      ORDER BY timestamp DESC
      LIMIT ?
    `).bind(limit).all();
    details.recentVisits = recentResult?.results || [];

  } catch (error) {
    console.error('[DB Stats Error]:', error);
  }

  return details;
}
