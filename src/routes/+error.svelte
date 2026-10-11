<script lang="ts">
	import { page } from '$app/state';
	import GlassSurface from '#lib/glass/GlassSurface.svelte';
	import Icon from '#lib/components/Icon.svelte';
</script>

<main id="main" class="page error">
	<GlassSurface preset="window" class="error__panel">
		<div class="glass-inner error__inner">
			<p class="eyebrow">{page.status}</p>
			<h1 class="error__title">Nothing behind this pane of glass</h1>
			<p class="error__body">
				{page.error?.message ?? 'That page does not exist.'}
			</p>
			<a class="btn btn--primary" href="/">
				<Icon name="arrow-right" size={16} />
				Back to the start
			</a>
		</div>
	</GlassSurface>
</main>

<style>
	.error {
		display: grid;
		place-items: center;
		min-height: 100dvh;
		padding: 24px;
	}
	:global(.error__panel) {
		width: min(560px, 100%);
		padding: 2px;
	}
	.error__inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 56px 32px;
		text-align: center;
	}
	.error__title {
		font-size: var(--step-3);
	}
	.error__body {
		color: var(--text-dim);
		max-width: 44ch;
	}
	.error__inner :global(.btn) {
		margin-top: 8px;
	}
</style>