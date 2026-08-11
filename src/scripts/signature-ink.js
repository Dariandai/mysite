/**
 * 签名书写动画（生产版）
 *
 * 第一性原则：真实笔迹 = 笔尖沿弧线变速运动。
 * 速度呈钟形曲线：起笔慢（蓄力）→ 行笔快（推进）→ 收笔慢（驻笔）。
 * 位移模型 s(t) = t - sin(2πt) / 2π，其导数 1 - cos(2πt) 即速度，
 * 在起笔与收笔端归零、中段最快。用该模型按弧长推进 stroke-dashoffset。
 *
 * 结构：<g class="signature-stroke" data-stroke="n">
 *         <path class="signature-path signature-path--glow"/>
 *         <path class="signature-path"/>
 *       </g>
 * 每个 stroke 的 glow 与 main 共用弧长同步推进。
 *
 * 触发：IntersectionObserver 进入视口时播放；桌面端 hover 重放；
 * prefers-reduced-motion 直接显示完整签名。
 */
export function initSignatureInk() {
  const svg = document.querySelector('.logo-signature');
  if (!svg) return;
  const strokes = [...svg.querySelectorAll('.signature-stroke')];
  if (!strokes.length) return;

  const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // 手写位移模型：t ∈ [0,1] → s ∈ [0,1]，两端慢、中段快
  const penMotion = (t) => t - Math.sin(2 * Math.PI * t) / (2 * Math.PI);

  // 每个 stroke：主路径（用于测量弧长与笔尖位置）与 glow 路径同步
  const segments = strokes.map((g) => {
    const main = g.querySelector('.signature-path:not(.signature-path--glow)');
    const glow = g.querySelector('.signature-path--glow');
    const len = main.getTotalLength();
    main.style.strokeDasharray = `${len}`;
    main.style.strokeDashoffset = String(len); // 初始全部隐藏
    if (glow) {
      glow.style.strokeDasharray = `${len}`;
      glow.style.strokeDashoffset = String(len);
    }
    return { main, glow, len, dur: 420 + len * 0.16 };
  });

  // 笔尖光点（跟随弧长）
  let pen = null;
  const ensurePen = () => {
    if (pen) return pen;
    const NS = 'http://www.w3.org/2000/svg';
    pen = document.createElementNS(NS, 'circle');
    pen.setAttribute('class', 'signature-pen');
    svg.appendChild(pen);
    return pen;
  };

  let raf = 0;
  let token = 0;

  const play = (initialDelay = 400) => {
    const myToken = ++token;
    if (raf) cancelAnimationFrame(raf);

    // 排程：逐笔串行，笔间留极短提笔间隙以保持连续性
    const gap = 90;
    const schedule = [];
    let t = 0;
    segments.forEach((seg, i) => {
      schedule.push({ ...seg, start: t });
      t += seg.dur + (i < segments.length - 1 ? gap : 0);
    });
    const total = t;
    const startAt = performance.now() + initialDelay;

    ensurePen();

    const step = (now) => {
      if (myToken !== token) return;
      const el = now - startAt;
      if (el < 0) {
        raf = requestAnimationFrame(step);
        return;
      }

      schedule.forEach((seg) => {
        const local = el - seg.start;
        if (local < 0) return;
        const prog = Math.min(local / seg.dur, 1);
        const s = penMotion(prog);
        const offset = String(seg.len * (1 - s));
        seg.main.style.strokeDashoffset = offset;
        if (seg.glow) seg.glow.style.strokeDashoffset = offset;

        // 笔尖跟随当前正在书写的笔迹
        if (prog < 1 && local >= 0 && pen) {
          const pt = seg.main.getPointAtLength(seg.len * Math.min(s, 1));
          pen.setAttribute('cx', String(pt.x));
          pen.setAttribute('cy', String(pt.y));
          // 落笔渐显，收笔渐隐
          const q = local / seg.dur;
          const opacity = q < 0.12 ? q / 0.12 : q > 0.88 ? (1 - q) / 0.12 : 1;
          pen.style.opacity = String(opacity);
        }
      });

      if (el < total) {
        raf = requestAnimationFrame(step);
      } else {
        segments.forEach((seg) => {
          seg.main.style.strokeDashoffset = '0';
          if (seg.glow) seg.glow.style.strokeDashoffset = '0';
        });
        if (pen) pen.style.opacity = '0';
      }
    };
    raf = requestAnimationFrame(step);
  };

  const revealInstant = () => {
    segments.forEach((seg) => {
      seg.main.style.strokeDashoffset = '0';
      if (seg.glow) seg.glow.style.strokeDashoffset = '0';
    });
  };

  if (REDUCE_MOTION) {
    revealInstant();
    return;
  }

  // 进入视口才播放（首屏立即进入也会触发）
  let entered = false;
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting) && !entered) {
        entered = true;
        play(400);
        io.disconnect();
      }
    },
    { threshold: 0.2 }
  );
  io.observe(svg);

  // hover 重放（桌面端）
  if (FINE_POINTER) {
    const logo = svg.closest('.logo');
    if (logo) {
      logo.addEventListener('mouseenter', () => {
        if (!entered) return;
        segments.forEach((seg) => {
          seg.main.style.strokeDashoffset = `${seg.len}`;
          if (seg.glow) seg.glow.style.strokeDashoffset = `${seg.len}`;
        });
        play(0);
      });
    }
  }
}