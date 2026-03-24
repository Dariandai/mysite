/**
 * 全屏堆叠卡片系统 v3
 *
 * 核心变更：彻底放弃 position:sticky + window.scroll 方案
 * 改用 position:fixed + GSAP translateY，从根本上解决移动端冲突
 *
 * 原理：
 * - sections 全部 position:fixed，通过 translateY 切换可见性
 * - body overflow:hidden 完全禁止 window scroll（无需 preventDefault hack）
 * - 内容滚动完全交给浏览器原生处理（wrapper overflow-y:auto）
 * - touchstart/touchend 速度检测代替 touchmove 累积 —— 避免动量滚动冲突
 * - wheel 事件先转发给内容，到边界时再切换 section
 */

export class StackingCards {
  constructor(options = {}) {
    this.options = {
      sections: options.sections || 'section',
      transitionDuration: options.transitionDuration || 0.75,
      blurAmount: options.blurAmount || 12,
      // 触摸阈值
      swipeMinDistance: options.swipeMinDistance ?? 40,   // px
      swipeMinVelocity: options.swipeMinVelocity ?? 0.25, // px/ms
      // 鼠标滚轮触发阈值（累积量）
      wheelThreshold: options.wheelThreshold ?? 80,
      onSectionChange: options.onSectionChange || null,
    };

    this.sections     = [];
    this.currentIndex = 0;
    this.isTransitioning = false;

    // wheel 状态
    this._wheelDelta = 0;
    this._wheelTimer = null;

    // 平滑滚动的目标位置（用于累积滚动，实现惯性效果）
    this._contentScrollTarget = null;

    // touch 状态
    this._touchStartY         = 0;
    this._touchStartTime      = 0;
    this._touchStartScrollTop = 0;

    // 绑定引用（用于 removeEventListener）
    this._boundWheel        = this._onWheel.bind(this);
    this._boundTouchStart   = this._onTouchStart.bind(this);
    this._boundTouchEnd     = this._onTouchEnd.bind(this);
    this._boundKey          = this._onKey.bind(this);
    this._boundResize       = this._onResize.bind(this);
    this._boundOrientation  = () => setTimeout(this._boundResize, 400);
  }

  // ─── 公开 API ──────────────────────────────────────────────────────────────

  init() {
    if (typeof window === 'undefined') return;
    if (typeof gsap === 'undefined') {
      setTimeout(() => this.init(), 50);
      return;
    }

    this.sections = Array.from(document.querySelectorAll(this.options.sections));
    if (this.sections.length <= 1) return; // 单页无需特殊处理

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this._initSimple();
      return;
    }

    this._setup();
    this._buildProgressDots();
    this._bindEvents();

    // 确保第一个 section 内容可见（初始加载时无入场动画）
    this._showContentImmediately(0);

    window.stackingCardsInstance = this;

