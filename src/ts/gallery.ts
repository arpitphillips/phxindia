/**
 * Gallery behaviour: category filtering and a <dialog>-based lightbox with
 * keyboard navigation. Works with placeholder SVG art and real <img> alike —
 * the lightbox clones whatever lives inside .work-media.
 */

function visibleItems(items: HTMLElement[]): HTMLElement[] {
  return items.filter((el) => !el.hidden);
}

function initFilters(root: ParentNode): void {
  const bar = root.querySelector<HTMLElement>(".filter-bar");
  if (!bar) return;
  const buttons = Array.from(bar.querySelectorAll<HTMLButtonElement>(".filter-btn"));
  const items = Array.from(root.querySelectorAll<HTMLElement>(".work-item"));

  bar.addEventListener("click", (e: Event) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".filter-btn");
    if (!btn) return;
    const filter = btn.dataset.filter ?? "all";
    for (const b of buttons) b.setAttribute("aria-pressed", String(b === btn));
    for (const item of items) {
      item.hidden = filter !== "all" && item.dataset.category !== filter;
    }
  });
}

function initLightbox(root: ParentNode): void {
  const dialog = root.querySelector<HTMLDialogElement>("dialog.lightbox");
  if (!dialog || typeof dialog.showModal !== "function") return;

  const mediaSlot = dialog.querySelector<HTMLElement>(".lightbox-media");
  const titleSlot = dialog.querySelector<HTMLElement>(".lightbox-title");
  const countSlot = dialog.querySelector<HTMLElement>(".lightbox-count");
  if (!mediaSlot || !titleSlot || !countSlot) return;

  const items = Array.from(root.querySelectorAll<HTMLElement>(".work-item"));
  let index = 0;

  const render = (): void => {
    const pool = visibleItems(items);
    const item = pool[index];
    if (!item) return;
    const media = item.querySelector(".work-media");
    const title = item.querySelector(".work-title");
    mediaSlot.innerHTML = media ? media.innerHTML : "";
    titleSlot.textContent = title ? (title.textContent ?? "") : "";
    countSlot.textContent = `${index + 1} / ${pool.length}`;
  };

  const step = (delta: number): void => {
    const pool = visibleItems(items);
    if (pool.length === 0) return;
    index = (index + delta + pool.length) % pool.length;
    render();
  };

  for (const item of items) {
    const opener = item.querySelector<HTMLButtonElement>("button.work-open");
    if (!opener) continue;
    opener.addEventListener("click", () => {
      index = Math.max(0, visibleItems(items).indexOf(item));
      render();
      dialog.showModal();
    });
  }

  dialog.querySelector(".lightbox-prev")?.addEventListener("click", () => step(-1));
  dialog.querySelector(".lightbox-next")?.addEventListener("click", () => step(1));
  dialog.querySelector(".lightbox-close")?.addEventListener("click", () => dialog.close());

  dialog.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  // Click on the backdrop (outside the inner frame) closes the dialog.
  dialog.addEventListener("click", (e: MouseEvent) => {
    if (e.target === dialog) dialog.close();
  });
}

export function initGallery(): void {
  initFilters(document);
  initLightbox(document);
}
