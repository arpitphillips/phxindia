/**
 * "Book a shoot" form: inline validation, JSON submission to the booking
 * API, and a mailto: fallback so the function survives the API being
 * unreachable (or never deployed).
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function fieldValue(form, name) {
    const el = form.elements.namedItem(name);
    if (el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement) {
        return el.value.trim();
    }
    return "";
}
function setError(form, name, message) {
    const el = form.elements.namedItem(name);
    const slot = form.querySelector(`[data-error-for="${name}"]`);
    if (el instanceof HTMLElement) {
        el.setAttribute("aria-invalid", message ? "true" : "false");
    }
    if (slot)
        slot.textContent = message;
}
function validate(form, payload) {
    let ok = true;
    setError(form, "name", "");
    setError(form, "email", "");
    setError(form, "message", "");
    if (payload.name.length < 2) {
        setError(form, "name", "Please tell us your name.");
        ok = false;
    }
    if (!EMAIL_RE.test(payload.email)) {
        setError(form, "email", "Please enter a valid email address.");
        ok = false;
    }
    if (payload.message.length < 10) {
        setError(form, "message", "Please describe your project in a few words.");
        ok = false;
    }
    return ok;
}
function mailtoFallback(payload, recipient) {
    const subject = `Shoot inquiry — ${payload.name}`;
    const body = [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        `Phone: ${payload.phone || "—"}`,
        `Service: ${payload.service || "—"}`,
        `Project location: ${payload.location || "—"}`,
        "",
        payload.message,
    ].join("\n");
    return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
export function initForm() {
    var _a, _b;
    const form = document.querySelector("form#booking-form");
    if (!form)
        return;
    const status = form.querySelector(".form-status");
    const endpoint = (_a = form.dataset.endpoint) !== null && _a !== void 0 ? _a : "/api/booking";
    const recipient = (_b = form.dataset.recipient) !== null && _b !== void 0 ? _b : "mailbox@phxindia.in";
    const say = (message, kind) => {
        if (!status)
            return;
        status.textContent = message;
        status.classList.toggle("is-success", kind === "success");
        status.classList.toggle("is-error", kind === "error");
    };
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const payload = {
            name: fieldValue(form, "name"),
            email: fieldValue(form, "email"),
            phone: fieldValue(form, "phone"),
            service: fieldValue(form, "service"),
            location: fieldValue(form, "location"),
            message: fieldValue(form, "message"),
        };
        if (!validate(form, payload)) {
            say("Please fix the highlighted fields.", "error");
            return;
        }
        say("Sending your inquiry…", "");
        const submitBtn = form.querySelector("button[type=submit]");
        if (submitBtn)
            submitBtn.disabled = true;
        void fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then(async (res) => {
            if (!res.ok)
                throw new Error(`API responded ${res.status}`);
            const data = (await res.json());
            form.reset();
            say(data.reference
                ? `Thank you — inquiry received (ref ${data.reference}). We will get back to you shortly.`
                : "Thank you — inquiry received. We will get back to you shortly.", "success");
        })
            .catch(() => {
            // API not reachable: hand the inquiry to the visitor's mail client.
            window.location.href = mailtoFallback(payload, recipient);
            say(`Our booking service is momentarily offline, so we have opened your email app instead — or write to ${recipient} directly.`, "error");
        })
            .finally(() => {
            if (submitBtn)
                submitBtn.disabled = false;
        });
    });
}