    if (this.options.onSectionChange) {
      this.options.onSectionChange(0, this.sections[0]);
    }
  }

  /**
   * 立即显示 section 内容，无动画（用于初始加载）
   */
  _showContentImmediately(index) {
    const wrapper = this._getWrapper(index);
    if (!wrapper) return;
    const content = wrapper.querySelector('.section-scroll-content');
    if (!content) return;

    const children = Array.from(content.children).filter(
      el => !el.classList.contains('sc-blur-overlay')
    );
    gsap.set(children, { opacity: 1, y: 0, clearProps: 'all' });
  }

  /** 跳转到指定 section（供外部调用） */
  scrollToSection(index) {
    this.goTo(index);
  }

  getCurrentIndex() {
    return this.currentIndex;
  }

  destroy() {
    window.removeEventListener('wheel', this._boundWheel);
    window.removeEventListener('touchstart', this._boundTouchStart);
    window.removeEventListener('touchend', this._boundTouchEnd);
    window.removeEventListener('keydown', this._boundKey);
    window.removeEventListener('resize', this._boundResize);
    window.removeEventListener('orientationchange', this._boundOrientation);
  }

  // ─── 初始化 ────────────────────────────────────────────────────────────────

  _setup() {
    // 锁定 body 滚动（替代 body.style.height = N*100vh 技巧）
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height   = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.height   = '100%';

    this.sections.forEach((section, i) => {
      // 固定定位全屏卡片 - 注意：圆角由 CSS 控制，不在此处设置
      section.style.cssText = `
        position: fixed !important;
        top: 0; left: 0;
        width: 100%; height: 100%;
        overflow: hidden;
        z-index: ${i + 1};
        background-color: var(--bg-color, #050505);
        transform: translateY(${i === 0 ? '0%' : '100%'});
        will-change: transform;
      `;

      // 创建内容滚动容器（仅首次）
      if (!section.querySelector('.section-scroll-wrapper')) {
        const children = Array.from(section.childNodes).filter(
          n => n.nodeType === Node.ELEMENT_NODE
        );

        const wrapper = document.createElement('div');
        wrapper.className = 'section-scroll-wrapper';

        const content = document.createElement('div');
        content.className = 'section-scroll-content';

        children.forEach(child => content.appendChild(child));
        wrapper.appendChild(content);
        section.appendChild(wrapper);
      }

      // 模糊遮罩（用于"被压在下面"的 section）
      if (!section.querySelector('.sc-blur-overlay')) {
        const blur = document.createElement('div');
        blur.className = 'sc-blur-overlay';
        section.appendChild(blur);
      }
    });
  }

  // ─── 进度导航点 ────────────────────────────────────────────────────────────

  _buildProgressDots() {
    const container = document.getElementById('section-nav-dots');
    if (!container || this.sections.length <= 1) return;

    container.innerHTML = '';
    this.sections.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 's-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => this.goTo(i));
      container.appendChild(dot);
    });

    // 同时构建移动端进度指示器
    this._buildMobileProgress();
  }

  _buildMobileProgress() {
    const mobileContainer = document.getElementById('mobile-dots');
    if (!mobileContainer || this.sections.length <= 1) return;

    mobileContainer.innerHTML = '';
    this.sections.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'm-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => this.goTo(i));
      mobileContainer.appendChild(dot);
    });

    // 更新进度文本
    this._updateMobileProgress();
  }

  _updateProgressDots() {
    const dots = document.querySelectorAll('.s-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentIndex);
    });

    // 同时更新移动端进度
    this._updateMobileProgress();
  }

  _updateMobileProgress() {
    const mobileDots = document.querySelectorAll('.m-dot');

    mobileDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentIndex);
    });
  }

  // ─── 内容入场动画 ────────────────────────────────────────────────────────────

  /**
   * 预隐藏目标 section 内容，避免切换时的闪烁
   * 在 section slide 动画开始前调用
   */
  _preHideContent(sectionIndex) {
    const wrapper = this._getWrapper(sectionIndex);
    if (!wrapper) return;
    const content = wrapper.querySelector('.section-scroll-content');
    if (!content) return;

    const children = Array.from(content.children).filter(
      el => !el.classList.contains('sc-blur-overlay')
    );
    if (!children.length) return;

    gsap.set(children, { opacity: 0, y: 18 });
  }

  _animateContentIn(sectionIndex) {
    const wrapper = this._getWrapper(sectionIndex);
    if (!wrapper) return;
    const content = wrapper.querySelector('.section-scroll-content');
    if (!content) return;

    // 过滤直接子元素（非零高度）
    const children = Array.from(content.children).filter(
      el => !el.classList.contains('sc-blur-overlay')
    );
    if (!children.length) return;

    // 使用 to() 而非 fromTo()，因为内容已经通过 _preHideContent 隐藏
    gsap.to(children, {
      opacity: 1,
      y: 0,
      duration: 0.55,
      stagger: 0.07,
      delay: 0.1,
      ease: 'power2.out',
      clearProps: 'transform,opacity'
    });
  }

  _initSimple() {
    // 降级：无动画，正常文档流
    document.body.style.overflow   = '';
    document.body.style.height     = 'auto';
    document.documentElement.style.overflow = '';
    this.sections.forEach(s => {
      s.style.position  = 'relative';
      s.style.height    = 'auto';
      s.style.minHeight = '100svh';
      s.style.transform = '';
    });
  }

  // ─── 事件绑定 ──────────────────────────────────────────────────────────────

  _bindEvents() {
    // passive: false 仅用于 wheel（需要 preventDefault 阻止默认滚动行为）
    window.addEventListener('wheel', this._boundWheel, { passive: false });
    // touch: passive: true —— 完全不拦截 touchmove，让浏览器处理内容滚动
    window.addEventListener('touchstart', this._boundTouchStart, { passive: true });
    window.addEventListener('touchend',   this._boundTouchEnd,   { passive: true });
    window.addEventListener('keydown',       this._boundKey);
    window.addEventListener('resize',        this._boundResize);
    window.addEventListener('orientationchange', this._boundOrientation);
  }

  // ─── 事件处理 ──────────────────────────────────────────────────────────────

  _onWheel(e) {
    // 阻止默认（body overflow:hidden 已防止滚动，这里是防止 Firefox 等边缘情况）
    e.preventDefault();
    if (this.isTransitioning) return;

    const wrapper = this._getWrapper(this.currentIndex);
    const dir     = e.deltaY > 0 ? 1 : -1;

    // 先尝试内容滚动
    if (wrapper) {
      const { scrollTop, scrollHeight, clientHeight } = wrapper;
      const canDown = scrollTop + clientHeight < scrollHeight - 3;
      const canUp   = scrollTop > 3;

      if ((dir > 0 && canDown) || (dir < 0 && canUp)) {
        // 内容未到边界：使用 GSAP 平滑滚动
        this._smoothScrollWrapper(wrapper, e.deltaY);
        this._wheelDelta = 0;
        clearTimeout(this._wheelTimer);
        return;
      }
    }

    // 到达边界：累积触发 section 切换
    this._wheelDelta += Math.abs(e.deltaY);
    clearTimeout(this._wheelTimer);
    this._wheelTimer = setTimeout(() => { this._wheelDelta = 0; }, 400);

    if (this._wheelDelta >= this.options.wheelThreshold) {
      this._wheelDelta = 0;
      this.goTo(this.currentIndex + dir);
    }
  }

  /**
   * 平滑滚动 wrapper 内容
   * 使用 GSAP 实现惯性滚动效果，避免直接设置 scrollTop 导致的卡顿
   */
  _smoothScrollWrapper(wrapper, deltaY) {
    const { scrollTop, scrollHeight, clientHeight } = wrapper;

    // 初始化或累积目标位置
    if (this._contentScrollTarget === null) {
      this._contentScrollTarget = scrollTop;
    }

    // 累积目标滚动位置
    this._contentScrollTarget += deltaY;

    // 限制在有效范围内
    const maxScroll = scrollHeight - clientHeight;
    this._contentScrollTarget = Math.max(0, Math.min(this._contentScrollTarget, maxScroll));

    // 使用 GSAP 平滑动画到目标位置
    gsap.to(wrapper, {
      scrollTop: this._contentScrollTarget,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
      onComplete: () => {
        // 动画完成后重置目标位置，让下一次 wheel 从当前位置开始
        this._contentScrollTarget = null;
      }
    });
  }

  _onTouchStart(e) {
    this._touchStartY         = e.touches[0].clientY;
    this._touchStartTime      = performance.now();
    const w = this._getWrapper(this.currentIndex);
    this._touchStartScrollTop = w ? w.scrollTop : 0;
  }

  _onTouchEnd(e) {
    if (this.isTransitioning || !e.changedTouches.length) return;

    const endY     = e.changedTouches[0].clientY;
    const dy       = this._touchStartY - endY; // 正 = 上滑 = 下一个 section
    const dt       = Math.max(performance.now() - this._touchStartTime, 1);
    const velocity = Math.abs(dy) / dt; // px/ms

    // 检查内容是否发生了实际滚动
    const w           = this._getWrapper(this.currentIndex);
    const scrollNow   = w ? w.scrollTop : 0;
    const scrollMoved = Math.abs(scrollNow - this._touchStartScrollTop);

    // 内容滚动了 → 不触发 section 切换
    if (scrollMoved > 15) return;

    // 不满足速度/距离阈值 → 忽略
    const isValid = Math.abs(dy) >= this.options.swipeMinDistance ||
                    velocity      >= this.options.swipeMinVelocity;
    if (!isValid) return;

    if (dy > 0) {
      // 上滑：需要已到内容底部
      if (this._isAtBottom(this.currentIndex)) {
        this.goTo(this.currentIndex + 1);
      }
    } else {
      // 下滑：需要已到内容顶部
      if (this._isAtTop(this.currentIndex)) {
        this.goTo(this.currentIndex - 1);
      }
    }
  }

  _onKey(e) {
    if (this.isTransitioning) return;
    if (['ArrowDown', 'PageDown'].includes(e.key)) {
      e.preventDefault();
      if (this._isAtBottom(this.currentIndex)) this.goTo(this.currentIndex + 1);
    }
    if (['ArrowUp', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      if (this._isAtTop(this.currentIndex)) this.goTo(this.currentIndex - 1);
    }
  }

  _onResize() {
    // fixed 定位不需要重算位置，CSS height:100% 自动适配 viewport
    // 只需确保每个 section 的 translateY 状态正确
    this.sections.forEach((section, i) => {
      const y = i < this.currentIndex ? '-100%'
              : i === this.currentIndex ? '0%'
              : '100%';
      gsap.set(section, { translateY: y });
    });
  }

  // ─── 核心导航 ──────────────────────────────────────────────────────────────

  goTo(targetIndex) {
    if (this.isTransitioning) return;
    if (targetIndex < 0 || targetIndex >= this.sections.length) return;
    if (targetIndex === this.currentIndex) return;

    const fromIndex = this.currentIndex;
    const dir       = targetIndex > fromIndex ? 1 : -1;
    this.isTransitioning = true;
    this.currentIndex    = targetIndex;

    const dur  = this.options.transitionDuration;
    const ease = 'power2.inOut';

    // 预隐藏目标 section 内容，避免 slide 完成后出现闪烁
    this._preHideContent(targetIndex);

    const tl = gsap.timeline({
      onComplete: () => {
        this.isTransitioning = false;
        // 重置滚动目标位置
        this._contentScrollTarget = null;
        // 前进时重置新 section 的内容滚动位置
        if (dir > 0) {
          const w = this._getWrapper(targetIndex);
          if (w) w.scrollTop = 0;
        }
      }
    });

    if (dir > 0) {
      // ── 前进：新 section 从底部滑入，遮盖当前 section ──

      // 多级跳转：中间 section 直接 set 到正确位置（不动画）
      for (let i = fromIndex + 1; i < targetIndex; i++) {
        gsap.set(this.sections[i], { translateY: '0%' });
        this._setBlur(i, true, 0);
      }

      // 目标 section 从 100% 滑到 0%（堆叠覆盖效果）
      gsap.set(this.sections[targetIndex], { translateY: '100%' });
      tl.to(this.sections[targetIndex], { translateY: '0%', duration: dur, ease }, 0);

      // 给被遮盖的 section 加模糊
      this._setBlur(fromIndex, true, dur, tl);

    } else {
      // ── 后退：当前 section 滑回底部，露出下方 section ──

      // 多级跳转：中间 section 直接 set 回底部
      for (let i = fromIndex - 1; i > targetIndex; i--) {
        gsap.set(this.sections[i], { translateY: '100%' });
        this._setBlur(i, false, 0);
      }

      // 当前 section 从 0% 滑到 100%
      tl.to(this.sections[fromIndex], { translateY: '100%', duration: dur, ease }, 0);

      // 目标 section 去掉模糊（被揭示）
      this._setBlur(targetIndex, false, dur, tl);
    }

    // 动画结束后的入场效果和进度点更新
    this._updateProgressDots();
    tl.call(() => this._animateContentIn(targetIndex));

    if (this.options.onSectionChange) {
      this.options.onSectionChange(targetIndex, this.sections[targetIndex]);
    }
  }

  // ─── 内部工具方法 ──────────────────────────────────────────────────────────

  _getWrapper(index) {
    return this.sections[index]?.querySelector('.section-scroll-wrapper') ?? null;
  }

  _isAtTop(index) {
    const w = this._getWrapper(index);
    return !w || w.scrollTop <= 3;
  }

  _isAtBottom(index) {
    const w = this._getWrapper(index);
    if (!w) return true;
    return w.scrollTop + w.clientHeight >= w.scrollHeight - 3;
  }

  /**
   * 设置 section 的模糊遮罩
   * @param {number}  index   - section 索引
   * @param {boolean} active  - true = 加模糊（被遮盖），false = 去模糊
   * @param {number}  dur     - 动画时长（0 = 立即 set）
   * @param {object}  [tl]    - gsap Timeline，传入则添加到 timeline
   */
  _setBlur(index, active, dur, tl) {
    const overlay = this.sections[index]?.querySelector('.sc-blur-overlay');
    if (!overlay) return;

    const props = active
      ? { backdropFilter: `blur(${this.options.blurAmount}px)`, backgroundColor: 'rgba(5,5,5,0.35)' }
      : { backdropFilter: 'blur(0px)',                          backgroundColor: 'rgba(5,5,5,0)' };

    if (dur === 0) {
      gsap.set(overlay, props);
    } else if (tl) {
      tl.to(overlay, { ...props, duration: dur, ease: 'power2.inOut' }, 0);
    } else {
      gsap.to(overlay, { ...props, duration: dur, ease: 'power2.inOut' });
    }
  }
}

// ─── 便捷初始化 ───────────────────────────────────────────────────────────────

export function initStackingCards(options = {}) {
  const instance = new StackingCards(options);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => instance.init());
  } else {
    instance.init();
  }
  return instance;
}

export default StackingCards;
