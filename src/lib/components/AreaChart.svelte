<!--
	Area chart. Plain SVG — no charting dependency, because the template ships with zero
	runtime deps.

	The viewBox has a fixed aspect ratio and the element is sized from it, so the whole
	chart scales uniformly: strokes stay crisp and the HTML tooltip (which is what keeps
	the labels sharp) can be positioned in percentages.
-->
<script lang="ts">
	import GlassSurface from '#lib/glass/GlassSurface.svelte';
	import Icon from './Icon.svelte';

	type Props = {
		series: number[];
		labels: string[];
		title?: string;
		caption?: string;
		valuePrefix?: string;
	};

	let {
		series,
		labels,
		title = 'Recurring revenue',
		caption = 'Last 30 days',
		valuePrefix = '$'
	}: Props = $props();

	const W = 1000;
	const H = 400;
	const TOP = 26;
	const BOTTOM = 34;

	const geom = $derived.by(() => {
		const min = Math.min(...series);
		const max = Math.max(...series);
		const lo = Math.max(0, min - (max - min) * 0.35);
		const hi = max + (max - min) * 0.18;
		const span = hi - lo || 1;
		const x = (i: number) => (i / (series.length - 1)) * W;
		const y = (v: number) => TOP + (1 - (v - lo) / span) * (H - TOP - BOTTOM);
		const pts = series.map((v, i) => [x(i), y(v)] as const);
		return { pts, lo, hi, span, y, x };
	});

	const linePath = $derived.by(() => {
		const { pts } = geom;
		if (pts.length < 2) return '';
		let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
		for (let i = 0; i < pts.length - 1; i++) {
			const p0 = pts[i - 1] ?? pts[i];
			const p1 = pts[i];
			const p2 = pts[i + 1];
			const p3 = pts[i + 2] ?? p2;
			const k = 0.18;
			d += ` C${(p1[0] + (p2[0] - p0[0]) * k).toFixed(2)},${(p1[1] + (p2[1] - p0[1]) * k).toFixed(2)} ${(p2[0] - (p3[0] - p1[0]) * k).toFixed(2)},${(p2[1] - (p3[1] - p1[1]) * k).toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
		}
		return d;
	});

	const areaPath = $derived(`${linePath} L${W},${H - BOTTOM} L0,${H - BOTTOM} Z`);

	const ticks = $derived.by(() => {
		const { lo, hi, span } = geom;
		return [1, 0.75, 0.5, 0.25, 0].map((t) => ({
			value: lo + span * t,
			y: TOP + (1 - t) * (H - TOP - BOTTOM)
		}));
	});

	let cursor = $state<number | null>(null);
	let drawn = $state(false);

	$effect(() => {
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const id = requestAnimationFrame(() => {
			drawn = true;
			if (reduce) drawn = true;
		});
		return () => cancelAnimationFrame(id);
	});

	function onmove(event: PointerEvent) {
		const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
		const ratio = (event.clientX - rect.left) / rect.width;
		cursor = Math.max(0, Math.min(series.length - 1, Math.round(ratio * (series.length - 1))));
	}
</script>

<GlassSurface preset="panel" class="chart">
	<div class="glass-inner chart__inner">
		<header class="chart__head">
			<div>
				<h2 class="chart__title">{title}</h2>
				<p class="chart__caption">{caption}</p>
			</div>
			<div class="chart__legend">
				<span class="badge badge--positive">
					<Icon name="trend" size={13} />
					+18.4%
				</span>
			</div>
		</header>

		<div class="chart__body">
			<svg
				class="chart__svg"
				viewBox={`0 0 ${W} ${H}`}
				role="img"
				aria-label={`${title}, ${caption}. Peak ${Math.round(geom.hi).toLocaleString('en-US')}, low ${Math.round(geom.lo).toLocaleString('en-US')}.`}
				onpointermove={onmove}
				onpointerleave={() => (cursor = null)}
			>
				<defs>
					<linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="var(--accent)" stop-opacity="0.5" />
						<stop offset="55%" stop-color="var(--accent-2)" stop-opacity="0.16" />
						<stop offset="100%" stop-color="var(--accent-2)" stop-opacity="0" />
					</linearGradient>
					<linearGradient id="chart-line" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stop-color="var(--accent)" />
						<stop offset="100%" stop-color="var(--accent-2)" />
					</linearGradient>
					<clipPath id="chart-clip">
						<rect x="0" y="0" width={W} height={H - BOTTOM} />
					</clipPath>
				</defs>

				{#each ticks as tick (tick.value)}
					<line
						x1="0"
						x2={W}
						y1={tick.y}
						y2={tick.y}
						stroke="var(--hairline)"
						stroke-width="1"
						vector-effect="non-scaling-stroke"
					/>
					<text class="chart__tick" x="0" y={tick.y - 10}>
						{valuePrefix}
						{Math.round(tick.value).toLocaleString('en-US')}k
					</text>
				{/each}

				<g clip-path="url(#chart-clip)">
					<path class="chart__area" d={areaPath} fill="url(#chart-fill)" data-drawn={drawn} />
					<path
						class="chart__line"
						d={linePath}
						fill="none"
						stroke="url(#chart-line)"
						stroke-width="3"
						stroke-linecap="round"
						pathLength="1"
						data-drawn={drawn}
					/>
				</g>

				{#if cursor !== null}
					<line
						x1={geom.x(cursor)}
						x2={geom.x(cursor)}
						y1={TOP - 12}
						y2={H - BOTTOM}
						stroke="var(--hairline-strong)"
						stroke-width="1"
						vector-effect="non-scaling-stroke"
					/>
					<circle
						cx={geom.x(cursor)}
						cy={geom.y(series[cursor])}
						r="7"
						fill="var(--accent-2)"
						stroke="var(--gw-tint-solid)"
						stroke-width="3"
					/>
				{/if}
			</svg>

			{#if cursor !== null}
				<div
					class="chart__tip"
					style:left="{(cursor / (series.length - 1)) * 100}%"
					style:bottom="{geom.y(series[cursor]) / H * 100}%"
				>
					<span class="chart__tip-value">{valuePrefix}{series[cursor].toLocaleString('en-US')}k</span>
					<span class="chart__tip-label">{labels[cursor]}</span>
				</div>
			{/if}
		</div>

		<footer class="chart__axis">
			{#each [0, 7, 14, 21, series.length - 1] as i (i)}
				<span>{labels[i]}</span>
			{/each}
		</footer>
	</div>
</GlassSurface>

<style>
	:global(.chart) {
		padding: 2px;
	}

	.chart__inner {
		display: flex;
		flex-direction: column;
		padding: 18px 18px 14px;
	}

	.chart__head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 6px;
	}
	.chart__title {
		font-size: var(--step-1);
	}
	.chart__caption {
		font-size: var(--step--1);
		color: var(--text-faint);
	}

	.chart__body {
		position: relative;
	}
	.chart__svg {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 1000 / 400;
		touch-action: none;
	}

	.chart__tick {
		fill: var(--text-faint);
		font-size: 19px;
		font-family: var(--font-sans);
	}

	.chart__line {
		stroke-dasharray: 1;
		stroke-dashoffset: 1;
		transition: stroke-dashoffset 1.1s var(--ease);
	}
	.chart__line[data-drawn='true'] {
		stroke-dashoffset: 0;
	}
	.chart__area {
		opacity: 0;
		transition: opacity 0.7s var(--ease) 0.25s;
	}
	.chart__area[data-drawn='true'] {
		opacity: 1;
	}

	.chart__tip {
		position: absolute;
		transform: translate(-50%, 130%);
		display: flex;
		flex-direction: column;
		padding: 6px 10px;
		border-radius: 10px;
		background: var(--gw-tint-solid);
		box-shadow:
			inset 0 0 0 1px var(--hairline-strong),
			0 8px 20px -8px rgb(0 0 0 / 0.6);
		pointer-events: none;
		white-space: nowrap;
		z-index: 2;
	}
	.chart__tip-value {
		font-size: var(--step--1);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
	.chart__tip-label {
		font-size: 11px;
		color: var(--text-faint);
	}

	.chart__axis {
		display: flex;
		justify-content: space-between;
		padding-top: 10px;
		margin-top: 4px;
		border-top: 1px solid var(--hairline);
		font-size: 11px;
		color: var(--text-faint);
	}

	@media (prefers-reduced-motion: reduce) {
		.chart__line,
		.chart__area {
			transition: none;
		}
	}
</style>