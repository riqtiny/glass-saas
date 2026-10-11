/**
 * Mock data for the template. Deterministic — no Math.random — so the SSR/SPA output and
 * the visuals stay identical between reloads.
 */

/** Deterministic 0..1 PRNG. */
function rng(seed: number) {
	let s = seed;
	return () => {
		s = (s * 1664525 + 1013904223) % 4294967296;
		return s / 4294967296;
	};
}

export type Kpi = {
	label: string;
	value: string;
	delta: number;
	spark: number[];
	hint: string;
};

export const KPIS: Kpi[] = (() => {
	const seeds = [11, 27, 43, 61];
	const labels = [
		{ label: 'Monthly recurring revenue', prefix: '$', base: 84_200, step: 1_900, suffix: '' },
		{ label: 'Active workspaces', prefix: '', base: 12_480, step: 320, suffix: '' },
		{ label: 'Avg. session length', prefix: '', base: 8.4, step: 0.3, suffix: ' min' },
		{ label: 'Trial → paid conversion', prefix: '', base: 3.9, step: 0.2, suffix: '%' }
	];

	return labels.map((spec, i) => {
		const rand = rng(seeds[i]);
		const spark = Array.from({ length: 24 }, (_, n) => {
			const drift = n * spec.step * 0.9;
			const wave = Math.sin(n / 2.6 + i) * spec.step * 2.4;
			return Math.max(0, spec.base + drift + wave + (rand() - 0.5) * spec.step * 1.6);
		});
		return {
			label: spec.label,
			value:
				spec.step < 1
					? `${spec.base.toFixed(1)}${spec.suffix}`
					: `${spec.prefix}${Math.round(spark[23]).toLocaleString('en-US')}${spec.suffix}`,
			delta: [12.4, 8.1, -3.2, 4.7][i],
			spark,
			hint: 'vs. previous 30 days'
		};
	});
})();

/** 30 daily revenue points, in thousands. */
export const REVENUE: number[] = (() => {
	const rand = rng(7);
	let value = 2_400;
	return Array.from({ length: 30 }, (_, i) => {
		const growth = 18 + i * 3.4;
		const seasonality = Math.sin(i / 2.1) * 260 + Math.cos(i / 4.3) * 150;
		value += growth + (rand() - 0.42) * 300;
		return Math.round(Math.max(1_200, value + seasonality));
	});
})();

export const REVENUE_LABELS = REVENUE.map((_, i) => {
	const date = new Date(2026, 8, 1 + i);
	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
});

export type Plan = {
	name: string;
	price: string;
	period: string;
	blurb: string;
	features: string[];
	cta: string;
	highlighted?: boolean;
};

export const PLANS: Plan[] = [
	{
		name: 'Hobby',
		price: '$0',
		period: 'forever',
		blurb: 'For side projects and weekend prototypes.',
		features: ['1 workspace', '5k events / month', 'Community support', '1 seat'],
		cta: 'Start for free'
	},
	{
		name: 'Scale',
		price: '$49',
		period: 'per seat / month',
		blurb: 'For teams shipping to production every week.',
		features: [
			'Unlimited workspaces',
			'1M events / month',
			'SAML SSO & audit log',
			'Priority support'
		],
		cta: 'Start 14-day trial',
		highlighted: true
	},
	{
		name: 'Enterprise',
		price: 'Custom',
		period: 'annual',
		blurb: 'For platforms with compliance obligations.',
		features: [
			'Unlimited events',
			'Private VPC or on-prem',
			'Custom DPA & SLA',
			'Dedicated engineer'
		],
		cta: 'Talk to sales'
	}
];

export type Feature = {
	icon: 'zap' | 'shield' | 'sparkles' | 'database' | 'globe' | 'layers';
	title: string;
	body: string;
};

export const FEATURES: Feature[] = [
	{
		icon: 'zap',
		title: 'Real refraction, not a blur',
		body: 'Every surface displaces the page behind it through an SVG displacement map, rebuilt at the panel’s live size. Bend it and the whole UI bends with it.'
	},
	{
		icon: 'sparkles',
		title: 'Legible at any brightness',
		body: 'A tuned tint sits on top of the refraction and every label carries its own shadow, so contrast survives whatever is drifting behind it.'
	},
	{
		icon: 'shield',
		title: 'Graceful degradation',
		body: 'No backdrop-filter? The tint alone still reads. Too expensive? One preference swaps the refraction for a plain blur.'
	},
	{
		icon: 'database',
		title: 'Runes all the way down',
		body: 'Svelte 5 runes, snippet-based components, $derived state. The whole template is one npm install away from your own product.'
	},
	{
		icon: 'layers',
		title: 'Designed as a system',
		body: 'Four presets — pill, panel, window, chip — cover every surface in the template. Build new ones by picking a preset.'
	},
	{
		icon: 'globe',
		title: 'Ship it anywhere',
		body: 'Static adapter, SPA mode, no server runtime. Drop the build on any host, or flip SSR on when you outgrow it.'
	}
];

export type Row = {
	id: string;
	company: string;
	plan: 'Scale' | 'Hobby' | 'Enterprise';
	status: 'active' | 'trialing' | 'past_due';
	mrr: number;
	seats: number;
};

export const WORKSPACES: Row[] = [
	{ id: 'ws_8F21', company: 'Northwind Labs', plan: 'Scale', status: 'active', mrr: 1_960, seats: 40 },
	{ id: 'ws_7C04', company: 'Halcyon Health', plan: 'Enterprise', status: 'active', mrr: 12_400, seats: 210 },
	{ id: 'ws_9A13', company: 'Studio Perigee', plan: 'Hobby', status: 'trialing', mrr: 0, seats: 3 },
	{ id: 'ws_5D77', company: 'Orchard Freight', plan: 'Scale', status: 'past_due', mrr: 490, seats: 10 },
	{ id: 'ws_2B98', company: 'Kite & Compass', plan: 'Hobby', status: 'active', mrr: 0, seats: 2 },
	{ id: 'ws_6E32', company: 'Meridian Bank', plan: 'Enterprise', status: 'active', mrr: 28_900, seats: 640 }
];

export type Event = {
	who: string;
	initials: string;
	what: string;
	when: string;
	icon: 'users' | 'zap' | 'shield' | 'download' | 'settings';
};

export const ACTIVITY: Event[] = [
	{ who: 'Ana Duarte', initials: 'AD', what: 'invited 6 teammates to Northwind Labs', when: '4m', icon: 'users' },
	{ who: 'Billing webhook', initials: 'BW', what: 'retry 2 succeeded for Meridian Bank', when: '21m', icon: 'zap' },
	{ who: 'Tomás Vidal', initials: 'TV', what: 'rotated an API key', when: '1h', icon: 'shield' },
	{ who: 'Rina Mahendra', initials: 'RM', what: 'exported the events table as CSV', when: '3h', icon: 'download' },
	{ who: 'Auto', initials: 'AU', what: 'raised the trial limit to 50 seats', when: '5h', icon: 'settings' }
];

export const TESTIMONIALS = [
	{
		quote:
			'We shipped the glass surfaces on day one and support tickets about readability dropped to zero. That was the whole pitch.',
		who: 'Priya Raman',
		role: 'Head of Design, Northwind Labs'
	},
	{
		quote:
			'The refraction is not a filter stack we bolted on. It is a documented, tunable system — radius, band, chromatic spread. We ship variants of it.',
		who: 'Marc Oyelaran',
		role: 'Principal Engineer, Halcyon Health'
	}
];

export const LOGOS = ['Northwind', 'Halcyon', 'Perigee', 'Orchard', 'Meridian', 'Kite'];