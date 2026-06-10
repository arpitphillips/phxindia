/** Mobile navigation: overlay menu with aria-expanded state and scroll lock. */
export function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".nav-menu");
    if (!toggle || !menu)
        return;
    const setOpen = (open) => {
        toggle.setAttribute("aria-expanded", String(open));
        menu.classList.toggle("is-open", open);
        document.body.classList.toggle("nav-locked", open);
    };
    toggle.addEventListener("click", () => {
        setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
            setOpen(false);
            toggle.focus();
        }
    });
    // Close the overlay when a navigation choice is made.
    menu.addEventListener("click", (e) => {
        if (e.target.closest("a"))
            setOpen(false);
    });
    // Reset state if the viewport leaves mobile range while the menu is open.
    const mq = window.matchMedia("(min-width: 761px)");
    mq.addEventListener("change", () => setOpen(false));
}
