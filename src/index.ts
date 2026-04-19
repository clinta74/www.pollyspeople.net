// ─────────────────────────────────────────────────────────────
//  Polly's People — 1940s scroll + lamp controller
// ─────────────────────────────────────────────────────────────
import { DOGS } from './dogs-data';

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

// ── Dog photo gallery ─────────────────────────────────────────
//    Fetches /dogs/manifest.json, matches filenames to dog roster,
//    and builds a click-to-cycle stacked card gallery.
// ─────────────────────────────────────────────────────────────

interface PhotoEntry {
    url: string;
    dogKey: string;
    alt: string;
    label: string;
}

function buildCard(entry: PhotoEntry, zIndex: number): HTMLElement {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.style.zIndex = String(zIndex);

    // Mat (off-white border)
    const mat = document.createElement('div');
    mat.className = 'photo-card__mat';

    const img = document.createElement('img');
    img.src = entry.url;
    img.alt = entry.alt;
    img.loading = 'lazy';
    mat.appendChild(img);
    card.appendChild(mat);

    // Corner tabs (×4)
    for (const pos of ['tl', 'tr', 'bl', 'br'] as const) {
        const corner = document.createElement('div');
        corner.className = `photo-card__corner photo-card__corner--${pos}`;
        card.appendChild(corner);
    }

    // Side rivets (×2)
    for (const side of ['left', 'right'] as const) {
        const rivet = document.createElement('div');
        rivet.className = `photo-card__rivet photo-card__rivet--${side}`;
        card.appendChild(rivet);
    }

    // Name label
    const label = document.createElement('div');
    label.className = 'photo-card__label';
    label.textContent = entry.label;
    card.appendChild(label);

    return card;
}

function restack(gallery: HTMLElement): void {
    const cards = Array.from(gallery.querySelectorAll<HTMLElement>('.photo-card:not(.photo-card--peeling)'));
    const total = cards.length;
    cards.forEach((card, i) => {
        card.style.zIndex = String(total - i);
    });
}

async function initDogGallery(): Promise<void> {
    const gallery = document.getElementById('dogs-gallery');
    if (!gallery) return;

    let filenames: string[];
    try {
        const res = await fetch('/dogs/manifest.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        filenames = await res.json() as string[];
    } catch (err) {
        console.warn('Dogs gallery: could not load manifest.json', err);
        return;
    }

    // Build photo entries by matching filename prefix to the DOGS roster
    const entries: PhotoEntry[] = filenames.map((filename) => {
        const prefix = filename.split('-')[0].toLowerCase();
        const dog = DOGS.find(d => d.key === prefix);
        const dateStr = dog
            ? dog.died
                ? `${dog.born} – ${dog.died}`
                : `${dog.born} –`
            : '';
        return {
            url: `/dogs/${filename}`,
            dogKey: prefix,
            alt: dog ? `${dog.name}, ${dog.breed}` : filename,
            label: dog ? `${dog.name}  ·  ${dateStr}` : filename,
        };
    });

    if (entries.length === 0) return;

    // Capture as non-null for closures below
    const galleryEl: HTMLElement = gallery;

    // Build cards — last in the array = bottom of stack (lowest z-index)
    entries.forEach((entry, i) => {
        const card = buildCard(entry, entries.length - i);
        galleryEl.appendChild(card);
    });

    // Make gallery keyboard-accessible
    galleryEl.setAttribute('tabindex', '0');

    function cycleTop(): void {
        const topCard = galleryEl.querySelector<HTMLElement>('.photo-card:not(.photo-card--peeling)');
        if (!topCard || galleryEl.querySelectorAll('.photo-card').length <= 1) return;

        topCard.classList.add('photo-card--peeling');
        topCard.addEventListener('animationend', () => {
            // Hide inline before removing the animation class so the
            // snap-back to the original transform is never visible.
            topCard.style.opacity = '0';
            topCard.classList.remove('photo-card--peeling');
            galleryEl.appendChild(topCard); // move to bottom of DOM = bottom of stack
            restack(galleryEl);
            // Restore opacity in the next frame after layout has settled.
            requestAnimationFrame(() => { topCard.style.opacity = ''; });
        }, { once: true });
    }

    // Enable smooth restack transitions only after initial placement
    requestAnimationFrame(() => galleryEl.classList.add('dogs-gallery--ready'));

    galleryEl.addEventListener('click', cycleTop);
    galleryEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cycleTop(); }
    });
}

// ── Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    positionLamps();
    initLampObserver();
    initAllFlickers();
    initDogGallery();
});

window.addEventListener('resize', positionLamps);