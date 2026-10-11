<script lang="ts">
	import AppTopbar from '#lib/components/AppTopbar.svelte';
	import AreaChart from '#lib/components/AreaChart.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import StatCard from '#lib/components/StatCard.svelte';
	import GlassSurface from '#lib/glass/GlassSurface.svelte';
	import { KPIS, REVENUE, REVENUE_LABELS } from '#lib/data';
	import { palette } from '#lib/state/palette.svelte';

	let range = $state('30d');

	const SEGMENTS = [
		{ label: 'Self-serve', share: 38, value: '$31,900', delta: '+6.1%' },
		{ label: 'Sales-assisted', share: 44, value: '$36,980', delta: '+21.7%' },
		{ label: 'Partners', share: 18, value: '$15,360', delta: '−2.4%' }
	];
</script>

<div class="analytics">
	<AppTopbar bind:range onsearch={() => palette.toggle()} />

	<section class="kpis" aria-label="Key metrics">
		{#each KPIS.slice(0, 3) as kpi (kpi.label)}
			<StatCard {...kpi} />
		{/each}
	</section>

	<AreaChart
		series={REVENUE}
		labels={REVENUE_LABELS}
		title="Net revenue retention"
		caption={`Rolling ${range.toUpperCase()} · indexed to 100`}
	/>

	<div class="segments">
		{#each SEGMENTS as segment (segment.label)}
			<GlassSurface preset="panel" class="segment">
				<div class="glass-inner segment__inner">
					<div class="segment__head">
						<h2 class="segment__label">{segment.label}</h2>
						<span class="badge" class:badge--positive={segment.delta.startsWith('+')} class:badge--negative={segment.delta.startsWith('−')}>
							{segment.delta}
						</span>
					</div>
					<strong class="segment__value">{segment.value}</strong>
					<div class="segment__bar" role="presentation">
						<span style:width="{segment.share}%"></span>
					</div>
					<p class="segment__hint">{segment.share}% of new MRR this period</p>
				</div>
			</GlassSurface>
		{/each}
	</div>

	<GlassSurface preset="panel" class="insight">
		<div class="glass-inner insight__inner">
			<span class="insight__icon"><Icon name="sparkles" size={18} /></span>
			<div>
				<h2 class="insight__title">Sales-assisted expansion is doing the work</h2>
				<p class="insight__body">
					44% of new MRR came from sales-assisted accounts, and that segment grew 21.7% while
					self-serve grew 6.1%. Two of the three fastest-growing workspaces in the last 30 days
					added seats within a week of their first upgrade.
				</p>
			</div>
		</div>
	</GlassSurface>
</div>

<style>
	.analytics {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.kpis {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 168px), 1fr));
		gap: 16px;
	}
	.segments {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 16px;
	}
	:global(.segment) {
		padding: 2px;
	}
	.segment__inner {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 18px;
	}
	.segment__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}
	.segment__label {
		font-size: var(--step-0);
		font-weight: 550;
	}
	.segment__value {
		font-size: var(--step-3);
		letter-spacing: -0.04em;
	}
	.segment__bar {
		height: 6px;
		border-radius: 999px;
		background: var(--hairline-strong);
		overflow: hidden;
	}
	.segment__bar span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, var(--accent), var(--accent-2));
	}
	.segment__hint {
		font-size: var(--step--1);
		color: var(--text-faint);
	}

	:global(.insight) {
		padding: 2px;
	}
	.insight__inner {
		display: flex;
		gap: 14px;
		padding: 20px;
	}
	.insight__icon {
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		flex: none;
		border-radius: 12px;
		color: var(--accent);
		background: var(--accent-soft);
	}
	.insight__title {
		font-size: var(--step-1);
		margin-bottom: 6px;
	}
	.insight__body {
		font-size: var(--step--1);
		color: var(--text-dim);
		max-width: 74ch;
	}
</style>