<script lang="ts">
	import AppTopbar from '#lib/components/AppTopbar.svelte';
	import DataTable from '#lib/components/DataTable.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import GlassSurface from '#lib/glass/GlassSurface.svelte';
	import { WORKSPACES } from '#lib/data';
	import { palette } from '#lib/state/palette.svelte';

	let range = $state('30d');

	const TOTALS = [
		{ label: 'Total MRR', value: '$44,750', icon: 'trend' as const, tone: 'positive' },
		{ label: 'Paid seats', value: '905', icon: 'users' as const, tone: 'accent' },
		{ label: 'Churned this month', value: '2', icon: 'x' as const, tone: 'negative' }
	];
</script>

<div class="customers">
	<AppTopbar bind:range onsearch={() => palette.toggle()} />

	<section class="totals" aria-label="Totals">
		{#each TOTALS as total (total.label)}
			<GlassSurface preset="panel" class="total">
				<div class="glass-inner total__inner">
					<span class="total__icon" data-tone={total.tone}><Icon name={total.icon} size={17} /></span>
					<span class="total__value">{total.value}</span>
					<span class="total__label">{total.label}</span>
				</div>
			</GlassSurface>
		{/each}
	</section>

	<DataTable
		rows={WORKSPACES}
		title="Customers"
		caption="Every workspace with a live subscription on this account"
	/>
</div>

<style>
	.customers {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.totals {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
	}
	:global(.total) {
		padding: 2px;
	}
	.total__inner {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 18px;
	}
	.total__icon {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		margin-bottom: 4px;
		border-radius: 12px;
		color: var(--accent);
		background: var(--accent-soft);
	}
	.total__icon[data-tone='positive'] {
		color: var(--positive);
		background: color-mix(in oklab, var(--positive) 14%, transparent);
	}
	.total__icon[data-tone='negative'] {
		color: var(--negative);
		background: color-mix(in oklab, var(--negative) 14%, transparent);
	}
	.total__value {
		font-size: var(--step-2);
		font-weight: 600;
		letter-spacing: -0.03em;
	}
	.total__label {
		font-size: var(--step--1);
		color: var(--text-faint);
	}
</style>