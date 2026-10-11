<script lang="ts">
	import GlassSurface from '#lib/glass/GlassSurface.svelte';
	import Icon from './Icon.svelte';
	import type { Event } from '#lib/data';

	let { events }: { events: Event[] } = $props();
</script>

<GlassSurface preset="panel" class="feed">
	<div class="glass-inner">
		<header class="feed__head">
			<h2 class="feed__title">Activity</h2>
			<button type="button" class="btn btn--quiet btn--sm">
				<Icon name="refresh" size={14} />
				Refresh
			</button>
		</header>

		<ul class="feed__list">
			{#each events as event (event.who + event.when)}
				<li class="feed__item">
					<span class="feed__icon"><Icon name={event.icon} size={15} /></span>
					<span class="feed__body">
						<span class="feed__who">{event.who}</span>
						<span class="feed__what">{event.what}</span>
					</span>
					<span class="feed__when">{event.when}</span>
				</li>
			{/each}
		</ul>
	</div>
</GlassSurface>

<style>
	:global(.feed) {
		padding: 2px;
	}
	.feed__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 16px 14px 10px 18px;
	}
	.feed__title {
		font-size: var(--step-1);
	}

	.feed__list {
		list-style: none;
		padding: 0 8px 10px;
		margin: 0;
	}
	.feed__item {
		display: flex;
		align-items: flex-start;
		gap: 11px;
		padding: 10px;
		border-radius: 12px;
		transition: background-color 0.15s var(--ease);
	}
	.feed__item:hover {
		background: var(--hairline);
	}
	.feed__icon {
		display: grid;
		place-items: center;
		width: 30px;
		height: 30px;
		flex: none;
		border-radius: 10px;
		color: var(--accent);
		background: var(--accent-soft);
	}
	.feed__body {
		display: flex;
		flex-direction: column;
		min-width: 0;
		line-height: 1.45;
	}
	.feed__who {
		font-size: var(--step--1);
		font-weight: 600;
	}
	.feed__what {
		font-size: var(--step--1);
		color: var(--text-dim);
	}
	.feed__when {
		margin-left: auto;
		flex: none;
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		color: var(--text-faint);
	}
</style>