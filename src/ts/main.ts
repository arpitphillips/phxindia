/** Entry point: wires up all behaviour after the DOM is ready. */
import { initNav } from "./nav.js";
import { initGallery } from "./gallery.js";
import { initForm } from "./form.js";

function initReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>(".reveal");
  if (targets.length === 0) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  targets.forEach((el) => io.observe(el));
}

function initYear(): void {
  const el = document.getElementById("year");
  if (el) el.textContent = String(new Date().getFullYear());
}

function boot(): void {
  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");
  initNav();
  initReveal();
  initGallery();
  initForm();
  initYear();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
