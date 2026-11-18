type TouchControls = {
  start: (touch: Touch) => void;
  move?: (touch: Touch) => void;
  end: (touch: Touch) => void;
  cancel?: (touch: Touch) => void;
};

export function bindControlTouches(surface: HTMLElement, controls: TouchControls) {
  const handlers = {
    touchstart: controls.start,
    touchmove: controls.move,
    touchend: controls.end,
    touchcancel: controls.cancel ?? controls.end,
  };
  for (const type of Object.keys(handlers) as (keyof typeof handlers)[]) {
    surface.addEventListener(type, event => {
      // Cancel native touch selection and synthesized mouse clicks on game controls.
      if (event.cancelable) event.preventDefault();
      const handle = handlers[type];
      if (handle) for (const touch of Array.from(event.changedTouches)) handle(touch);
    }, { passive: false });
  }
}
