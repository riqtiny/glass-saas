<!--
	App sidebar. One glass surface, three responsive widths:
	  ≥1181px  expanded (collapsible by the user)
	  ≤1180px  icon rail
	  ≤820px   hidden — MobileBar takes over

	The active-item highlight is plain CSS on purpose: a nested glass surface would sample
	the sidebar's already-filtered backdrop (and `contain: paint` would shrink its backdrop
	root to the sidebar), which looks muddy and costs a full extra filter chain.
-->
<script lang="ts">
	import { page } from '$app/state';
	import GlassSurface from '#lib/glass/GlassSurface.svelte';
	import { APP_NAV, type NavItem } from '#lib/nav';
	import Brand from './Brand.svelte';
	import Icon from './Icon.svelte';

	let collapsed = $state(false);

	const isActive = (item: NavItem) =>
		item.end ? page.url.pathname === item.href : page.url.pathname.startsWith(item.href);
</script>

<div class="sidenav-slot" data-collapsed={collapsed}>
	<GlassSurface preset="window" class="sidenav">
		<div class="glass-inner sidenav__inner">
			<header class="sidenav__head">
				<Brand compact={collapsed} />
				<button
					type="button"
					class="sidenav__collapse"
					onclick={() => (collapsed = !collapsed)}
					aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
					aria-expanded={!collapsed}
				>
					<Icon name="panel-left" size={17} />
				</button>
			</header>

			<nav class="sidenav__nav" aria-label="Sections">
				<p class="sidenav__heading">Workspace</p>
				{#each APP_NAV as item (item.href)}
					<a
						class="sidenav__item"
						href={item.href}
						aria-current={isActive(item) ? 'page' : undefined}
						title={collapsed ? item.label : undefined}
					>
						<span class="sidenav__item-icon"><Icon name={item.icon} size={17} /></span>
						<span class="sidenav__label">{item.label}</span>
						{#if item.badge}
							<span class="badge sidenav__badge">{item.badge}</span>
						{/if}
					</a>
				{/each}

				<p class="sidenav__heading sidenav__heading--spaced">Resources</p>
				<a class="sidenav__item" href="/app/settings" title={collapsed ? 'API keys' : undefined}>
					<span class="sidenav__item-icon"><Icon name="lock" size={17} /></span>
					<span class="sidenav__label">API keys</span>
				</a>
				<a class="sidenav__item" href="/app/data" title={collapsed ? 'Webhooks' : undefined}>
					<span class="sidenav__item-icon"><Icon name="zap" size={17} /></span>
					<span class="sidenav__label">Webhooks</span>
				</a>
			</nav>

			<div class="sidenav__foot">
				<div class="sidenav__usage">
					<div class="sidenav__usage-row">
						<span class="sidenav__label">Free plan</span>
						<span class="sidenav__label faint">62%</span>
					</div>
					<div class="sidenav__bar"><span style="width: 62%"></span></div>
					<a class="btn btn--outline btn--sm btn--block sidenav__cta" href="/app/settings">
						Upgrade
					</a>
				</div>

				<div class="sidenav__user">
					<span class="avatar" aria-hidden="true">RM</span>
					<span class="sidenav__user-meta">
						<span class="sidenav__label sidenav__user-name">Rina Mahendra</span>
						<span class="sidenav__label faint">rina@glasswing.dev</span>
					</span>
					<button type="button" class="sidenav__more" aria-label="Account menu">
						<Icon name="more" size={16} />
					</button>
				</div>
			</div>
		</div>
	</GlassSurface>
</div>

<style>
	.sidenav-slot {
		position: sticky;
		top: 18px;
		height: calc(100dvh - 36px);
		width: 254px;
		flex: none;
		transition: width 0.34s var(--ease);
	}
	.sidenav-slot[data-collapsed='true'] {
		width: 78px;
	}

	:global(.sidenav) {
		width: 100%;
		height: 100%;
	}

	.sidenav__inner {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 16px 12px 12px;
	}

	.sidenav__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 0 4px 12px;
		border-bottom: 1px solid var(--hairline);
	}
	.sidenav__collapse {
		display: grid;
		place-items: center;
		width: 30px;
		height: 30px;
		flex: none;
		border: 0;
		border-radius: 9px;
		color: var(--text-faint);
		background: transparent;
		cursor: pointer;
		transition: color 0.16s var(--ease), background-color 0.16s var(--ease);
	}
	.sidenav__collapse:hover {
		color: var(--text);
		background: var(--hairline);
	}

	.sidenav__nav {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overflow-x: hidden;
		scrollbar-width: thin;
	}

	.sidenav__heading {
		padding: 4px 10px 8px;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		color: var(--text-faint);
	}
	.sidenav__heading--spaced {
		margin-top: 14px;
	}

	.sidenav__item {
		position: relative;
		display: flex;
		align-items: center;
		gap: 10px;
		height: 38px;
		padding: 0 10px;
		margin-bottom: 2px;
		border-radius: 11px;
		font-size: var(--step-0);
		font-weight: 500;
		color: var(--text-dim);
		white-space: nowrap;
		transition: color 0.16s var(--ease), background-color 0.16s var(--ease);
	}
	.sidenav__item:hover {
		color: var(--text);
		background: var(--hairline);
	}
	.sidenav__item[aria-current='page'] {
		color: var(--text);
		background: var(--accent-soft);
		box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--accent) 26%, transparent);
	}
	.sidenav__item[aria-current='page']::before {
		content: '';
		position: absolute;
		left: -12px;
		top: 50%;
		width: 3px;
		height: 18px;
		border-radius: 0 3px 3px 0;
		background: var(--accent);
		transform: translateY(-50%);
	}
	.sidenav__item-icon {
		display: grid;
		place-items: center;
		flex: none;
	}
	.sidenav__badge {
		margin-left: auto;
	}

	.sidenav__foot {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding-top: 12px;
		border-top: 1px solid var(--hairline);
	}
	.sidenav__usage-row {
		display: flex;
		justify-content: space-between;
		padding: 0 2px 6px;
		font-size: var(--step--1);
	}
	.sidenav__bar {
		height: 5px;
		border-radius: 999px;
		background: var(--hairline-strong);
		overflow: hidden;
		margin-bottom: 10px;
	}
	.sidenav__bar span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, var(--accent), var(--accent-2));
	}

	.sidenav__user {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 6px 8px;
		border-radius: 12px;
	}
	.sidenav__user:hover {
		background: var(--hairline);
	}
	.sidenav__user-meta {
		display: flex;
		flex-direction: column;
		min-width: 0;
		line-height: 1.35;
	}
	.sidenav__user-name {
		font-weight: 550;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.sidenav__more {
		margin-left: auto;
		display: grid;
		place-items: center;
		width: 26px;
		height: 26px;
		flex: none;
		border: 0;
		border-radius: 8px;
		color: var(--text-faint);
		background: transparent;
		cursor: pointer;
	}
	.sidenav__more:hover {
		color: var(--text);
		background: var(--hairline-strong);
	}

	/* --- collapsed rail --- */
	.sidenav-slot[data-collapsed='true'] :global(.sidenav__inner) {
		align-items: center;
		padding-inline: 10px;
	}
	.sidenav-slot[data-collapsed='true'] .sidenav__label,
	.sidenav-slot[data-collapsed='true'] .sidenav__heading,
	.sidenav-slot[data-collapsed='true'] .sidenav__usage,
	.sidenav-slot[data-collapsed='true'] .sidenav__user-meta,
	.sidenav-slot[data-collapsed='true'] .sidenav__more {
		display: none;
	}
	.sidenav-slot[data-collapsed='true'] .sidenav__inner,
	.sidenav-slot[data-collapsed='true'] .sidenav__head,
	.sidenav-slot[data-collapsed='true'] .sidenav__item,
	.sidenav-slot[data-collapsed='true'] .sidenav__user {
		justify-content: center;
		width: 100%;
	}
	.sidenav-slot[data-collapsed='true'] .sidenav__head {
		flex-direction: column;
		gap: 12px;
		padding-bottom: 14px;
	}
	.sidenav-slot[data-collapsed='true'] .sidenav__item {
		padding: 0;
	}

	@media (max-width: 1180px) {
		.sidenav-slot {
			width: 78px;
		}
		.sidenav__inner {
			align-items: center;
			padding-inline: 10px;
		}
		.sidenav__label,
		.sidenav__heading,
		.sidenav__usage,
		.sidenav__user-meta,
		.sidenav__more {
			display: none;
		}
		.sidenav__head,
		.sidenav__item,
		.sidenav__user {
			justify-content: center;
			width: 100%;
		}
		.sidenav__head {
			flex-direction: column;
			gap: 12px;
			padding-bottom: 14px;
		}
		.sidenav__item {
			padding: 0;
		}
		.sidenav__collapse {
			display: none;
		}
	}

	@media (max-width: 820px) {
		.sidenav-slot {
			display: none;
		}
	}
</style>