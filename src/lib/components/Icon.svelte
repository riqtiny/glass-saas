<!--
	Inline icon set (Lucide-style geometry, 24×24, stroke-based).
	Inlined rather than pulled from a package: the template ships with zero runtime deps and
	every icon here is decorative, so the accessible name always comes from the label on the
	control that wraps it.
-->
<script lang="ts">
	import { ICONS, type IconName } from './icons';

	type Props = {
		name: IconName;
		size?: number | string;
		stroke?: number;
		class?: string;
	};

	let { name, size = 18, stroke = 1.7, class: klass = '' }: Props = $props();
</script>

<svg
	class={klass}
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={stroke}
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted, inlined constant -->
	{@html ICONS[name]}
</svg>