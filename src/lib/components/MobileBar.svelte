<!-- Bottom bar, < 820px. A glass pill floating over the content. -->
<script lang="ts">
	import { page } from '$app/state';
	import GlassSurface from '#lib/glass/GlassSurface.svelte';
	import { MOBILE_NAV, type NavItem } from '#lib/nav';
	import Icon from './Icon.svelte';

	const isActive = (item: NavItem) =>
		item.end ? page.url.pathname === item.href : page.url.pathname.startsWith(item.href);
</script>

<div class="mobilebar">
	<GlassSurface preset="pill" class="mobilebar__pill">
		<div class="glass-inner mobilebar__inner">
			{#each MOBILE_NAV as item (item.href)}
				<a
					class="mobilebar__item"
					href={item.href}
					aria-current={isActive(item) ? 'page' : undefined}
					aria-label={item.label}
				>
					<Icon name={item.icon} size={19} />
					<span>{item.label}</span>
				</a>
			{/each}
		</div>
	</GlassSurface>
</div>

<style>
	.mobilebar {
		position: fixed;
		inset: auto 0 0;
		z-index: 30;
		display: flex;
		justify-content: center;
		padding: 0 12px calc(12px + env(safe-area-inset-bottom));
		display: none;
	}

	:global(.mobilebar__pill) {
		width: 100%;
		max-width: 460px;
		height: 62px;
		background: var(--gw-tint);
	}

	.mobilebar__inner {
		display: flex;
		align-items: center;
		justify-content: space-around;
		gap: 2px;
		padding: 0 8px;
	}

	.mobilebar__item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		flex: 1;
		height: 48px;
		border-radius: 14px;
		font-size: 10px;
		font-weight: 550;
		color: var(--text-faint);
		transition: color 0.16s var(--ease), background-color 0.16s var(--ease);
	}
	.mobilebar__item[aria-current='page'] {
		color: var(--accent);
		background: var(--accent-soft);
	}

	@media (max-width: 820px) {
		.mobilebar {
			display: flex;
		}
	}
</style>