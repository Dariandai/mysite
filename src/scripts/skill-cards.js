/**
 * 卡片 v2 交互：鼠标光斑跟随 + 微 3D tilt
 *
 * - 桌面端才启用（hover 无意义的 touch 设备跳过）
 * - prefers-reduced-motion 时完全禁用
 * - 事件委托在 document 上，动态跟踪当前卡片，围绕 rAF 节流
 *
 * 覆盖的卡片类：技能卡、unified-card 家族、博客/作品/工具卡
 * CSS 依赖自定义属性：--mx / --my（光斑位置 %）、--rx / --ry（旋转角度）
 */
export function initSkillCardEffects() {
  const CARD_SELECTOR = [
    '.skill-card',
    '.card-unified',
    '.unified-card',
    '.blog-card-home',
    '.work-card',
    '.tool-card',
    '.card',
  ].join(', ');

  const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!FINE_POINTER || REDUCE_MOTION) return;

  const ROTATE = 6; // 最大倾斜角度（度）

  const updateCard = (card, clientX, clientY) => {
    const rect = card.getBoundingClientRect();
    const nx = (clientX - rect.left) / rect.width;   // 0..1
    const ny = (clientY - rect.top) / rect.height;   // 0..1
    card.style.setProperty('--mx', `${(nx * 100).toFixed(2)}%`);
    card.style.setProperty('--my', `${(ny * 100).toFixed(2)}%`);
    card.style.setProperty('--rx', `${((ny - 0.5) * -ROTATE).toFixed(2)}deg`);
    card.style.setProperty('--ry', `${((nx - 0.5) * ROTATE).toFixed(2)}deg`);
  };

  const resetCard = (card) => {
    card.style.removeProperty('--mx');
    card.style.removeProperty('--my');
    card.style.removeProperty('--rx');
    card.style.removeProperty('--ry');
  };

  let currentCard = null;

  const onMove = (e) => {
    const card = e.target.closest(CARD_SELECTOR);
    if (card !== currentCard) {
      if (currentCard) resetCard(currentCard);
      currentCard = card;
    }
    if (!card) return;
    // rAF 节流：避免高频 getBoundingClientRect
    if (!card._skillRaf) {
      card._skillRaf = requestAnimationFrame(() => {
        card._skillRaf = null;
        updateCard(card, e.clientX, e.clientY);
      });
    }
  };

  const onLeaveDoc = () => {
    if (currentCard) {
      resetCard(currentCard);
      currentCard = null;
    }
  };

  document.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget) onLeaveDoc();
  });
}