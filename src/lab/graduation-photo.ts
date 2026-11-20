/** Native modal focus handling keeps camera playback separate from walking controls. */
export function createGraduationPhoto(dialog: HTMLDialogElement, onClose: () => void) {
  const image = dialog.querySelector<HTMLImageElement>('img')!;
  const close = dialog.querySelector<HTMLButtonElement>('button')!;
  close.addEventListener('click', onClose);
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    onClose();
  });
  dialog.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || !['Enter', 'Escape', ' '].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    if (!event.repeat) onClose();
  });
  return {
    open() {
      if (!image.getAttribute('src')) image.src = image.dataset.src!;
      if (!dialog.open) dialog.showModal();
      close.focus({ preventScroll: true });
    },
    close() { if (dialog.open) dialog.close(); },
  };
}
