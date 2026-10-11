<script lang="ts">
	import MobileBar from '#lib/components/MobileBar.svelte';
	import SideNav from '#lib/components/SideNav.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="appshell">
	<SideNav />

	<div class="appshell__main">
		{@render children?.()}
	</div>
</div>

<MobileBar />

<style>
	.appshell {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 18px;
		min-height: 100dvh;
		padding: 18px;
	}

	.appshell__main {
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 0;
		padding-bottom: 24px;
	}

	@media (max-width: 820px) {
		.appshell {
			grid-template-columns: minmax(0, 1fr);
			padding: 14px;
		}
		.appshell__main {
			padding-bottom: 96px;
		}
	}
</style>