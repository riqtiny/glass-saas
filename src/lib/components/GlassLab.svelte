<!--
	The glass lab: the tunables, live.

	Note the layout — the controls panel and the demo surfaces are *siblings*, never nested.
	A glass surface inside a glass surface would refract the outer surface's already-filtered
	result, and `contain: paint` on the outer one would clip the inner one's backdrop root to
	the panel. Same effect class, one filter chain per surface instead of two stacked.
-->
<script lang="ts">
	import GlassSurface from '#lib/glass/GlassSurface.svelte';
	import Icon from './Icon.svelte';

	const values = $state({ radius: 26, band: 14, chromatic: 20, scale: -180 });
	const tunables = $derived(values);

	type Key = keyof typeof values;
	const CONTROLS: { key: Key; label: string; min: number; max: number; step: number; unit: string }[] = [
		{ key: 'radius', label: 'Radius', min: 0, max: 40, step: 1, unit: 'px' },
		{ key: 'band', label: 'Rim band', min: 2, max: 30, step: 1, unit: 'px' },
		{ key: 'chromatic', label: 'Chromatic spread', min: 0, max: 60, step: 2, unit: '' },
		{ key: 'scale', label: 'Displacement', min: -300, max: -20, step: 10, unit: '' }
	];

	const bars = [42, 68, 35, 84, 57, 91, 46, 72];
</script>

<div class="lab">
	<GlassSurface preset="panel" class="lab__controls">
		<div class="glass-inner">
			<h2 class="lab__title">
				<Icon name="sparkles" size={17} />
				Tune the glass
			</h2>
			<p class="lab__blurb">
				Every surface on this page is one <code>GlassSurface</code> with four numbers. Drag
				them and watch the template follow.
			</p>

			{#each CONTROLS as control (control.key)}
				<label class="lab__control">
					<span class="lab__control-head">
						{control.label}
						<output>{values[control.key]}{control.unit}</output>
					</span>
					<input
						class="range"
						type="range"
						min={control.min}
						max={control.max}
						step={control.step}
						value={values[control.key]}
						oninput={(event) => (values[control.key] = Number(event.currentTarget.value))}
					/>
				</label>
			{/each}
		</div>
	</GlassSurface>

	<div class="lab__stage">
		<GlassSurface class="lab__pill" {...tunables}>
			<div class="glass-inner lab__pill-inner">
				<span class="lab__pill-dot"></span>
				<span>Navbar pill</span>
				<span class="lab__pill-sep"></span>
				<span class="muted">Overview</span>
				<span class="muted">Billing</span>
			</div>
		</GlassSurface>

		<GlassSurface class="lab__card" {...tunables}>
			<div class="glass-inner lab__card-inner">
				<div class="lab__card-head">
					<h3>Card surface</h3>
					<span class="badge badge--positive">Live</span>
				</div>
				<p class="muted">
					The same displacement map, rebuilt whenever the box changes size. Nothing else
					differs between this card and the navbar above it.
				</p>
				<div class="lab__bars">
					{#each bars as height, i (i)}
						<span style:height="{height}%"></span>
					{/each}
				</div>
			</div>
		</GlassSurface>

		<div class="lab__chips">
			{#each ['refract', 'saturate(1.4)', 'band 14px', 'scale −180'] as chip (chip)}
				<GlassSurface class="lab__chip" {...tunables}>
					<div class="glass-inner lab__chip-inner">{chip}</div>
				</GlassSurface>
			{/each}
		</div>
	</div>
</div>

<style>
	.lab {
		display: grid;
		grid-template-columns: minmax(280px, 340px) 1fr;
		gap: 16px;
		align-items: stretch;
	}

	:global(.lab__controls .glass-inner) {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 20px;
		height: 100%;
	}
	.lab__title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: var(--step-1);
	}
	.lab__blurb {
		font-size: var(--step--1);
		color: var(--text-dim);
	}
	.lab__blurb code {
		font-family: var(--font-mono);
		font-size: 0.94em;
		padding: 1px 5px;
		border-radius: 5px;
		background: var(--hairline);
	}

	.lab__control {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.lab__control-head {
		display: flex;
		justify-content: space-between;
		font-size: var(--step--1);
		font-weight: 550;
		color: var(--text-dim);
	}
	.lab__control-head output {
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		color: var(--text);
	}

	.lab__stage {
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 0;
	}

	:global(.lab__pill) {
		padding: 2px;
	}
	.lab__pill-inner {
		display: flex;
		align-items: center;
		gap: 12px;
		height: 54px;
		padding: 0 20px;
		font-size: var(--step--1);
		font-weight: 550;
	}
	.lab__pill-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--positive);
		box-shadow: 0 0 10px var(--positive);
	}
	.lab__pill-sep {
		width: 1px;
		height: 18px;
		background: var(--hairline);
	}

	.lab__card-inner {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 20px;
	}
	.lab__card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.lab__card-head h3 {
		font-size: var(--step-1);
	}
	.lab__card-inner p {
		font-size: var(--step--1);
		max-width: 46ch;
	}
	.lab__bars {
		display: flex;
		align-items: flex-end;
		gap: 8px;
		height: 96px;
		margin-top: 6px;
	}
	.lab__bars span {
		flex: 1;
		border-radius: 6px 6px 2px 2px;
		background: linear-gradient(
			180deg,
			var(--accent),
			color-mix(in oklab, var(--accent-2) 60%, transparent)
		);
		opacity: 0.85;
	}

	.lab__chips {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}
	:global(.lab__chip) {
		padding: 2px;
	}
	.lab__chip-inner {
		display: flex;
		align-items: center;
		height: 38px;
		padding: 0 16px;
		font-family: var(--font-mono);
		font-size: var(--step--1);
		color: var(--text-dim);
	}

	@media (max-width: 900px) {
		.lab {
			grid-template-columns: 1fr;
		}
	}
</style>