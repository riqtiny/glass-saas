/**
 * App preferences. Runes in a `.svelte.ts` module = shared reactive state.
 *
 * These three flags each disable a piece of the effect, which is the honest answer to
 * "this looks amazing but my laptop fan is spinning":
 *   motion  → freeze the animated backdrop, so the filter stops recomputing every frame
 *   glass   → swap the refraction for a plain blur (the tint still keeps text readable)
 */

export type Theme = 'dark' | 'light';

type Prefs = {
	theme: Theme;
	motion: boolean;
	glass: boolean;
};

const KEY = 'gw:prefs';
const reduced = () =>
	typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

let theme = $state<Theme>('dark');
let motion = $state(true);
let glass = $state(true);

function read(): Partial<Prefs> {
	try {
		return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Prefs>;
	} catch {
		return {};
	}
}

function write() {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(KEY, JSON.stringify({ theme, motion, glass } satisfies Prefs));
	} catch {
		/* private mode — preferences just don't persist */
	}
}

function apply() {
	const root = document.documentElement;
	root.dataset.theme = theme;
	root.dataset.glass = glass ? 'on' : 'off';
	root.dataset.motion = motion ? 'on' : 'off';
}

export const prefs = {
	get theme() {
		return theme;
	},
	get motion() {
		return motion;
	},
	get glass() {
		return glass;
	},

	setTheme(next: Theme) {
		theme = next;
		apply();
		write();
	},
	toggleTheme() {
		prefs.setTheme(theme === 'dark' ? 'light' : 'dark');
	},
	setMotion(next: boolean) {
		motion = next;
		apply();
		write();
	},
	setGlass(next: boolean) {
		glass = next;
		apply();
		write();
	},

	/** Called once from the root layout, on the client only. */
	init() {
		if (typeof document === 'undefined') return;
		const stored = read();
		theme = stored.theme ?? (document.documentElement.dataset.theme as Theme) ?? 'dark';
		motion = stored.motion ?? !reduced();
		glass = stored.glass ?? true;
		apply();
	}
};