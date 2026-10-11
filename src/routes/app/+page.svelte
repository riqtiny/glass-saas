<script lang="ts">
	import ActivityFeed from '#lib/components/ActivityFeed.svelte';
	import AppTopbar from '#lib/components/AppTopbar.svelte';
	import AreaChart from '#lib/components/AreaChart.svelte';
	import DataTable from '#lib/components/DataTable.svelte';
	import StatCard from '#lib/components/StatCard.svelte';
	import { ACTIVITY, KPIS, REVENUE, REVENUE_LABELS, WORKSPACES } from '#lib/data';
	import { palette } from '#lib/state/palette.svelte';

	let range = $state('30d');

	// The mock series is length-independent; only the caption changes with the range, so
	// the dashboard still behaves like a real one without shipping real data.
	const caption = $derived(`Last ${range === '7d' ? '7 days' : range === '1y' ? 'year' : '30 days'}`);
</script>

<div class="dash">
	<AppTopbar bind:range onsearch={() => palette.toggle()} />

	<section class="kpis" aria-label="Key metrics">
		{#each KPIS as kpi (kpi.label)}
			<StatCard {...kpi} />
		{/each}
	</section>

	<div class="split">
		<AreaChart series={REVENUE} labels={REVENUE_LABELS} {caption} />
		<ActivityFeed events={ACTIVITY} />
	</div>

	<DataTable rows={WORKSPACES} />
</div>

<style>
	.dash {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.kpis {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 168px), 1fr));
		gap: 16px;
	}

	.split {
		display: grid;
		grid-template-columns: minmax(0, 1.9fr) minmax(0, 1fr);
		gap: 16px;
		align-items: stretch;
	}
	.split > :global(.chart) {
		min-width: 0;
	}

	@media (max-width: 1080px) {
		.split {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>