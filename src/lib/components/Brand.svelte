<script lang="ts">
	type Props = {
		href?: string;
		/** Hide the wordmark — for the collapsed sidebar rail. */
		compact?: boolean;
		size?: number;
	};

	let { href = '/', compact = false, size = 26 }: Props = $props();
</script>

<a class="brand" {href} aria-label="Glasswing — home">
	<svg
		class="brand__mark"
		viewBox="0 0 32 32"
		fill="none"
		width={size}
		height={size}
		aria-hidden="true"
	>
		<path
			d="M5 21c4.5-10 17.5-10 22 0"
			stroke="currentColor"
			stroke-width="3.2"
			stroke-linecap="round"
		/>
		<circle cx="16" cy="11.4" r="3.4" fill="currentColor" />
	</svg>
	{#if !compact}
		<span class="brand__name">Glasswing</span>
	{/if}
</a>

<style>
	.brand {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		color: var(--accent);
		flex: none;
		user-select: none;
	}
	.brand__mark {
		flex: none;
		filter: drop-shadow(0 2px 8px color-mix(in oklab, var(--accent) 45%, transparent));
	}
	.brand__name {
		color: var(--text);
		font-weight: 600;
		font-size: var(--step-1);
		letter-spacing: -0.03em;
	}
</style>