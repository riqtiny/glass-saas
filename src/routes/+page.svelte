<!--
	Marketing page.

	Read the section order as a sales pitch: show the effect, name the mechanism, prove it is
	tunable, then sell the plan.
-->
<script lang="ts">
	import GlassSurface from '#lib/glass/GlassSurface.svelte';
	import GlassLab from '#lib/components/GlassLab.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import TopNav from '#lib/components/TopNav.svelte';
	import ThemeToggle from '#lib/components/ThemeToggle.svelte';
	import { FEATURES, LOGOS, PLANS, TESTIMONIALS } from '#lib/data';
	import { palette } from '#lib/state/palette.svelte';

	const CHART = [28, 44, 36, 58, 49, 71, 63, 82, 74, 91, 84, 96];
</script>

<TopNav onsearch={() => palette.toggle()} />

<main id="main" class="page landing">
	<!-- ------------------------------------------------------------- hero -->
	<section class="hero">
		<span class="badge badge--accent hero__badge">
			<span class="dot"></span>
			Svelte 5 · zero runtime dependencies
		</span>

		<h1 class="hero__title">
			Liquid glass,<br />
			<span class="gradient-text">actually refracting.</span>
		</h1>

		<p class="hero__lead">
			Not a blur. A real SVG displacement map bends the page behind every panel — navbar,
			sidebar, cards, menus. And it is tunable, themeable and legible while it does it.
		</p>

		<div class="hero__actions">
			<a class="btn btn--primary btn--lg" href="/app">
				Open the dashboard
				<Icon name="arrow-right" size={17} />
			</a>
			<button type="button" class="btn btn--outline btn--lg" onclick={() => palette.toggle()}>
				<Icon name="search" size={16} />
				Press <span class="kbd">⌘K</span>
			</button>
		</div>

		<p class="hero__note">
			Free for personal and commercial use. No attribution required.
		</p>
	</section>

	<!-- --------------------------------------------------------- showcase -->
	<section class="showcase" id="showcase" aria-label="Product preview">
		<GlassSurface preset="window" class="showcase__frame">
			<div class="glass-inner showcase__mock">
				<aside class="showcase__rail" aria-hidden="true">
					{#each ['grid', 'chart', 'users', 'database'] as const as icon (icon)}
						<span class="showcase__rail-dot" class:on={icon === 'grid'}>
							<Icon name={icon} size={16} />
						</span>
					{/each}
				</aside>

				<div class="showcase__main">
					<div class="showcase__bar">
						<span class="showcase__pill">
							<span class="dot"></span>
							All systems normal
						</span>
						<span class="showcase__pill showcase__pill--ghost">Last 30 days</span>
						<span class="avatar avatar--sm">RM</span>
					</div>

					<div class="showcase__kpis">
						{#each [['MRR', '$84,240', '+12.4%'], ['Workspaces', '12,480', '+8.1%'], ['Conversion', '3.9%', '−3.2%']] as [label, value, delta] (label)}
							<div class="showcase__kpi">
								<span class="showcase__kpi-label">{label}</span>
								<strong>{value}</strong>
								<span class="showcase__kpi-delta" class:neg={delta.startsWith('−')}>{delta}</span>
							</div>
						{/each}
					</div>

					<div class="showcase__chart" aria-hidden="true">
						{#each CHART as height, i (i)}
							<span style:height="{height}%" style:animation-delay="{i * 70}ms"></span>
						{/each}
					</div>
				</div>
			</div>
		</GlassSurface>
	</section>

	<!-- ------------------------------------------------------------ logos -->
	<section class="logos" aria-label="Used by">
		{#each LOGOS as logo (logo)}
			<span class="logos__item">{logo}</span>
		{/each}
	</section>

	<!-- --------------------------------------------------------- features -->
	<section class="section" id="features">
		<div class="section__head">
			<p class="eyebrow">How it works</p>
			<h2 class="section__title">A glass system, not a glass effect</h2>
			<p class="section__lead">
				Three ingredients make the effect: a displacement map built from the panel’s live
				size, an SVG filter chain that samples it three times for chromatic dispersion, and
				a host element that clips it, tints it and keeps the text out of the filter.
			</p>
		</div>

		<div class="features">
			{#each FEATURES as feature (feature.title)}
				<GlassSurface preset="panel" class="feature">
					<div class="glass-inner feature__inner">
						<span class="feature__icon"><Icon name={feature.icon} size={18} /></span>
						<h3 class="feature__title">{feature.title}</h3>
						<p class="feature__body">{feature.body}</p>
					</div>
				</GlassSurface>
			{/each}
		</div>
	</section>

	<!-- --------------------------------------------------------------- lab -->
	<section class="section" id="lab">
		<div class="section__head">
			<p class="eyebrow">Playground</p>
			<h2 class="section__title">Four numbers, every surface</h2>
			<p class="section__lead">
				Radius, rim band, chromatic spread and displacement. The action keeps the map and the
				CSS <code>border-radius</code> from ever drifting apart, and rebuilds the map on every
				resize with a <code>ResizeObserver</code>.
			</p>
		</div>

		<GlassLab />
	</section>

	<!-- ----------------------------------------------------------- pricing -->
	<section class="section" id="pricing">
		<div class="section__head">
			<p class="eyebrow">Pricing</p>
			<h2 class="section__title">Per seat. No surprise invoices.</h2>
		</div>

		<div class="plans">
			{#each PLANS as plan (plan.name)}
				<GlassSurface
					preset="panel"
					class="plan {plan.highlighted ? 'plan--featured' : ''}"
					scale={plan.highlighted ? -190 : -150}
					chromatic={plan.highlighted ? 26 : 18}
				>
					<div class="glass-inner plan__inner">
						<div class="plan__head">
							<h3 class="plan__name">{plan.name}</h3>
							{#if plan.highlighted}<span class="badge badge--accent">Most popular</span>{/if}
						</div>
						<div class="plan__price">
							<strong>{plan.price}</strong>
							<span>{plan.period}</span>
						</div>
						<p class="plan__blurb">{plan.blurb}</p>
						<ul class="plan__features">
							{#each plan.features as item (item)}
								<li>
									<Icon name="check" size={15} />
									{item}
								</li>
							{/each}
						</ul>
						<a
							class="btn btn--block {plan.highlighted ? 'btn--primary' : 'btn--outline'}"
							href="/app"
						>
							{plan.cta}
						</a>
					</div>
				</GlassSurface>
			{/each}
		</div>
	</section>

	<!-- ------------------------------------------------------- testimonial -->
	<section class="section">
		{#each TESTIMONIALS as quote, i (quote.who)}
			<GlassSurface preset="panel" class="quote">
				<div class="glass-inner quote__inner">
					<Icon name="quote" size={22} class="quote__mark" />
					<p class="quote__text">{quote.quote}</p>
					<footer class="quote__foot">
						<span class="avatar" aria-hidden="true">{quote.who.split(' ').map((w) => w[0]).join('')}</span>
						<span>
							<span class="quote__who">{quote.who}</span>
							<span class="quote__role">{quote.role}</span>
						</span>
					</footer>
				</div>
			</GlassSurface>
			{#if i === 0}<span class="sr-only">Second testimonial</span>{/if}
		{/each}
	</section>

	<!-- --------------------------------------------------------------- CTA -->
	<section class="cta">
		<GlassSurface preset="window" class="cta__panel">
			<div class="glass-inner cta__inner">
				<h2 class="cta__title">Take the template</h2>
				<p class="cta__lead">
					One dependency: Svelte. Clone it, rename it, ship it. The glass engine is ~200
					lines and documented from the ground up.
				</p>
				<div class="cta__actions">
					<a class="btn btn--primary btn--lg" href="/app">
						Browse the dashboard
						<Icon name="arrow-up-right" size={17} />
					</a>
					<span class="cta__hint">⌘K works everywhere on this site</span>
				</div>
			</div>
		</GlassSurface>
	</section>
</main>

<footer class="footer">
	<div class="page footer__inner">
		<div class="footer__brand">
			<span class="footer__logo">Glasswing</span>
			<span class="faint">Liquid glass for Svelte 5</span>
		</div>
		<nav class="footer__links" aria-label="Footer">
			<a href="/#features">Features</a>
			<a href="/#pricing">Pricing</a>
			<a href="/app">Dashboard</a>
			<a href="/app/settings">Settings</a>
		</nav>
		<ThemeToggle />
	</div>
</footer>

<style>
	.landing {
		display: flex;
		flex-direction: column;
		gap: 96px;
		padding-top: 168px;
		padding-bottom: 72px;
	}

	/* ------------------------------------------------------------- hero */
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		text-align: center;
	}
	.hero__badge {
		padding: 5px 12px;
	}
	.hero__title {
		font-size: var(--step-5);
		font-weight: 600;
		letter-spacing: -0.045em;
		line-height: 1.02;
	}
	.hero__lead {
		max-width: 58ch;
		font-size: var(--step-1);
		color: var(--text-dim);
		text-wrap: balance;
	}
	.hero__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		justify-content: center;
		margin-top: 6px;
	}
	.hero__note {
		font-size: var(--step--1);
		color: var(--text-faint);
	}

	/* --------------------------------------------------------- showcase */
	.showcase {
		perspective: 1400px;
	}
	:global(.showcase__frame) {
		--grain: 0.05;
	}
	.showcase__mock {
		display: grid;
		grid-template-columns: 58px 1fr;
		gap: 14px;
		padding: 14px;
	}
	.showcase__rail {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 8px 0;
		border-radius: 18px;
		background: var(--hairline);
	}
	.showcase__rail-dot {
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		border-radius: 11px;
		color: var(--text-faint);
	}
	.showcase__rail-dot.on {
		color: var(--accent);
		background: var(--accent-soft);
		box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--accent) 26%, transparent);
	}

	.showcase__main {
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
	}
	.showcase__bar {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.showcase__pill {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		height: 32px;
		padding: 0 13px;
		border-radius: 999px;
		font-size: var(--step--1);
		font-weight: 550;
		color: var(--positive);
		background: var(--hairline);
		box-shadow: inset 0 0 0 1px var(--hairline);
	}
	.showcase__pill--ghost {
		color: var(--text-dim);
		margin-right: auto;
	}
	.showcase__pill .dot {
		background: var(--positive);
	}

	.showcase__kpis {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
	}
	.showcase__kpi {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 12px 14px;
		border-radius: 16px;
		background: var(--hairline);
		box-shadow: inset 0 0 0 1px var(--hairline);
	}
	.showcase__kpi-label {
		font-size: 11px;
		color: var(--text-faint);
	}
	.showcase__kpi strong {
		font-size: var(--step-2);
		letter-spacing: -0.03em;
	}
	.showcase__kpi-delta {
		font-size: 11px;
		font-weight: 600;
		color: var(--positive);
	}
	.showcase__kpi-delta.neg {
		color: var(--negative);
	}

	.showcase__chart {
		display: flex;
		align-items: flex-end;
		gap: 8px;
		height: 168px;
		padding: 16px 16px 0;
		border-radius: 18px;
		background: var(--hairline);
		box-shadow: inset 0 0 0 1px var(--hairline);
	}
	.showcase__chart span {
		flex: 1;
		border-radius: 7px 7px 2px 2px;
		background: linear-gradient(
			180deg,
			var(--accent),
			color-mix(in oklab, var(--accent-2) 55%, transparent)
		);
		opacity: 0.9;
		animation: rise 1s var(--ease) backwards;
	}
	@keyframes rise {
		from {
			transform: scaleY(0.15);
			transform-origin: bottom;
			opacity: 0;
		}
	}

	/* ----------------------------------------------------------- logos */
	.logos {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 14px 34px;
		opacity: 0.55;
	}
	.logos__item {
		font-size: var(--step-1);
		font-weight: 600;
		letter-spacing: -0.02em;
		color: var(--text-dim);
	}

	/* -------------------------------------------------------- sections */
	.section {
		display: flex;
		flex-direction: column;
		gap: 36px;
	}
	.section__head {
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-width: 66ch;
	}
	.section__title {
		font-size: var(--step-3);
	}
	.section__lead {
		color: var(--text-dim);
	}
	.section__lead code {
		font-family: var(--font-mono);
		font-size: 0.92em;
		padding: 1px 5px;
		border-radius: 5px;
		background: var(--hairline);
	}

	.features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(272px, 1fr));
		gap: 16px;
	}
	:global(.feature) {
		padding: 2px;
	}
	.feature__inner {
		display: flex;
		flex-direction: column;
		gap: 10px;
		height: 100%;
		padding: 22px;
	}
	.feature__icon {
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		border-radius: 12px;
		color: var(--accent);
		background: var(--accent-soft);
		box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--accent) 22%, transparent);
	}
	.feature__title {
		font-size: var(--step-1);
	}
	.feature__body {
		font-size: var(--step--1);
		color: var(--text-dim);
	}

	/* ---------------------------------------------------------- plans */
	.plans {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(268px, 1fr));
		gap: 16px;
		align-items: stretch;
	}
	:global(.plan) {
		padding: 2px;
	}
	:global(.plan--featured) {
		--gw-tint: var(--accent-tint);
		--gw-rim: var(--accent-rim);
	}
	.plan__inner {
		display: flex;
		flex-direction: column;
		gap: 14px;
		height: 100%;
		padding: 24px;
	}
	.plan__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}
	.plan__name {
		font-size: var(--step-1);
	}
	.plan__price {
		display: flex;
		align-items: baseline;
		gap: 8px;
	}
	.plan__price strong {
		font-size: var(--step-3);
		letter-spacing: -0.04em;
	}
	.plan__price span {
		font-size: var(--step--1);
		color: var(--text-faint);
	}
	.plan__blurb {
		font-size: var(--step--1);
		color: var(--text-dim);
	}
	.plan__features {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 9px;
		margin: 0 0 6px;
		padding: 14px 0 0;
		border-top: 1px solid var(--hairline);
		font-size: var(--step--1);
	}
	.plan__features li {
		display: flex;
		align-items: center;
		gap: 9px;
		color: var(--text-dim);
	}
	.plan__features :global(svg) {
		color: var(--positive);
		flex: none;
	}
	.plan__inner :global(.btn) {
		margin-top: auto;
	}

	/* --------------------------------------------------------- quotes */
	:global(.quote .glass-inner) {
		padding: 26px;
	}
	.quote__inner {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	:global(.quote__mark) {
		color: var(--accent);
		opacity: 0.7;
	}
	.quote__text {
		font-size: var(--step-1);
		line-height: 1.5;
		letter-spacing: -0.015em;
	}
	.quote__foot {
		display: flex;
		align-items: center;
		gap: 11px;
	}
	.quote__who {
		display: block;
		font-size: var(--step-0);
		font-weight: 600;
	}
	.quote__role {
		display: block;
		font-size: var(--step--1);
		color: var(--text-faint);
	}

	/* ------------------------------------------------------------- CTA */
	.cta__inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding: 56px 32px;
		text-align: center;
	}
	.cta__title {
		font-size: var(--step-4);
	}
	.cta__lead {
		max-width: 52ch;
		color: var(--text-dim);
	}
	.cta__actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		margin-top: 6px;
	}
	.cta__hint {
		font-size: var(--step--1);
		color: var(--text-faint);
	}

	/* ---------------------------------------------------------- footer */
	.footer {
		position: relative;
		z-index: 1;
		border-top: 1px solid var(--hairline);
		padding: 28px 0 40px;
	}
	.footer__inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		flex-wrap: wrap;
	}
	.footer__brand {
		display: flex;
		flex-direction: column;
		font-size: var(--step--1);
	}
	.footer__logo {
		font-size: var(--step-1);
		font-weight: 600;
		letter-spacing: -0.03em;
		color: var(--text);
	}
	.footer__links {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		font-size: var(--step--1);
		color: var(--text-dim);
	}
	.footer__links a:hover {
		color: var(--text);
	}

	@media (max-width: 760px) {
		.landing {
			gap: 72px;
			padding-top: 132px;
		}
		.showcase__mock {
			grid-template-columns: 1fr;
		}
		.showcase__rail {
			flex-direction: row;
			justify-content: center;
		}
		.showcase__chart {
			height: 120px;
		}
		.cta__inner {
			padding: 40px 20px;
		}
	}
</style>