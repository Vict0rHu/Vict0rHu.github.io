import { bindCollectionKeys } from './collection-keys';

export function createAwardsBrowser(element: HTMLElement, actions: {
  select(index: number, instant: boolean): void;
  close(): void;
}) {
  const records = Array.from(element.querySelectorAll<HTMLElement>('[data-award-record]'));
  const title = element.querySelector<HTMLElement>('[data-award-title]')!;
  const year = element.querySelector<HTMLElement>('[data-award-year]')!;
  const count = element.querySelector<HTMLElement>('[data-award-count]')!;
  const details = element.querySelector<HTMLElement>('[data-award-details]')!;
  const toggle = element.querySelector<HTMLButtonElement>('[data-award-toggle]')!;
  const toggleLabel = toggle.querySelector('span')!;
  let open = false, expanded = false, index = 0;

  function expand(value: boolean) {
    expanded = value;
    details.hidden = !value;
    toggle.setAttribute('aria-expanded', String(value));
    toggleLabel.textContent = value ? 'Close details' : 'View details';
    // Switching or collapsing a record must not strand focus in hidden content.
    if (element.contains(document.activeElement) && document.activeElement?.closest('[hidden]')) element.focus({ preventScroll: true });
  }
  function select(next: number, instant = false) {
    if (!records[next]) return;
    index = next;
    const record = records[index];
    title.textContent = record.dataset.title!;
    year.textContent = record.dataset.year!;
    count.textContent = `${index + 1} / ${records.length}`;
    records.forEach((record, i) => { record.hidden = i !== index; });
    if (element.contains(document.activeElement) && document.activeElement?.closest('[hidden]')) element.focus({ preventScroll: true });
    actions.select(index, instant);
  }
  function back() {
    if (expanded) expand(false);
    else {
      open = false;
      element.hidden = true;
      actions.close();
    }
  }
  const step = (delta: number) => select((index + delta + records.length) % records.length);
  for (const button of element.querySelectorAll<HTMLButtonElement>('[data-award-step]'))
    button.addEventListener('click', () => step(Number(button.dataset.awardStep)));
  element.querySelector('[data-award-close]')!.addEventListener('click', back);
  toggle.addEventListener('click', () => expand(!expanded));
  bindCollectionKeys(element, {
    active: () => open,
    move: direction => step(direction === 'left' || direction === 'up' ? -1 : 1),
    activate: () => expand(!expanded), back,
  });
  return {
    get active() { return open; },
    get selection() { return index; },
    select,
    open(next = index, instant = false) {
      open = true;
      element.hidden = false;
      expand(false);
      select(next, instant);
      element.focus({ preventScroll: true });
    },
    suspend() { open = false; element.hidden = true; },
  };
}
