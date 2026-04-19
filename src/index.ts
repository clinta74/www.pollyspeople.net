// ─────────────────────────────────────────────────────────────
//  Polly's People — 1940s scroll + lamp controller
// ─────────────────────────────────────────────────────────────

const activeLamps = new Set<string>();

// ── Position each lamp so its vertical centre aligns with its section's title
function positionLamps(): void {
    const stage = document.querySelector<HTMLElement>('.lamp-stage');
    if (!stage) return;

    const stageTop = stage.getBoundingClientRect().top + window.scrollY;
    const lampHeight = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--lamp-height')
    ) || 520;

    document.querySelectorAll<HTMLElement>('.section[data-lamp]').forEach((section) => {
        const lampId = section.dataset.lamp;
        if (!lampId) return;
        const lamp = document.getElementById(lampId);
        if (!lamp) return;

        // Home uses #logo; other sections use .section-header-svg
        const title = section.querySelector<HTMLElement>('#logo, .section-header-svg');
        if (!title) return;

        const titleRect = title.getBoundingClientRect();
        const titleTop = titleRect.top + window.scrollY - stageTop;
        const isHome = section.id === 'home';
        const offset = isHome
            ? titleTop + titleRect.height / 2 - lampHeight / 2  // centre-align for home
            : titleTop - lampHeight * 0.15;                      // top-align, shifted up 15% for other sections
        lamp.style.top = `${Math.max(0, offset)}px`;
    });
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

                    if (lampId === 'lamp-4') {
                        document.getElementById('water-reflection-group')?.classList.add('is-active');
                    }
                } else {
                    lamp.classList.remove('is-active');
                    entry.target.classList.remove('section-lit');
                    activeLamps.delete(lampId);

                    if (lampId === 'lamp-4') {
                        document.getElementById('water-reflection-group')?.classList.remove('is-active');
                    }
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
    if (lampId === 'lamp-4') {
        document.getElementById('water-reflection-group')?.classList.add('water-reflection-flickering');
    }

    setTimeout(() => {
        lamp.classList.remove('lamp-flickering');
        sectionEl.classList.remove('header-flickering');
        if (lampId === 'lamp-1') {
            document.getElementById('logo')?.classList.remove('flickering');
        }
        if (lampId === 'lamp-4') {
            document.getElementById('water-reflection-group')?.classList.remove('water-reflection-flickering');
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

window.addEventListener('resize', positionLamps);