// 统一的 GSAP 卡片堆叠效果模块
export function initStackingCards(containerSelector = 'body', sectionSelector = 'section') {
    if (typeof window === 'undefined') return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        setTimeout(() => initStackingCards(containerSelector, sectionSelector), 100);
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const container = document.querySelector(containerSelector);
    if (!container) return;

    const sections = container.querySelectorAll(sectionSelector);
    if (sections.length <= 1) return;

    // 检查是否支持减少动画偏好
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // 检测是否为触摸设备
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    // 设置初始样式 - 全屏覆盖模式
    sections.forEach((section, index) => {
        const zIndex = (index + 1) * 10;
        section.setAttribute('data-gsap', 'true');
        section.style.zIndex = String(zIndex);
        section.style.position = 'fixed';
        section.style.top = '0';
        section.style.left = '0';
        section.style.width = '100%';
        section.style.height = '100vh';
        section.style.opacity = '1';
        section.style.visibility = index === 0 ? 'visible' : 'hidden';
        section.style.transform = index === 0 ? 'translateY(0)' : 'translateY(100%)';
        section.style.backgroundColor = 'rgba(5, 5, 5, 0.98)';
        section.style.overflow = 'auto';
        section.style.overflowY = 'auto';
        section.style.webkitOverflowScrolling = 'touch';
    });

    // 为每个section添加模糊遮罩层
    sections.forEach((section, index) => {
        if (index === sections.length - 1) return;

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
            transition: backdrop-filter 0.1s, background 0.1s;
        `;
        section.appendChild(blurOverlay);

        // 将section内容移到更低的z-index
        const children = Array.from(section.children);
        children.forEach(child => {
            if (!child.classList.contains('blur-overlay')) {
                child.style.position = 'relative';
                child.style.zIndex = '1';
            }
        });
    });

    // 创建滚动触发的覆盖动画
    sections.forEach((section, index) => {
        if (index === 0) return;

        // 从下方滑入覆盖
        gsap.fromTo(section,
            {
                y: '100%',
                visibility: 'hidden'
            },
            {
                y: '0%',
                visibility: 'visible',
                ease: 'none',
                scrollTrigger: {
                    trigger: document.body,
                    start: () => `top+=${index * window.innerHeight} top`,
                    end: () => `top+=${(index + 0.8) * window.innerHeight} top`,
                    scrub: isTouchDevice ? 0.5 : 0.8,
                    invalidateOnRefresh: true,
                    onEnter: () => {
                        section.style.visibility = 'visible';
                    },
                    onLeaveBack: () => {
                        if (index > 0) {
                            section.style.visibility = 'hidden';
                        }
                    }
                }
            }
        );

        // 前一个section的模糊效果
        const prevSection = sections[index - 1];
        const blurOverlay = prevSection.querySelector('.blur-overlay');

        if (blurOverlay) {
            gsap.to(blurOverlay, {
                backdropFilter: 'blur(20px)',
                background: 'rgba(5, 5, 5, 0.7)',
                ease: 'none',
                scrollTrigger: {
                    trigger: document.body,
                    start: () => `top+=${index * window.innerHeight} top`,
                    end: () => `top+=${(index + 0.5) * window.innerHeight} top`,
                    scrub: true,
                    invalidateOnRefresh: true
                }
            });
        }
    });

    // 设置 body 高度以支持滚动
    const totalHeight = sections.length * window.innerHeight;
    document.body.style.height = `${totalHeight}px`;

    // 窗口大小改变时刷新
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newHeight = sections.length * window.innerHeight;
            document.body.style.height = `${newHeight}px`;
            ScrollTrigger.refresh();
        }, 250);
    });

    // 页面可见性变化时刷新
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            ScrollTrigger.refresh();
        }
    });

    // 清理函数
    return () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
}
