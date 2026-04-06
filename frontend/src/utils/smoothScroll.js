// utils/smoothScroll.js

/**
 * Scroll suave hacia un elemento dentro de un contenedor
 * @param {HTMLElement} container - contenedor con scroll
 * @param {HTMLElement} target - elemento a centrar
 * @param {Object} options - opciones de scroll
 *   options.maxDuration: duración máxima en ms
 */
export function smoothScroll(container, targetPos, options = {}) {
  if (!container) return;

  const { maxDuration = 800, onComplete } = options;

  const startPos = container.scrollTop;
  const distance = targetPos - startPos;

  if (distance === 0) {
    onComplete?.();
    return;
  }

  const baseSpeed = 0.5; // px/ms
  const duration = Math.min(Math.abs(distance) / baseSpeed, maxDuration);

  const ease = t => t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;

  let start = null;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    const percent = Math.min(progress / duration, 1);
    container.scrollTop = startPos + distance * ease(percent);
    if (percent < 1) {
      requestAnimationFrame(step);
    } else {
      onComplete?.();
    }
  };

  requestAnimationFrame(step);
}