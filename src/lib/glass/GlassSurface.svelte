<!--
	GlassSurface — every glass surface in the template.

	Owns three things that must never drift apart:
	  · the SVG displacement map (built from the live border-box size)
	  · the SVG filter chain
	  · the border-radius (the action writes it inline, from the same `radius` prop)

	Usage:
	  <GlassSurface preset="pill" class="topbar"> ... </GlassSurface>

	Do NOT nest one glass surface inside another. `contain: paint` on the outer surface
	shrinks the backdrop root of the inner one, and every nested surface costs another full
	filter chain over an already-filtered backdrop.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { GlassOptions, GlassPreset } from './glass';
	import { GLASS_PRESETS, glass } from './glass';
	import './glass.css';

	type Props = GlassOptions & {
		preset?: GlassPreset;
		children?: Snippet;
		class?: string;
		style?: string;
	};

	let { preset, children, class: klass = '', style = '', radius, ...tune }: Props = $props();

	const config = $derived<GlassOptions>({
		...(preset ? GLASS_PRESETS[preset] : null),
		...(radius !== undefined ? { radius } : null),
		...tune
	});
</script>

<div class="glass-surface {klass}" {style} use:glass={config}>
	{@render children?.()}
</div>