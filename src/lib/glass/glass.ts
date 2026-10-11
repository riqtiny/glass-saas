/**
 * glass.ts — the liquid-glass engine.
 *
 * This is NOT a `backdrop-filter: blur()`. It is a 2D *refraction*: the backdrop is
 * displaced by an amount that varies across the surface of the panel, so the background
 * bends as it passes through the glass. Near the rim the bend is strong, in the middle it
 * is zero. Three displacement passes at slightly different strengths (one per colour
 * channel) give the rim its chromatic fringe.
 *
 * The math lives in `buildMap()`; the SVG filter chain is assembled programmatically here.
 *
 * See GLASS.md for the full teardown, the measured lens profile and the footguns.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

/* ------------------------------------------------------------------ tunables */

export interface GlassTunables {
	/** Corner radius in px. MUST match the element's border-radius — the action sets both. */
	radius: number;
	/** Width in px of the refraction band at the rim, or 'auto' to scale with the panel. */
	band: number | 'auto';
	/** Inset of the neutral island, as a fraction of height. Lower = stronger rim. */
	inset: number;
	/** Displacement strength in px (negative = backdrop is pulled inward at the rim). */
	scale: number;
	/** Total spread between the red and blue passes. 0 disables chromatic aberration. */
	chromatic: number;
	/** Opacity of the neutral island. 1 = mathematically neutral centre. */
	alpha: number;
	/** Symmetric vertical lens (fixed version of the blue-ramp quirk in GLASS.md §15.1). */
	vertical: boolean;
}

export type GlassOptions = Partial<GlassTunables>;

export const DEFAULT_TUNABLES: GlassTunables = {
	radius: 20,
	band: 'auto',
	inset: 0.035,
	scale: -180,
	chromatic: 20,
	alpha: 1,
	vertical: true
};

/** Presets for the three surface sizes a SaaS UI actually uses. */
export const GLASS_PRESETS = {
	/** Navbar / pill buttons — the shape the original recipe was tuned for. */
	pill: { radius: 26, band: 8, scale: -180, chromatic: 20 },
	/** Cards, panels, popovers. */
	panel: { radius: 24, band: 14, scale: -150, chromatic: 18 },
	/** Big surfaces (sidebar, chart frame) — softer band, gentler bend. */
	window: { radius: 28, band: 18, scale: -130, chromatic: 16 },
	/** Small chips and inputs — cheap, because refraction cost scales with area. */
	chip: { radius: 14, band: 6, scale: -110, chromatic: 12 }
} as const satisfies Record<string, Partial<GlassTunables>>;

export type GlassPreset = keyof typeof GLASS_PRESETS;

/* ------------------------------------------------------------------ the map */

/**
 * `feDisplacementMap` samples a channel and moves the pixel by `scale * (value - 0.5)`.
 * So 0.5 means "leave this pixel alone". The whole design problem is therefore: paint a
 * map that is exactly neutral everywhere except in a band near the rim, where it ramps away
 * from neutral.
 *
 * Layers, bottom to top:
 *   1. black base            — "no idea" state (0 is a valid displacement, not transparency)
 *   2. horizontal ramp (red) — the horizontal half of the lens, symmetric L↔R
 *   3. vertical ramp (green) — the vertical half of the lens, symmetric T↔B (screen blend
 *                              so it can only ever *add* G, never clobber R)
 *   4. neutral island (grey) — 50% grey = exactly 0.5, blurred to feather the rim ramp
 */
export function buildMap(w: number, h: number, t: GlassTunables): string {
	const radius = Math.max(0, Math.min(t.radius, Math.min(w, h) / 2));
	const band =
		typeof t.band === 'number' ? t.band : clamp(Math.min(w, h) * 0.16, 6, 18);
	const i = h * t.inset;
	const grey = `hsl(0 0% 50% / ${t.alpha})`;

	// GLASS.md §15.1: the original used `blue`, whose G channel is 0 everywhere, so the
	// vertical ramp was inert and both rims dragged the backdrop the same way. Lime at the
	// top ramp reaches G, giving a properly symmetric lens.
	const yStops = t.vertical
		? `<stop offset="0%" stop-color="#0f0"/><stop offset="100%" stop-color="#0000"/>`
		: `<stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="blue"/>`;

	return `<svg xmlns="${SVG_NS}" viewBox="0 0 ${w} ${h}" style="isolation:isolate"><defs><linearGradient id="x" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="red"/></linearGradient><linearGradient id="y" x1="0%" y1="0%" x2="0%" y2="100%">${yStops}</linearGradient></defs><rect width="${w}" height="${h}" fill="black"/><rect width="${w}" height="${h}" rx="${radius}" fill="url(#x)"/><rect width="${w}" height="${h}" rx="${radius}" fill="url(#y)" style="mix-blend-mode:screen"/><rect x="${i}" y="${i}" width="${w - i * 2}" height="${h - i * 2}" rx="${radius}" fill="${grey}" style="filter:blur(${band}px)"/></svg>`;
}

/* ------------------------------------------------------------------ the filter */

/** Keep R / G / B respectively, drop the other two channels. Alpha is preserved. */
const CHANNEL_MATRIX = {
	red: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0',
	green: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0',
	blue: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0'
} as const;

