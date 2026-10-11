<script lang="ts">
	import { page } from '$app/state';
	import GlassSurface from '#lib/glass/GlassSurface.svelte';
	import { APP_NAV } from '#lib/nav';
	import Icon from './Icon.svelte';
	import Segmented from './Segmented.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	type Props = { range?: string; onsearch?: () => void; onrange?: (value: string) => void };

	let { range = $bindable('30d'), onsearch, onrange }: Props = $props();

	const RANGES = [
		{ value: '7d', label: '7D' },
		{ value: '30d', label: '30D' },
		{ value: '90d', label: '90D' },
		{ value: '1y', label: '1Y' }
	];

	// Longest href wins, so /app/settings never resolves to "Overview".
	const title = $derived.by(() => {
		const path = page.url.pathname;
		const match = [...APP_NAV]
			.sort((a, b) => b.href.length - a.href.length)
			.find((item) => path === item.href || path.startsWith(`${item.href}/`));
		return match?.label ?? 'Overview';
	});

	let scrolled = $state(false);

	$effect(() => {
		const onScroll = () => (scrolled = window.scrollY > 8);
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<div class="appbar" data-scrolled={scrolled}>
	<GlassSurface preset="pill" class="appbar__pill">
		<div class="glass-inner appbar__inner">
			<div class="appbar__lead">
				<h1 class="appbar__title">{title}</h1>
				<Segmented
					options={RANGES}
					value={range}
					size="sm"
					label="Date range"
					onchange={(value) => {
						range = value;
						onrange?.(value);
					}}
				/>
			</div>

			<div class="appbar__tools">
				<button
					type="button"
					class="appbar__search"
					onclick={() => onsearch?.()}
					aria-label="Search"
				>
					<Icon name="search" size={16} />
					<span class="appbar__search-text">Search…</span>
					<span class="kbd" aria-hidden="true">⌘K</span>
				</button>

				<button type="button" class="appbar__icon" aria-label="Notifications">
					<Icon name="bell" size={17} />
					<span class="appbar__dot" aria-hidden="true"></span>
				</button>

				<ThemeToggle />

				<span class="avatar avatar--sm" aria-hidden="true">RM</span>
			</div>
		</div>
	</GlassSurface>
</div>

<style>
	.appbar {
		position: sticky;
		top: 12px;
		z-index: 20;
		display: flex;
		justify-content: flex-end;
	}

	:global(.appbar__pill) {
		height: 56px;
		width: 100%;
		background: var(--gw-tint);
	}

	.appbar__inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 0 8px 0 18px;
	}

	.appbar__lead {
		display: flex;
		align-items: center;
		gap: 14px;
		min-width: 0;
	}
	.appbar__title {
		font-size: var(--step-1);
		font-weight: 600;
		white-space: nowrap;
	}

	.appbar__tools {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.appbar__search {
		display: flex;
		align-items: center;
		gap: 8px;
		height: 34px;
		padding: 0 8px 0 11px;
		border: 0;
		border-radius: 11px;
		color: var(--text-faint);
		background: var(--hairline);
		cursor: pointer;
		font-size: var(--step--1);
		transition: color 0.16s var(--ease), background-color 0.16s var(--ease);
	}
	.appbar__search:hover {
		color: var(--text);
		background: var(--hairline-strong);
	}

	.appbar__icon {
		position: relative;
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		border: 0;
		border-radius: 10px;
		color: var(--text-dim);
		background: transparent;
		cursor: pointer;
	}
	.appbar__icon:hover {
		color: var(--text);
		background: var(--hairline);
	}
	.appbar__dot {
		position: absolute;
		top: 7px;
		right: 8px;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--negative);
		box-shadow: 0 0 0 2px var(--gw-tint-solid);
	}

	@media (max-width: 720px) {
		.appbar__search-text,
		.appbar__search .kbd {
			display: none;
		}
		.appbar__search {
			width: 34px;
			padding: 0;
			justify-content: center;
		}
		.appbar__inner {
			padding-left: 14px;
		}
	}
	@media (max-width: 520px) {
		.appbar__lead :global(.segmented) {
			display: none;
		}
	}
</style>