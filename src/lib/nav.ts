import type { IconName } from '#lib/components/icons';

export type NavItem = {
	href: string;
	label: string;
	icon: IconName;
	badge?: string;
	end?: boolean;
};

/** Marketing navbar. */
export const MARKETING_LINKS = [
	{ href: '/#features', label: 'Features' },
	{ href: '/#showcase', label: 'Showcase' },
	{ href: '/#pricing', label: 'Pricing' },
	{ href: '/app', label: 'Dashboard' }
] as const;

/** App shell sidebar. */
export const APP_NAV: NavItem[] = [
	{ href: '/app', label: 'Overview', icon: 'grid', end: true },
	{ href: '/app/analytics', label: 'Analytics', icon: 'chart' },
	{ href: '/app/customers', label: 'Customers', icon: 'users', badge: '12' },
	{ href: '/app/data', label: 'Data', icon: 'database' },
	{ href: '/app/settings', label: 'Settings', icon: 'settings' }
];

/** Mobile bottom bar — the first five, always. */
export const MOBILE_NAV = APP_NAV.slice(0, 5);