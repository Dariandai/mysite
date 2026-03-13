/**
 * 统一堆叠卡片滑动系统
 * 所有页面共享的滑动逻辑
 */

export class StackingCards {
  constructor(options = {}) {
    this.options = {
      sections: options.sections || 'section',
      sectionOrder: options.sectionOrder || [],
      dampingThreshold: options.dampingThreshold || 400,
      blurAmount: options.blurAmount || 15,
      transitionDuration: options.transitionDuration || 1.2,
      ...options
    };

    this.sections = [];
    this.wrappers = [];
    this.sectionStates = [];
    this.currentSectionIndex = 0;
    this.isTransitioning = false;
    this.accumulatedDelta = 0;
    this.touchStartY = 0;
    this.touchAccumulatedDelta = 0;

    this.SectionPhase = {
      HIDDEN: 'hidden',
      ACTIVE: 'active'
    };

    this.onSectionChange = options.onSectionChange || null;
  }

  init() {
    if (typeof window === 'undefined') return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(() => this.init(), 100);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    this.sections = Array.from(document.querySelectorAll(this.options.sections));
    if (this.sections.length <= 1) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.initSimpleMode();
      return;
    }

    this.cleanup();
    this.setupSections();
    this.createWrappers();
    this.bindEvents();
    this.updateBlurStates();
  }

  cleanup() {
    this.sections.forEach(section => {
      const existingWrapper = section.querySelector('.section-scroll-wrapper');
      if (existingWrapper) {
        const content = existingWrapper.querySelector('.section-scroll-content');
        if (content) {
          Array.from(content.children).forEach(child => section.appendChild(child));
        }
        existingWrapper.remove();
      }
      const existingOverlay = section.querySelector('.blur-overlay');
      if (existingOverlay) existingOverlay.remove();
      const arrows = section.querySelectorAll('.edge-arrow');
      arrows.forEach(a => a.remove());
    });
    ScrollTrigger.getAll().forEach(st => st.kill());
  }

  setupSections() {
    const isMobile = () => window.innerWidth <= 768;
    const isLandscape = () => window.innerHeight <= 500 && window.innerWidth > window.innerHeight;

    this.sections.forEach((section, index) => {
      section.setAttribute('data-stacking', 'true');
      section.style.cssText = `
        z-index: ${(index + 1) * 10};
        position: sticky;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        height: 100dvh;
        opacity: 1;
        overflow: hidden;
        background-color: var(--bg-color, #050505);
        will-change: transform;
        transform: translateZ(0);
      `;

      this.sectionStates[index] = {
        phase: index === 0 ? this.SectionPhase.ACTIVE : this.SectionPhase.HIDDEN,
        isAtTop: true,
        isAtBottom: false,
        wrapper: null
      };

      // 顶部箭头
      if (index > 0) {
        const topArrow = document.createElement('div');
        topArrow.className = 'edge-arrow top-arrow';
        topArrow.innerHTML = '↑';
        topArrow.style.cssText = `
          position: absolute;
          top: 120px;
          right: 20px;
          color: rgba(255,255,255,0.5);
          font-size: 20px;
          opacity: 0;
          transition: opacity 0.15s ease;
          pointer-events: none;
          z-index: 99999;
          text-shadow: 0 0 10px rgba(0,0,0,0.8);
        `;
        section.appendChild(topArrow);
      }

      // 底部箭头
      const bottomArrow = document.createElement('div');
      bottomArrow.className = 'edge-arrow bottom-arrow';
      bottomArrow.innerHTML = '↓';
      bottomArrow.style.cssText = `
        position: absolute;
        bottom: 80px;
        right: 20px;
        color: rgba(255,255,255,0.5);
        font-size: 20px;
        opacity: 0;
        transition: opacity 0.15s ease;
        pointer-events: none;
        z-index: 99999;
        text-shadow: 0 0 10px rgba(0,0,0,0.8);
      `;
      section.appendChild(bottomArrow);
    });

    document.body.style.height = `${this.sections.length * 100}vh`;
  }

  createWrappers() {
    const isMobile = () => window.innerWidth <= 768;
    const isLandscape = () => window.innerHeight <= 500 && window.innerWidth > window.innerHeight;

    this.sections.forEach((section, index) => {
      const children = Array.from(section.children).filter(
        child => !child.classList?.contains('edge-arrow')
      );

      const wrapper = document.createElement('div');
      wrapper.className = 'section-scroll-wrapper';
      wrapper.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow-y: ${index === 0 ? 'auto' : 'hidden'};
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        z-index: 1;
        scrollbar-width: none;
        -ms-overflow-style: none;
      `;

      const content = document.createElement('div');
      content.className = 'section-scroll-content';
      const landscapeFlag = isLandscape();
      const mobileFlag = isMobile();

      // 获取原始section的flex设置
      const computedStyle = window.getComputedStyle(section);
      const isFlex = computedStyle.display.includes('flex');

      content.style.cssText = `
        min-height: 100vh;
        min-height: 100dvh;
        padding: ${mobileFlag ? '80px 5% 60px' : (landscapeFlag ? '60px 5% 20px' : '100px 10% 50px')};
        box-sizing: border-box;
        ${isFlex ? `
          display: ${computedStyle.display};
          flex-direction: ${computedStyle.flexDirection};
          align-items: ${computedStyle.alignItems};
          justify-content: ${computedStyle.justifyContent};
          gap: ${computedStyle.gap};
        ` : ''}
      `;

      children.forEach(child => content.appendChild(child));
      wrapper.appendChild(content);
      section.appendChild(wrapper);

      this.wrappers[index] = wrapper;
      this.sectionStates[index].wrapper = wrapper;

      // 模糊遮罩
      if (index < this.sections.length - 1) {
        const blurOverlay = document.createElement('div');
        blurOverlay.className = 'blur-overlay';
        blurOverlay.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          backdrop-filter: blur(0px);
          background: rgba(5, 5, 5, 0);
          pointer-events: none;
          z-index: 9999;
          transition: backdrop-filter 0.3s ease, background 0.3s ease;
        `;
        section.appendChild(blurOverlay);
      }
    });
  }

  bindEvents() {
    // 滚动监听
    this.wrappers.forEach((wrapper, index) => {
      wrapper.addEventListener('scroll', () => {
        if (this.sectionStates[index].phase !== this.SectionPhase.ACTIVE) return;

        const { scrollTop, scrollHeight, clientHeight } = wrapper;
        this.sectionStates[index].isAtTop = scrollTop <= 5;
        this.sectionStates[index].isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;

        // 缓冲检测 - 在边界附近显示箭头
        const section = this.sections[index];
        const topArrow = section.querySelector('.top-arrow');
        const bottomArrow = section.querySelector('.bottom-arrow');
        const bufferThreshold = 50;

        const nearTop = scrollTop <= bufferThreshold;
        if (topArrow && index > 0) {
          topArrow.style.opacity = nearTop ? '0.6' : '0';
        }

        const nearBottom = scrollTop + clientHeight >= scrollHeight - bufferThreshold;
        if (bottomArrow) {
          bottomArrow.style.opacity = nearBottom ? '0.6' : '0';
        }
      }, { passive: true });
    });

    // 滚轮事件
    window.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

    // 触摸事件
    window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });

    // 键盘事件
    window.addEventListener('keydown', this.handleKeyDown.bind(this));

    // 窗口调整
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.cleanup();
        this.init();
      }, 300);
    });
  }

  getArrow(index, isBottom) {
    const section = this.sections[index];
    return isBottom
      ? section.querySelector('.bottom-arrow')
      : section.querySelector('.top-arrow');
  }

  pulseEdgeArrow(index, isBottom) {
    const arrow = this.getArrow(index, isBottom);
    if (!arrow) return;

    const isLastSection = index === this.sections.length - 1;
    const isEnd = isLastSection && isBottom;

    arrow.style.opacity = '1';

    if (isEnd) {
      arrow.innerHTML = '−';
      gsap.timeline()
        .to(arrow, {
          opacity: 1,
          scale: 1.8,
          color: '#ff4444',
          textShadow: '0 0 30px rgba(255,68,68,0.8)',
          duration: 0.1,
          ease: 'power2.out'
        })
        .to(arrow, { opacity: 0.5, scale: 1.5, duration: 0.1 })
        .to(arrow, { opacity: 1, scale: 1.8, color: '#ff4444', duration: 0.1 })
        .to(arrow, {
          opacity: 0.6,
          scale: 1,
          color: 'rgba(255,255,255,0.3)',
          textShadow: 'none',
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => { arrow.innerHTML = '↓'; }
        });
    } else {
      gsap.timeline()
        .to(arrow, {
          opacity: 1,
          scale: 1.5,
          color: 'rgba(255,255,255,0.9)',
          textShadow: '0 0 20px rgba(255,255,255,0.5)',
          duration: 0.15,
          ease: 'power2.out'
        })
        .to(arrow, { opacity: 0.8, scale: 1.3, color: 'rgba(255,255,255,0.6)', textShadow: '0 0 10px rgba(255,255,255,0.3)', duration: 0.15 })
        .to(arrow, { opacity: 1, scale: 1.4, color: 'rgba(255,255,255,0.9)', textShadow: '0 0 20px rgba(255,255,255,0.5)', duration: 0.15 })
        .to(arrow, { opacity: 0.6, scale: 1, color: 'rgba(255,255,255,0.3)', textShadow: 'none', duration: 0.3, ease: 'power2.out' });
    }
  }

  handleWheel(e) {
    const deltaY = e.deltaY;

    // 最后一个section到底
    if (this.currentSectionIndex === this.sections.length - 1) {
      const currentState = this.sectionStates[this.currentSectionIndex];
      if (currentState.isAtBottom && deltaY > 0) {
        e.preventDefault();
        this.accumulatedDelta += Math.abs(deltaY);
        const arrow = this.getArrow(this.currentSectionIndex, true);
        if (arrow) {
          const bufferProgress = Math.min(this.accumulatedDelta / 50, 1);
          arrow.style.opacity = String(0.3 + bufferProgress * 0.7);
        }
        if (this.accumulatedDelta > this.options.dampingThreshold * 0.5) {
          this.pulseEdgeArrow(this.currentSectionIndex, true);
          this.accumulatedDelta = 0;
        }
        return;
      }
    }

    if (this.isTransitioning) {
      e.preventDefault();
      return;
    }

    const currentState = this.sectionStates[this.currentSectionIndex];
    const isAtBoundary = currentState.isAtTop || currentState.isAtBottom;
    const isScrollingOutward = (deltaY > 0 && currentState.isAtBottom) ||
                                (deltaY < 0 && currentState.isAtTop);

    if (isAtBoundary && isScrollingOutward) {
      this.accumulatedDelta += Math.abs(deltaY);

      // 缓冲区域显示箭头
      const arrow = this.getArrow(this.currentSectionIndex, deltaY > 0);
      if (arrow) {
        const bufferProgress = Math.min(this.accumulatedDelta / 50, 1);
        arrow.style.opacity = String(0.3 + bufferProgress * 0.7);
      }

      // 阻尼效果
      if (this.accumulatedDelta < this.options.dampingThreshold) {
        e.preventDefault();

        // 弹性视觉反馈
        const currentWrapper = this.wrappers[this.currentSectionIndex];
        if (currentWrapper) {
          const progress = this.accumulatedDelta / this.options.dampingThreshold;
          const bounce = Math.sin(progress * Math.PI) * 3;
          currentWrapper.style.transform = `translateY(${deltaY > 0 ? -bounce : bounce}px)`;
          setTimeout(() => { currentWrapper.style.transform = ''; }, 100);
        }

        if (this.accumulatedDelta > this.options.dampingThreshold * 0.7) {
          this.pulseEdgeArrow(this.currentSectionIndex, deltaY > 0);
        }
        return;
      }

      this.accumulatedDelta = 0;

      if (deltaY > 0 && this.currentSectionIndex < this.sections.length - 1) {
        e.preventDefault();
        this.goToSection(this.currentSectionIndex + 1);
      } else if (deltaY < 0 && this.currentSectionIndex > 0) {
        e.preventDefault();
        this.goToSection(this.currentSectionIndex - 1);
      }
    } else {
      this.accumulatedDelta = 0;
      const bottomArrow = this.getArrow(this.currentSectionIndex, true);
      const topArrow = this.getArrow(this.currentSectionIndex, false);
      if (bottomArrow) bottomArrow.style.opacity = '0';
      if (topArrow) topArrow.style.opacity = '0';

      if (!currentState.isAtTop && deltaY < 0) return;
      if (!currentState.isAtBottom && deltaY > 0) return;
    }
  }

  handleTouchStart(e) {
    this.touchStartY = e.touches[0].clientY;
    this.touchAccumulatedDelta = 0;
  }

  handleTouchMove(e) {
    // 最后一个section到底
    if (this.currentSectionIndex === this.sections.length - 1) {
      const currentState = this.sectionStates[this.currentSectionIndex];
      const touchY = e.touches[0].clientY;
      const deltaY = this.touchStartY - touchY;
      if (currentState.isAtBottom && deltaY > 0) {
        e.preventDefault();
        this.touchAccumulatedDelta += Math.abs(deltaY);
        const arrow = this.getArrow(this.currentSectionIndex, true);
        if (arrow) {
          const bufferProgress = Math.min(this.touchAccumulatedDelta / 50, 1);
          arrow.style.opacity = String(0.3 + bufferProgress * 0.7);
        }
        if (this.touchAccumulatedDelta > this.options.dampingThreshold * 0.5) {
          this.pulseEdgeArrow(this.currentSectionIndex, true);
          this.touchAccumulatedDelta = 0;
        }
        return;
      }
    }

    if (this.isTransitioning) {
      e.preventDefault();
      return;
    }

    const touchY = e.touches[0].clientY;
    const deltaY = this.touchStartY - touchY;
    const currentState = this.sectionStates[this.currentSectionIndex];
    const currentWrapper = this.wrappers[this.currentSectionIndex];
    const threshold = 30;

    const isAtBoundary = currentState.isAtTop || currentState.isAtBottom;
    const isScrollingOutward = (deltaY > threshold && currentState.isAtBottom) ||
                                (deltaY < -threshold && currentState.isAtTop);

    if (isAtBoundary && Math.abs(deltaY) > threshold) {
      this.touchAccumulatedDelta += Math.abs(deltaY);

      const arrow = this.getArrow(this.currentSectionIndex, deltaY > 0);
      if (arrow) {
        const bufferProgress = Math.min(this.touchAccumulatedDelta / 50, 1);
        arrow.style.opacity = String(0.3 + bufferProgress * 0.7);
      }

      if (this.touchAccumulatedDelta < this.options.dampingThreshold) {
        e.preventDefault();

        if (currentWrapper) {
          const progress = this.touchAccumulatedDelta / this.options.dampingThreshold;
          const bounce = Math.sin(progress * Math.PI) * 3;
          currentWrapper.style.transform = `translateY(${deltaY > 0 ? -bounce : bounce}px)`;
          setTimeout(() => { currentWrapper.style.transform = ''; }, 100);
        }

        if (this.touchAccumulatedDelta > this.options.dampingThreshold * 0.7) {
          this.pulseEdgeArrow(this.currentSectionIndex, deltaY > 0);
        }
        return;
      }

      this.touchAccumulatedDelta = 0;

      if (deltaY > threshold && this.currentSectionIndex < this.sections.length - 1) {
        e.preventDefault();
        this.goToSection(this.currentSectionIndex + 1);
        this.touchStartY = touchY;
      } else if (deltaY < -threshold && this.currentSectionIndex > 0) {
        e.preventDefault();
        this.goToSection(this.currentSectionIndex - 1);
        this.touchStartY = touchY;
      }
    } else {
      const bottomArrow = this.getArrow(this.currentSectionIndex, true);
      const topArrow = this.getArrow(this.currentSectionIndex, false);
      if (bottomArrow) bottomArrow.style.opacity = '0';
      if (topArrow) topArrow.style.opacity = '0';

      if (deltaY > 0 && !currentState.isAtBottom) return;
      if (deltaY < 0 && !currentState.isAtTop) return;
    }
  }

  handleKeyDown(e) {
    if (this.isTransitioning) return;
    const currentState = this.sectionStates[this.currentSectionIndex];

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      if (currentState.isAtBottom && this.currentSectionIndex < this.sections.length - 1) {
        this.accumulatedDelta = this.options.dampingThreshold;
        this.goToSection(this.currentSectionIndex + 1);
      }
    }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      if (currentState.isAtTop && this.currentSectionIndex > 0) {
        this.accumulatedDelta = this.options.dampingThreshold;
        this.goToSection(this.currentSectionIndex - 1);
      }
    }
  }

  goToSection(targetIndex) {
    if (this.isTransitioning || targetIndex < 0 || targetIndex >= this.sections.length) return;
    if (targetIndex === this.currentSectionIndex) return;

    const direction = targetIndex > this.currentSectionIndex ? 'next' : 'prev';
    this.isTransitioning = true;
    this.accumulatedDelta = 0;

    const prevIndex = this.currentSectionIndex;
    this.currentSectionIndex = targetIndex;

    this.sectionStates[prevIndex].phase = direction === 'next' ? this.SectionPhase.HIDDEN : this.SectionPhase.ACTIVE;
    this.sectionStates[targetIndex].phase = this.SectionPhase.ACTIVE;

    this.wrappers.forEach((w, i) => {
      w.style.overflowY = i === targetIndex ? 'auto' : 'hidden';
      if (i === targetIndex && direction === 'next') {
        w.scrollTop = 0;
        this.sectionStates[i].isAtTop = true;
        this.sectionStates[i].isAtBottom = false;
      }
    });

    this.updateBlurStates();

    if (this.onSectionChange) {
      this.onSectionChange(targetIndex, this.sections[targetIndex]);
    }

    const targetScroll = targetIndex * window.innerHeight;
    gsap.to(window, {
      duration: this.options.transitionDuration,
      scrollTo: { y: targetScroll, autoKill: false },
      ease: 'power2.inOut',
      onComplete: () => { this.isTransitioning = false; }
    });
  }

  updateBlurStates() {
    this.sections.forEach((section, index) => {
      const blurOverlay = section.querySelector('.blur-overlay');
      if (!blurOverlay) return;

      if (index < this.currentSectionIndex) {
        gsap.to(blurOverlay, {
          backdropFilter: `blur(${this.options.blurAmount}px)`,
          background: 'rgba(5, 5, 5, 0.6)',
          duration: this.options.transitionDuration,
          ease: 'power2.inOut'
        });
      } else {
        gsap.to(blurOverlay, {
          backdropFilter: 'blur(0px)',
          background: 'rgba(5, 5, 5, 0)',
          duration: this.options.transitionDuration,
          ease: 'power2.inOut'
        });
      }
    });
  }

  initSimpleMode() {
    this.sections.forEach(section => {
      section.style.position = 'relative';
      section.style.height = 'auto';
      section.style.minHeight = '100vh';
      section.style.overflow = 'visible';
    });
    document.body.style.height = 'auto';
  }

  scrollToSection(index) {
    this.goToSection(index);
  }

  getCurrentIndex() {
    return this.currentSectionIndex;
  }

  destroy() {
    ScrollTrigger.getAll().forEach(st => st.kill());
    this.cleanup();
  }
}

// 便捷初始化函数
export function initStackingCards(options = {}) {
  const instance = new StackingCards(options);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      instance.init();
      window.stackingCardsInstance = instance;
    });
  } else {
    instance.init();
    window.stackingCardsInstance = instance;
  }
  return instance;
}

export default StackingCards;
