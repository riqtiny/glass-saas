<script lang="ts">
	import GlassSurface from '#lib/glass/GlassSurface.svelte';
	import Icon from './Icon.svelte';

	type Props = {
		label: string;
		value: string;
		delta: number;
		spark: number[];
		hint?: string;
	};

	let { label, value, delta, spark, hint = 'vs. previous period' }: Props = $props();

	const id = $props.id();

	const points = $derived.by(() => {
		const min = Math.min(...spark);
		const max = Math.max(...spark);
		const span = max - min || 1;
		const w = 100;
		const h = 32;
		return spark.map((v, i) => [
			(i / (spark.length - 1)) * w,
			h - ((v - min) / span) * (h - 4) - 2
		] as const);
	});

	const line = $derived(points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' '));
	const area = $derived(`${line} L100,34 L0,34 Z`);
	const positive = $derived(delta >= 0);
</script>

<GlassSurface preset="panel" class="stat">
	<div class="glass-inner stat__inner">
		<div class="stat__head">
			<span class="stat__label">{label}</span>
			<span class="badge" class:badge--positive={positive} class:badge--negative={!positive}>
				{positive ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}%
			</span>
		</div>

		<div class="stat__value">{value}</div>

		<div class="stat__foot">
			<svg class="stat__spark" viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden="true">
				<defs>
					<linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color={positive ? 'var(--positive)' : 'var(--negative)'} stop-opacity="0.4" />
						<stop offset="100%" stop-color={positive ? 'var(--positive)' : 'var(--negative)'} stop-opacity="0" />
					</linearGradient>
				</defs>
				<path d={area} fill={`url(#spark-${id})`} />
				<path
					d={line}
					fill="none"
					stroke={positive ? 'var(--positive)' : 'var(--negative)'}
					stroke-width="1.75"
					stroke-linecap="round"
					vector-effect="non-scaling-stroke"
				/>
			</svg>
			<span class="stat__hint">{hint}</span>
		</div>
	</div>
</GlassSurface>

<style>
	:global(.stat) {
		padding: 2px;
	}

	.stat__inner {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 16px 16px 14px;
	}

	.stat__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}
	.stat__label {
		font-size: var(--step--1);
		font-weight: 550;
		color: var(--text-dim);
	}

	.stat__value {
		font-size: var(--step-3);
		font-weight: 600;
		letter-spacing: -0.035em;
		line-height: 1.05;
		font-variant-numeric: tabular-nums;
	}

	.stat__foot {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.stat__spark {
		flex: 1;
		height: 30px;
		min-width: 0;
	}
	.stat__hint {
		flex: none;
		font-size: 11px;
		color: var(--text-faint);
	}
</style>