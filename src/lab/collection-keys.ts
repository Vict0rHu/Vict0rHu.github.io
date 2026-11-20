export type CollectionDirection = 'up' | 'down' | 'left' | 'right';

/** One keyboard contract for physical collections, independent of button focus. */
export function bindCollectionKeys(element: HTMLElement, actions: {
  active(): boolean;
  busy?(): boolean;
  move(direction: CollectionDirection): void;
  activate(): void;
  back(): void;
}) {
  const directions: Record<string, CollectionDirection> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
  window.addEventListener('keydown', event => {
    if (!actions.active() || event.altKey || event.ctrlKey || event.metaKey) return;
    const direction = directions[event.key];
    if (!direction && !['Enter', 'Escape', ' ', 'Tab'].includes(event.key)) return;
    // Explicitly focused work links retain native keyboard activation.
    if (event.key === 'Enter' && event.target instanceof HTMLAnchorElement && element.contains(event.target) && !actions.busy?.()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (actions.busy?.()) return;
    if (direction) actions.move(direction);
    else if (!event.repeat && (event.key === 'Escape' || event.key === ' ')) actions.back();
    else if (!event.repeat && event.key === 'Enter') actions.activate();
    else if (event.key === 'Tab') {
      const controls = Array.from(element.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]')).filter(control => !control.closest('[hidden]'));
      const current = controls.indexOf(document.activeElement as HTMLElement);
      const next = current < 0 ? (event.shiftKey ? controls.length - 1 : 0) :
        (current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
      controls[next]?.focus({ preventScroll: true });
    }
  }, { capture: true });
}
