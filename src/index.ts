// ─────────────────────────────────────────────────────────────
//  Polly's People — 1940s scroll + lamp controller
// ─────────────────────────────────────────────────────────────

// ── Lamp positions (top offset relative to .lamp-stage, in vh units)
const LAMP_POSITIONS: Record<string, number> = {
    'lamp-1': 20,   // Home      — left
    'lamp-2': 120,  // Projects  — right
    'lamp-3': 220,  // Downloads — left
    'lamp-4': 320,  // The Dogs  — right
};

const activeLamps = new Set<string>();

// ── Position lamps absolutely on the page
function positionLamps(): void {
    for (const [id, vh] of Object.entries(LAMP_POSITIONS)) {
        const el = document.getElementById(id);
        if (el) {
            el.style.top = `${vh}vh`;
        }
    }
}

// ── Intersection observer — activate lamp when section scrolls into view
function initLampObserver(): void {
    const sections = document.querySelectorAll<HTMLElement>('.section[data-lamp]');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const lampId = (entry.target as HTMLElement).dataset.lamp;
                if (!lampId) return;
                const lamp = document.getElementById(lampId);
                if (!lamp) return;

                if (entry.isIntersecting) {
                    // Re-trigger animation by briefly removing then re-adding class
                    lamp.classList.remove('is-active');
                    void lamp.offsetWidth; // force reflow
                    lamp.classList.add('is-active');

                    entry.target.classList.add('section-lit');
                    activeLamps.add(lampId);
                } else {
                    lamp.classList.remove('is-active');
                    entry.target.classList.remove('section-lit');
                    activeLamps.delete(lampId);
                }
            });
        },
        { threshold: 0.35 }
    );

    sections.forEach((s) => observer.observe(s));
}

// ── Per-lamp flicker: fires only while the lamp is active.
//    Lamp-1 also flickers the logo in lockstep.
function triggerFlicker(lampId: string, sectionEl: HTMLElement): void {
    const lamp = document.getElementById(lampId);
    if (!lamp) return;

    lamp.classList.add('lamp-flickering');
    sectionEl.classList.add('header-flickering');
    if (lampId === 'lamp-1') {
        document.getElementById('logo')?.classList.add('flickering');
    }

    setTimeout(() => {
        lamp.classList.remove('lamp-flickering');
        sectionEl.classList.remove('header-flickering');
        if (lampId === 'lamp-1') {
            document.getElementById('logo')?.classList.remove('flickering');
        }
    }, 480);
}

function scheduleFlicker(lampId: string, sectionEl: HTMLElement): void {
    const delay = 3000 + Math.random() * 8000;
    setTimeout(() => {
        if (activeLamps.has(lampId)) {
            triggerFlicker(lampId, sectionEl);
        }
        scheduleFlicker(lampId, sectionEl);
    }, delay);
}

function initAllFlickers(): void {
    document.querySelectorAll<HTMLElement>('.section[data-lamp]').forEach((section) => {
        const lampId = section.dataset.lamp;
        if (lampId) scheduleFlicker(lampId, section);
    });
}

// ── Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    positionLamps();
    initLampObserver();
    initAllFlickers();
});