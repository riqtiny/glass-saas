<!--
	The marketing navbar: one glass pill, floating.

	Note what is NOT here: any `filter`, `opacity < 1`, `mask` or `mix-blend-mode` on an
	ancestor. Those would make the ancestor a Backdrop Root and the pill would end up
	refracting only itself. The hide-on-scroll animation is therefore a pure `transform`.
-->
<script lang="ts">
	import GlassSurface from '#lib/glass/GlassSurface.svelte';
	import { MARKETING_LINKS } from '#lib/nav';
	import Brand from './Brand.svelte';
	import Icon from './Icon.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	let { onsearch }: { onsearch?: () => void } = $props();

	let hidden = $state(false);
	let scrolled = $state(false);

	$effect(() => {
		let last = window.scrollY;
		let frame = 0;

		const tick = () => {
			const y = window.scrollY;
			scrolled = y > 12;
			hidden = y > 160 && y > last + 6;
			last = y;
			frame = 0;
		};
		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(tick);
		};

		window.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScroll);
			if (frame) cancelAnimationFrame(frame);
		};
	});
</script>

<header class="topnav" data-hidden={hidden} data-scrolled={scrolled}>
	<GlassSurface preset="pill" class="topnav__pill">
		<div class="glass-inner topnav__inner">
			<Brand />

			<nav class="topnav__links" aria-label="Main">
				{#each MARKETING_LINKS as link (link.href)}
					<a class="topnav__link" href={link.href}>{link.label}</a>
				{/each}
			</nav>

			<div class="topnav__tools">
				<button
					type="button"
					class="topnav__search"
					onclick={() => onsearch?.()}
					aria-label="Search"
				>
					<Icon name="search" size={15} />
					<span class="topnav__search-text">Search</span>
					<span class="kbd" aria-hidden="true">⌘K</span>
				</button>

				<ThemeToggle />

				<span class="topnav__rule" aria-hidden="true"></span>

				<a class="btn btn--primary btn--sm topnav__cta" href="/app">Start free</a>
			</div>
		</div>
	</GlassSurface>
</header>

<style>
	.topnav {
		position: fixed;
		inset: 0 0 auto;
		z-index: 30;
		display: flex;
		justify-content: center;
		padding: 18px 16px 0;
		/* A pure transform: no opacity / filter, or we would become a backdrop root. */
		transition: transform 0.42s var(--ease);
	}
	.topnav[data-hidden='true'] {
		transform: translateY(-160%);
	}

	/* class is applied to the child rendered by GlassSurface → must be global */
	:global(.topnav__pill) {
		height: 54px;
		display: flex;
		align-items: center;
		max-width: min(100%, 940px);
		background: var(--gw-tint);
		transition: background-color 0.3s var(--ease);
	}

	.topnav__inner {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 0 6px 0 14px;
	}

	.topnav__links {
		display: flex;
		align-items: center;
		gap: 2px;
		padding-left: 10px;
	}

	.topnav__link {
		padding: 7px 12px;
		border-radius: 10px;
		font-size: var(--step-0);
		font-weight: 500;
		color: var(--text-dim);
		transition: color 0.16s var(--ease), background-color 0.16s var(--ease);
	}
	.topnav__link:hover {
		color: var(--text);
		background: var(--hairline);
	}

	.topnav__tools {
		display: flex;
		align-items: center;
		gap: 8px;
		padding-left: 8px;
	}

	.topnav__search {
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
	.topnav__search:hover {
		color: var(--text);
		background: var(--hairline-strong);
	}

	.topnav__rule {
		width: 1px;
		height: 20px;
		background: var(--hairline);
	}

	.topnav__cta {
		margin-left: 2px;
	}

	@media (max-width: 860px) {
		.topnav__links {
			display: none;
		}
	}
	@media (max-width: 560px) {
		.topnav__search-text,
		.topnav__search .kbd,
		.topnav__rule {
			display: none;
		}
		.topnav__search {
			width: 34px;
			padding: 0;
			justify-content: center;
		}
	}
</style>