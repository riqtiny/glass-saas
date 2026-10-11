<!--
	The backdrop everything refracts.

	This is not decoration — a displacement map is *invisible on a flat background*. Displace
	a uniform colour and you get the same uniform colour back. So the wallpaper deliberately
	carries high-frequency detail (fine grid, film grain) and slow motion, because that is
	what makes the rim read as glass rather than as a rendering bug.

	Keep it on z-index 0 with no filter/opacity/mask of its own: an ancestor with any of
	those would become a Backdrop Root and every glass surface would only see itself.
-->
<script lang="ts">
	const BLOBS = [
		{ x: '12%', y: '8%', size: '58vmax', c: 'var(--blob-1)', d: '46s', dx: '7vw', dy: '5vh' },
		{ x: '82%', y: '14%', size: '46vmax', c: 'var(--blob-2)', d: '58s', dx: '-9vw', dy: '7vh' },
		{ x: '68%', y: '78%', size: '52vmax', c: 'var(--blob-3)', d: '64s', dx: '-6vw', dy: '-8vh' },
		{ x: '22%', y: '86%', size: '44vmax', c: 'var(--blob-4)', d: '52s', dx: '8vw', dy: '-6vh' }
	] as const;
</script>

<div class="aurora" aria-hidden="true">
	<div class="aurora__blobs">
		{#each BLOBS as blob (blob.c)}
			<span
				style:--x={blob.x}
				style:--y={blob.y}
				style:--size={blob.size}
				style:--c={blob.c}
				style:--dur={blob.d}
				style:--dx={blob.dx}
				style:--dy={blob.dy}
			></span>
		{/each}
	</div>
	<div class="aurora__grid"></div>
	<div class="aurora__grain"></div>
	<div class="aurora__vignette"></div>
</div>

<style>
	.aurora {
		position: fixed;
		inset: 0;
		z-index: 0;
		overflow: hidden;
		pointer-events: none;
		background: var(--aurora-base);
	}

	.aurora__blobs {
		position: absolute;
		inset: -10%;
		filter: saturate(1.15);
	}

	.aurora__blobs span {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--size);
		height: var(--size);
		margin-left: calc(var(--size) / -2);
		margin-top: calc(var(--size) / -2);
		border-radius: 50%;
		background: radial-gradient(
			circle at 50% 50%,
			var(--c) 0%,
			color-mix(in oklab, var(--c) 55%, transparent) 34%,
			transparent 68%
		);
		filter: blur(60px);
		opacity: var(--blob-opacity);
		will-change: transform;
		animation: drift var(--dur) ease-in-out infinite alternate;
	}

	@keyframes drift {
		from {
			transform: translate3d(0, 0, 0) scale(1);
		}
		to {
			transform: translate3d(var(--dx), var(--dy), 0) scale(1.18);
		}
	}

	/* Fine grid — the crisp edges are what the lens grabs. */
	.aurora__grid {
		position: absolute;
		inset: 0;
		background-image:
			repeating-linear-gradient(0deg, var(--grid-line) 0 1px, transparent 1px 56px),
			repeating-linear-gradient(90deg, var(--grid-line) 0 1px, transparent 1px 56px);
		mask-image: radial-gradient(120% 90% at 50% 25%, #000 25%, transparent 88%);
	}

	.aurora__grain {
		position: absolute;
		inset: 0;
		background-image: var(--gw-grain);
		background-size: 180px 180px;
		opacity: 0.22;
		mix-blend-mode: overlay;
	}

	.aurora__vignette {
		position: absolute;
		inset: 0;
		background: radial-gradient(130% 100% at 50% 0%, transparent 35%, var(--vignette) 100%);
	}

	/* Freeze the backdrop: the filter then only re-evaluates when something else changes. */
	:global([data-motion='off']) .aurora__blobs span {
		animation: none;
	}
	:global([data-motion='off']) .aurora__grain {
		opacity: 0.16;
	}
</style>