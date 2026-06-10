/**
 * Gallery behaviour: category filtering and a <dialog>-based lightbox with
 * keyboard navigation. Works with placeholder SVG art and real <img> alike —
 * the lightbox clones whatever lives inside .work-media.
 */
function visibleItems(items) {
    return items.filter((el) => !el.hidden);
}
function initFilters(root) {
    const bar = root.querySelector(".filter-bar");
    if (!bar)
        return;
    const buttons = Array.from(bar.querySelectorAll(".filter-btn"));
    const items = Array.from(root.querySelectorAll(".work-item"));
    bar.addEventListener("click", (e) => {
        var _a;
        const btn = e.target.closest(".filter-btn");
        if (!btn)
            return;
        const filter = (_a = btn.dataset.filter) !== null && _a !== void 0 ? _a : "all";
        for (const b of buttons)
            b.setAttribute("aria-pressed", String(b === btn));
        for (const item of items) {
            item.hidden = filter !== "all" && item.dataset.category !== filter;
        }
    });
}
function initLightbox(root) {
    var _a, _b, _c;
    const dialog = root.querySelector("dialog.lightbox");
    if (!dialog || typeof dialog.showModal !== "function")
        return;
    const mediaSlot = dialog.querySelector(".lightbox-media");
    const titleSlot = dialog.querySelector(".lightbox-title");
    const countSlot = dialog.querySelector(".lightbox-count");
    if (!mediaSlot || !titleSlot || !countSlot)
        return;
    const items = Array.from(root.querySelectorAll(".work-item"));
    let index = 0;
    const render = () => {
        var _a;
        const pool = visibleItems(items);
        const item = pool[index];
        if (!item)
            return;
        const media = item.querySelector(".work-media");
        const title = item.querySelector(".work-title");
        mediaSlot.innerHTML = media ? media.innerHTML : "";
        titleSlot.textContent = title ? ((_a = title.textContent) !== null && _a !== void 0 ? _a : "") : "";
        countSlot.textContent = `${index + 1} / ${pool.length}`;
    };
    const step = (delta) => {
        const pool = visibleItems(items);
        if (pool.length === 0)
            return;
        index = (index + delta + pool.length) % pool.length;
        render();
    };
    for (const item of items) {
        const opener = item.querySelector("button.work-open");
        if (!opener)
            continue;
        opener.addEventListener("click", () => {
            index = Math.max(0, visibleItems(items).indexOf(item));
            render();
            dialog.showModal();
        });
    }
    (_a = dialog.querySelector(".lightbox-prev")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => step(-1));
    (_b = dialog.querySelector(".lightbox-next")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => step(1));
    (_c = dialog.querySelector(".lightbox-close")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => dialog.close());
    dialog.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft")
            step(-1);
        if (e.key === "ArrowRight")
            step(1);
    });
    // Click on the backdrop (outside the inner frame) closes the dialog.
    dialog.addEventListener("click", (e) => {
        if (e.target === dialog)
            dialog.close();
    });
}
export function initGallery() {
    initFilters(document);
    initLightbox(document);
}
