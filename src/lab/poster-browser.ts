import { adjacentPoster, posterWallCopy, wallPosters } from './poster-wall-content';
import type { MemoryScene } from './content';
import { bindCollectionKeys } from './collection-keys';

type Actions = {
  select: (index: number, instant: boolean) => void;
  close: () => void;
  enter: (memory: MemoryScene) => void;
};

/** UI and keyboard state for browsing the real posters rendered on the wall. */
export function createPosterBrowser(element: HTMLElement, actions: Actions) {
  const title = element.querySelector<HTMLElement>('[data-poster-title]')!;
  const status = element.querySelector<HTMLElement>('[data-poster-status]')!;
  const enter = element.querySelector<HTMLButtonElement>('[data-poster-enter]')!;
  const enterLabel = enter.querySelector('span')!;
  const close = element.querySelector<HTMLButtonElement>('[data-poster-close]')!;
  let index = 0;
  let open = false;
  let busy = false;

  function select(next: number, instant = false) {
    if (busy || !wallPosters[next]) return;
    index = next;
    const entry = wallPosters[index];
    title.textContent = entry.title;
    status.textContent = `${index + 1} / ${wallPosters.length}`;
    enter.disabled = !('memory' in entry);
    enterLabel.textContent = 'memory' in entry ? posterWallCopy.enter : posterWallCopy.pending;
    element.querySelector('kbd')!.hidden = enter.disabled;
    actions.select(index, instant);
  }
  function leave() {
    if (busy) return;
    open = false;
    element.hidden = true;
    actions.close();
  }
  function activate() {
    const entry = wallPosters[index];
    if (!busy && 'memory' in entry) actions.enter(entry.memory);
  }
  close.addEventListener('click', leave);
  enter.addEventListener('click', activate);
  for (const button of element.querySelectorAll<HTMLButtonElement>('[data-poster-step]')) {
    button.addEventListener('click', () => select((index + Number(button.dataset.posterStep) + wallPosters.length) % wallPosters.length));
  }
  bindCollectionKeys(element, {
    active: () => open, busy: () => busy,
    move: direction => select(adjacentPoster(index, direction)),
    activate, back: leave,
  });
  return {
    get active() { return open; },
    get selection() { return index; },
    open(next = index, instant = false) {
      busy = false;
      element.setAttribute('aria-busy', 'false');
      open = true;
      element.hidden = false;
      select(next, instant);
      element.focus({ preventScroll: true });
    },
    select,
    suspend() { open = false; busy = false; element.hidden = true; },
    setBusy(value: boolean) { busy = value; element.setAttribute('aria-busy', String(value)); },
  };
}
