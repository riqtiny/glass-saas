<script lang="ts">
	import GlassSurface from '#lib/glass/GlassSurface.svelte';
	import Icon from './Icon.svelte';
	import type { Row } from '#lib/data';

	let { rows, title = 'Workspaces', caption = 'Billing state for every seat on the account' }: { rows: Row[]; title?: string; caption?: string } = $props();

	let query = $state('');

	const STATUS = {
		active: { label: 'Active', cls: 'badge--positive' },
		trialing: { label: 'Trialing', cls: 'badge--accent' },
		past_due: { label: 'Past due', cls: 'badge--negative' }
	} as const;

	const filtered = $derived(
		rows.filter((r) => {
			const q = query.trim().toLowerCase();
			return !q || r.company.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
		})
	);
</script>

<GlassSurface preset="panel" class="table">
	<div class="glass-inner">
		<header class="table__head">
			<div>
				<h2 class="table__title">{title}</h2>
				<p class="table__caption">{caption}</p>
			</div>
			<label class="table__search">
				<span class="sr-only">Filter workspaces</span>
				<Icon name="search" size={15} />
				<input bind:value={query} placeholder="Filter…" />
			</label>
		</header>

		<div class="table__scroll">
			<table>
				<thead>
					<tr>
						<th scope="col">Workspace</th>
						<th scope="col">Plan</th>
						<th scope="col">Status</th>
						<th scope="col" class="num">Seats</th>
						<th scope="col" class="num">MRR</th>
					</tr>
				</thead>
				<tbody>
					{#each filtered as row (row.id)}
						<tr>
							<td>
								<span class="table__company">{row.company}</span>
								<span class="table__id">{row.id}</span>
							</td>
							<td>{row.plan}</td>
							<td>
								<span class="badge {STATUS[row.status].cls}">
									<span class="dot"></span>
									{STATUS[row.status].label}
								</span>
							</td>
							<td class="num">{row.seats}</td>
							<td class="num">{row.mrr === 0 ? '—' : `$${row.mrr.toLocaleString('en-US')}`}</td>
						</tr>
					{:else}
						<tr>
							<td colspan="5" class="table__empty">No workspace matches “{query}”.</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</GlassSurface>

<style>
	:global(.table) {
		padding: 2px;
	}

	.table__head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 16px;
		padding: 18px 18px 14px;
	}
	.table__title {
		font-size: var(--step-1);
	}
	.table__caption {
		font-size: var(--step--1);
		color: var(--text-faint);
	}

	.table__search {
		display: flex;
		align-items: center;
		gap: 7px;
		height: 32px;
		padding: 0 11px;
		border-radius: 10px;
		color: var(--text-faint);
		background: var(--hairline);
		box-shadow: inset 0 0 0 1px var(--hairline);
	}
	.table__search:focus-within {
		color: var(--text);
		box-shadow: inset 0 0 0 1px var(--accent);
	}
	.table__search input {
		width: 120px;
		border: 0;
		background: none;
		outline: none;
		font-size: var(--step--1);
	}

	.table__scroll {
		overflow-x: auto;
		padding: 0 8px 8px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--step-0);
	}
	th {
		padding: 8px 12px;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		text-align: left;
		color: var(--text-faint);
		border-bottom: 1px solid var(--hairline);
	}
	td {
		padding: 11px 12px;
		border-bottom: 1px solid var(--hairline);
		vertical-align: middle;
	}
	tbody tr:last-child td {
		border-bottom: 0;
	}
	tbody tr {
		transition: background-color 0.15s var(--ease);
	}
	tbody tr:hover {
		background: var(--hairline);
	}
	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.table__company {
		display: block;
		font-weight: 550;
	}
	.table__id {
		display: block;
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--text-faint);
	}
	.table__empty {
		padding: 26px;
		text-align: center;
		color: var(--text-faint);
	}
</style>