<script lang="ts">
	import '../app.css';
	import Aurora from '#lib/components/Aurora.svelte';
	import CommandPalette from '#lib/components/CommandPalette.svelte';
	import { palette } from '#lib/state/palette.svelte';
	import { prefs } from '#lib/state/prefs.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	$effect(() => {
		prefs.init();

		const onKey = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault();
				palette.toggle();
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

<a class="skip-link" href="#main">Skip to content</a>

<!--
	The backdrop everything refracts. Must stay on z-index 0 with no filter / opacity / mask
	of its own, or every glass surface below it would only see itself.
-->
<Aurora />

<div class="shell">
	{@render children?.()}
</div>

<CommandPalette bind:open={palette.open} />