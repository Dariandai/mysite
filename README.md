# Dar1an 作品集

使用 Astro 构建并部署到 Cloudflare Pages 的个人作品集网站。

## 技术栈

- **框架**: [Astro](https://astro.build) 6
- **语言**: TypeScript（严格模式）
- **样式**: CSS 变量 + 自定义属性
- **图标**: [Remix Icon](https://remixicon.com)
- **部署**: Cloudflare Pages（静态输出）

## 功能特性

- 深色极简设计风格
- 堆叠式滚动布局（桌面端 & 移动端，GSAP 驱动）
- 双语显示（中英文）
- 响应式设计
- 组件化结构
- 导航栏滚动模糊效果
- 邮箱一键复制功能
- 内容集合驱动的博客（`src/content/posts/*.md`）
- 手写 sitemap（`src/pages/sitemap.xml.ts`）

## 项目结构

```
/
├── src/
│   ├── components/       # 可复用组件
│   ├── content/          # 内容集合（博客文章）
│   ├── layouts/          # 布局组件
│   │   └── BaseLayout.astro
│   ├── pages/            # 页面路由
│   │   ├── index.astro   # 首页
│   │   ├── about/        # 关于页面
│   │   ├── blog/         # 博客文章（含 catch-all 动态路由）
│   │   ├── portfolio/    # 作品集
│   │   ├── share/        # 工具资源
│   │   └── sitemap.xml.ts# 手写 sitemap
│   ├── scripts/          # 前端脚本
│   │   └── stacking-cards.js  # 堆叠卡片滚动逻辑
│   ├── styles/
│   │   └── global.css    # 全局样式
│   ├── content.config.ts # 内容集合 schema
│   └── global.d.ts
├── functions/            # Cloudflare Pages Functions
├── public/               # 静态资源
└── dist/                 # 构建输出
```

## 常用命令

| 命令              | 操作                                   |
| :---------------- | :------------------------------------- |
| `npm install`     | 安装依赖                               |
| `npm run dev`     | 启动开发服务器 `localhost:4321`        |
| `npm run build`   | 构建生产版本到 `./dist/`               |
| `npm run preview` | 本地预览构建结果                       |
| `npm run check`   | TypeScript 类型检查                    |
| `npm run lint`    | ESLint 检查                            |
| `npm run format`  | Prettier 格式化                        |


### Wrangler CLI

```bash
npx wrangler pages deploy dist
```


## TODO 待办清单

### 性能优化
- [ ] 配置 Cloudflare Auto Minify（CSS/JS/HTML）
- [ ] 配置 Cloudflare Brotli 压缩
- [ ] 添加图片懒加载（`loading="lazy"`）
- [ ] 使用 Astro 图片优化组件（`@astrojs/image`）
- [ ] 添加 WebP/AVIF 图片格式支持

### SEO & 元数据
- [x] 生成 `sitemap.xml`
- [x] 添加 `robots.txt`
- [ ] 添加 Open Graph / Twitter Card 元标签
- [ ] 配置结构化数据（Schema.org JSON-LD）
- [ ] 添加 canonical URL

### 内容管理
- [x] 将博客文章迁移到 Markdown/MDX 文件
- [x] 实现文章标签/分类系统
- [ ] 添加文章阅读时间估算
- [ ] 添加 RSS 订阅支持（`@astrojs/rss`）

### 交互体验
- [ ] 添加页面加载过渡动画
- [ ] 实现键盘导航支持（方向键切换 section）
- [x] 添加触摸滑动支持（移动端手势）
- [x] 优化移动端 Skills 区域的卡片高度

### Cloudflare 特性
- [ ] 配置 Cloudflare Analytics 网站分析
- [ ] 设置 Cloudflare Web Analytics（隐私友好）
- [ ] 配置边缘缓存规则（Cache Rules）
- [ ] 启用 Cloudflare Zaraz 管理第三方脚本（可选）
- [ ] 配置自定义域名（如有）

### 可访问性
- [ ] 添加 `prefers-reduced-motion` 媒体查询支持
- [ ] 优化键盘焦点样式
- [ ] 添加 ARIA 标签到交互元素
- [ ] 检查颜色对比度（WCAG 2.1 AA）

### 开发体验
- [x] 添加 TypeScript 严格模式
- [x] 配置 ESLint + Prettier
- [ ] 添加 pre-commit hooks（Husky）
- [ ] 重新接入 CI/CD（GitHub Actions / Cloudflare）

## 版权

© 2026 Dar1an. 保留所有权利。
