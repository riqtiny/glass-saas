<script lang="ts">
	import AppTopbar from '#lib/components/AppTopbar.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import GlassSurface from '#lib/glass/GlassSurface.svelte';
	import { palette } from '#lib/state/palette.svelte';

	let range = $state('30d');

	const SOURCES = [
		{
			name: 'events.stream',
			rows: '4.2B',
			cols: ['id', 'ws_id', 'type', 'payload', 'received_at'],
			status: 'Streaming',
			icon: 'zap' as const
		},
		{
			name: 'workspaces',
			rows: '12,480',
			cols: ['id', 'name', 'plan', 'seats', 'created_at'],
			status: 'Synced 12s ago',
			icon: 'users' as const
		},
		{
			name: 'billing.invoices',
			rows: '94,120',
			cols: ['id', 'ws_id', 'amount_cents', 'state', 'due_at'],
			status: 'Synced 1m ago',
			icon: 'card' as const
		},
		{
			name: 'audit.log',
			rows: '1.9M',
			cols: ['id', 'actor', 'action', 'target', 'ip'],
			status: 'Synced 30s ago',
			icon: 'shield' as const
		}
	];

	const SNIPPET = `<GlassSurface
  preset="panel"
  radius={24}
  band={14}
  scale={-150}
  chromatic={18}
/>`;
</script>

<div class="data">
	<AppTopbar bind:range onsearch={() => palette.toggle()} />

	<div class="data__grid">
		<div class="data__sources">
			{#each SOURCES as source (source.name)}
				<GlassSurface preset="panel" class="source">
					<div class="glass-inner source__inner">
						<div class="source__head">
							<span class="source__icon"><Icon name={source.icon} size={16} /></span>
							<h2 class="source__name">{source.name}</h2>
							<span class="badge badge--positive">
								<span class="dot"></span>
								{source.status}
							</span>
						</div>
						<div class="source__meta">
							<span class="source__rows">{source.rows} rows</span>
							<div class="source__cols">
								{#each source.cols as col (col)}
									<code>{col}</code>
								{/each}
							</div>
						</div>
					</div>
				</GlassSurface>
			{/each}
		</div>

		<GlassSurface preset="panel" class="snippet">
			<div class="glass-inner snippet__inner">
				<h2 class="snippet__title">Use it in your app</h2>
				<p class="snippet__body">
					The <code>preset</code> sets sane defaults; any individual tunable overrides it. The
					action writes <code>border-radius</code> from the same <code>radius</code>, so the
					baked map and the CSS can never disagree about the corner shape.
				</p>
				<pre class="code"><code>{SNIPPET}</code></pre>
				<div class="snippet__actions">
					<button type="button" class="btn btn--outline btn--sm">
						<Icon name="copy" size={14} />
						Copy
					</button>
					<button type="button" class="btn btn--quiet btn--sm">
						<Icon name="external" size={14} />
						API reference
					</button>
				</div>
			</div>
		</GlassSurface>
	</div>
</div>

<style>
	.data {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.data__grid {
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
		gap: 16px;
		align-items: start;
	}
	.data__sources {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	:global(.source) {
		padding: 2px;
	}
	.source__inner {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px 18px;
	}
	.source__head {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.source__icon {
		display: grid;
		place-items: center;
		width: 30px;
		height: 30px;
		flex: none;
		border-radius: 10px;
		color: var(--accent);
		background: var(--accent-soft);
	}
	.source__name {
		font-size: var(--step-0);
		font-family: var(--font-mono);
		font-weight: 500;
		letter-spacing: 0;
		margin-right: auto;
	}
	.source__meta {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.source__rows {
		font-size: var(--step--1);
		color: var(--text-faint);
	}
	.source__cols {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.source__cols code {
		font-family: var(--font-mono);
		font-size: 11px;
		padding: 3px 8px;
		border-radius: 7px;
		color: var(--text-dim);
		background: var(--hairline);
		box-shadow: inset 0 0 0 1px var(--hairline);
	}

	:global(.snippet) {
		padding: 2px;
		position: sticky;
		top: 84px;
	}
	.snippet__inner {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 20px;
	}
	.snippet__title {
		font-size: var(--step-1);
	}
	.snippet__body {
		font-size: var(--step--1);
		color: var(--text-dim);
	}
	.snippet__body code {
		font-family: var(--font-mono);
		font-size: 0.92em;
		padding: 1px 5px;
		border-radius: 5px;
		background: var(--hairline);
	}
	.code {
		margin: 0;
		padding: 14px 16px;
		border-radius: 14px;
		overflow-x: auto;
		font-family: var(--font-mono);
		font-size: 12.5px;
		line-height: 1.65;
		color: var(--text);
		background: color-mix(in oklab, var(--gw-tint-solid) 72%, transparent);
		box-shadow: inset 0 0 0 1px var(--hairline);
	}
	.snippet__actions {
		display: flex;
		gap: 8px;
	}

	@media (max-width: 1080px) {
		.data__grid {
			grid-template-columns: minmax(0, 1fr);
		}
		:global(.snippet) {
			position: static;
		}
	}
</style>