function el<K extends keyof SVGElementTagNameMap>(
	tag: K,
	attrs: Record<string, string | number> = {}
): SVGElementTagNameMap[K] {
	const node = document.createElementNS(SVG_NS, tag);
	for (const key in attrs) node.setAttribute(key, String(attrs[key]));
	return node;
}

function buildChain(
	filter: SVGFilterElement,
	t: GlassTunables
): SVGFEImageElement {
	const feImage = el('feImage', {
		x: 0,
		y: 0,
		width: '100%',
		height: '100%',
		preserveAspectRatio: 'none',
		result: 'map'
	});
	filter.append(feImage);

	const passes = ['red', 'green', 'blue'] as const;
	passes.forEach((name, i) => {
		// Three strengths of the same map = chromatic aberration. The fringe is zero in the
		// centre (all three coincide) and maximal at the rim, exactly like a real lens.
		filter.append(
			el('feDisplacementMap', {
				in: 'SourceGraphic',
				in2: 'map',
				scale: t.chromatic === 0 ? t.scale : t.scale + t.chromatic * i,
				xChannelSelector: 'R',
				yChannelSelector: 'G',
				result: `d${name}`
			})
		);
		filter.append(
			el('feColorMatrix', { in: `d${name}`, type: 'matrix', result: name, values: CHANNEL_MATRIX[name] })
		);
	});

	// Screen degenerates to plain addition here, because the three results are
	// channel-isolated: no clipping, no darkening.
	filter.append(el('feBlend', { in: 'red', in2: 'green', mode: 'screen', result: 'rg' }));
	filter.append(el('feBlend', { in: 'rg', in2: 'blue', mode: 'screen', result: 'rgb' }));
	// ~1px softening: hides the hairline seams between the recombined channels.
	filter.append(el('feGaussianBlur', { in: 'rgb', stdDeviation: 0.5 }));

	return feImage;
}

/* ------------------------------------------------------------------ the action */

/** Unique per surface AND per document. Filter ids are document-global, so this matters
 *  — and it has to survive HMR, hence the counter lives on globalThis. */
const counter = globalThis as unknown as { __gwGlassSeq: number };
counter.__gwGlassSeq = (counter.__gwGlassSeq ?? 0) + 1;
const nextId = () => `gw-glass-${counter.__gwGlassSeq++}`;

const keyOf = (t: GlassTunables) => `${t.radius}|${t.band}|${t.inset}|${t.scale}|${t.chromatic}|${t.alpha}|${t.vertical}`;

export interface GlassAction {
	update(options: GlassOptions): void;
	destroy(): void;
}

export function glass(node: HTMLElement, options: GlassOptions = {}): GlassAction {
	const uid = nextId();
	const filterId = `${uid}-f`;

	let tunables: GlassTunables = { ...DEFAULT_TUNABLES, ...options };
	let appliedKey = '';

	// GLASS.md §14.2: opacity:0 keeps the host invisible but present. `display:none` on the
	// <svg> makes url(#filter) resolution inconsistent across engines.
	const svg = el('svg', { class: 'glass-svg', 'aria-hidden': 'true', focusable: 'false' });
	const defs = el('defs');
	const filter = el('filter', {
		id: filterId,
		// Mandatory, not decorative: the SVG default is linearRGB, which would move the 0.5
		// neutral point and land the lens in the wrong place.
		'color-interpolation-filters': 'sRGB',
		x: '0%',
		y: '0%',
		width: '100%',
		height: '100%'
	});
	defs.append(filter);
	svg.append(defs);

	let feImage: SVGFEImageElement | null = null;

	// One source of truth for the radius: the map is baked at a corner radius, so the CSS
	// value and the map value must never drift apart. The action writes both. (GLASS.md §14.4)
	node.style.setProperty('border-radius', `${tunables.radius}px`);

	function applyChain() {
		const key = keyOf(tunables);
		if (key === appliedKey) return;
		appliedKey = key;
		filter.textContent = '';
		feImage = buildChain(filter, tunables);
		// GLASS.md §5: the tint is painted *on top of* the refraction, not below it.
		node.style.setProperty('--gw-filter', `url(#${filterId})`);
		syncMap();
	}

	// The map's gradients are in user units of the panel's own pixel size, so it has to be
	// rebuilt whenever that size changes. String concat + setAttribute — do not optimise.
	function syncMap() {
		if (!feImage) return;
		const { width, height } = node.getBoundingClientRect();
		if (!width || !height) return; // display:none — never build a 0x0 map
		const svg = buildMap(width, height, tunables);
		// encodeURIComponent is required, not cosmetic: the data URI contains `#`, `<` and `>`.
		feImage.setAttribute('href', `data:image/svg+xml,${encodeURIComponent(svg)}`);
	}

	if (!node.contains(svg)) node.append(svg);

	const ro = new ResizeObserver(syncMap);
	ro.observe(node);
	document.fonts?.ready.then(syncMap);
	applyChain();

	return {
		update(next) {
			tunables = { ...tunables, ...next };
			if (tunables.radius !== Number(node.style.borderRadius.replace('px', ''))) {
				node.style.setProperty('border-radius', `${tunables.radius}px`);
			}
			applyChain();
		},
		destroy() {
			ro.disconnect();
			svg.remove();
		}
	};
}

/** `saturate()`-style finishing applied after the refraction, via `--gw-finish`. */

function clamp(n: number, lo: number, hi: number) {
	return Math.min(hi, Math.max(lo, n));
}