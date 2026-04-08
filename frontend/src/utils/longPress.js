export function addLongPress(element, callback, duration = 500) {
  let timer = null;

  const start = () => {
    timer = setTimeout(() => {
      callback();
    }, duration);
  };

  const cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  element.addEventListener("mousedown", start);
  element.addEventListener("touchstart", start);

  element.addEventListener("mouseup", cancel);
  element.addEventListener("mouseleave", cancel);
  element.addEventListener("touchend", cancel);
}