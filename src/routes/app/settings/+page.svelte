<script lang="ts">
	import AppTopbar from '#lib/components/AppTopbar.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Segmented from '#lib/components/Segmented.svelte';
	import Toggle from '#lib/components/Toggle.svelte';
	import GlassSurface from '#lib/glass/GlassSurface.svelte';
	import { palette } from '#lib/state/palette.svelte';
	import { prefs } from '#lib/state/prefs.svelte';

	let range = $state('30d');

	let weeklyDigest = $state(true);
	let deployAlerts = $state(true);
	let usageWarnings = $state(false);
	let productNews = $state(false);

	let name = $state('Rina Mahendra');
	let email = $state('rina@glasswing.dev');
	let workspace = $state('Northwind Labs');
	let region = $state('eu-central-1');
</script>

<div class="settings">
	<AppTopbar bind:range onsearch={() => palette.toggle()} />

	<div class="settings__grid">
		<!-- --------------------------------------------------------- profile -->
		<GlassSurface preset="panel" class="panel">
			<div class="glass-inner panel__inner">
				<header class="panel__head">
					<h2 class="panel__title">Profile</h2>
					<p class="panel__caption">How your account appears to teammates and in audit logs.</p>
				</header>

				<div class="panel__body form">
					<div class="form__row">
						<span class="avatar" aria-hidden="true">RM</span>
						<div>
							<button type="button" class="btn btn--outline btn--sm">Change avatar</button>
							<p class="panel__hint">PNG or JPG, at least 256×256.</p>
						</div>
					</div>

					<label class="field">
						<span>Full name</span>
						<input class="input" bind:value={name} />
					</label>

					<label class="field">
						<span>Work email</span>
						<input class="input" type="email" bind:value={email} />
					</label>

					<div class="form__pair">
						<label class="field">
							<span>Workspace</span>
							<input class="input" bind:value={workspace} />
						</label>
						<label class="field">
							<span>Data region</span>
							<select class="input" bind:value={region}>
								<option value="eu-central-1">EU Central (Frankfurt)</option>
								<option value="us-east-1">US East (Virginia)</option>
								<option value="ap-southeast-2">AP Southeast (Sydney)</option>
							</select>
						</label>
					</div>
				</div>

				<footer class="panel__foot">
					<button type="button" class="btn btn--primary btn--sm">Save changes</button>
				</footer>
			</div>
		</GlassSurface>

		<!-- ------------------------------------------------------ appearance -->
		<GlassSurface preset="panel" class="panel">
			<div class="glass-inner panel__inner">
				<header class="panel__head">
					<h2 class="panel__title">Appearance</h2>
					<p class="panel__caption">
						These two switches are the escape hatches. Both keep the tint — and therefore the
						text contrast — and only change what happens behind it.
					</p>
				</header>

				<div class="panel__body rows">
					<div class="row">
						<div class="row__text">
							<span class="row__label">Theme</span>
							<span class="row__hint">Tint, rim highlight and text colour all shift together.</span>
						</div>
						<Segmented
							options={[
								{ value: 'dark', label: 'Dark' },
								{ value: 'light', label: 'Light' }
							]}
							value={prefs.theme}
							label="Theme"
							onchange={(value) => prefs.setTheme(value)}
						/>
					</div>

					<div class="row">
						<div class="row__text">
							<span class="row__label">Refraction</span>
							<span class="row__hint">
								Off swaps the displacement filter for a plain blur. Roughly a tenth of the
								GPU cost per surface.
							</span>
						</div>
						<Toggle
							checked={prefs.glass}
							label="Refraction"
							onchange={(value) => prefs.setGlass(value)}
						/>
					</div>

					<div class="row">
						<div class="row__text">
							<span class="row__label">Ambient motion</span>
							<span class="row__hint">
								The backdrop re-evaluates every filter chain on every frame. Freezing it
								means the glass only recomputes when something else moves.
							</span>
						</div>
						<Toggle
							checked={prefs.motion}
							label="Ambient motion"
							onchange={(value) => prefs.setMotion(value)}
						/>
					</div>
				</div>
			</div>
		</GlassSurface>

		<!-- ---------------------------------------------------- notifications -->
		<GlassSurface preset="panel" class="panel">
			<div class="glass-inner panel__inner">
				<header class="panel__head">
					<h2 class="panel__title">Notifications</h2>
					<p class="panel__caption">Emails and in-app alerts.</p>
				</header>

				<div class="panel__body rows">
					{#each [{ k: 'digest', label: 'Weekly digest', hint: 'Every Monday at 09:00 local time.', get: () => weeklyDigest, set: (v: boolean) => (weeklyDigest = v) }, { k: 'deploys', label: 'Deploy alerts', hint: 'When a production deploy succeeds or fails.', get: () => deployAlerts, set: (v: boolean) => (deployAlerts = v) }, { k: 'usage', label: 'Usage warnings', hint: 'At 80%, 95% and 100% of the plan allowance.', get: () => usageWarnings, set: (v: boolean) => (usageWarnings = v) }, { k: 'news', label: 'Product news', hint: 'Occasional changelog and event invites.', get: () => productNews, set: (v: boolean) => (productNews = v) }] as item (item.k)}
						<div class="row">
							<div class="row__text">
								<span class="row__label">{item.label}</span>
								<span class="row__hint">{item.hint}</span>
							</div>
							<Toggle checked={item.get()} label={item.label} onchange={item.set} />
						</div>
					{/each}
				</div>
			</div>
		</GlassSurface>

		<!-- ------------------------------------------------------ danger zone -->
		<GlassSurface preset="panel" class="panel panel--danger">
			<div class="glass-inner panel__inner">
				<header class="panel__head">
					<h2 class="panel__title">Danger zone</h2>
					<p class="panel__caption">Deleting a workspace removes its events within 24 hours.</p>
				</header>

				<div class="panel__body rows">
					{#each [{ label: 'Transfer ownership', hint: 'Hand this workspace to another admin.', btn: 'Transfer', cls: 'btn--outline' }, { label: 'Export everything', hint: 'A full archive of events, settings and members.', btn: 'Request export', cls: 'btn--outline' }, { label: 'Delete workspace', hint: 'This cannot be undone.', btn: 'Delete', cls: 'btn--danger' }] as action (action.label)}
						<div class="row">
							<div class="row__text">
								<span class="row__label">{action.label}</span>
								<span class="row__hint">{action.hint}</span>
							</div>
							<button type="button" class="btn btn--sm {action.cls}">{action.btn}</button>
						</div>
					{/each}
				</div>
			</div>
		</GlassSurface>
	</div>

	<p class="settings__foot">
		<Icon name="shield" size={14} />
		Changes are stored locally for this demo. Nothing leaves your browser.
	</p>
</div>

<style>
	.settings {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.settings__grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
		gap: 16px;
		align-items: start;
	}

	:global(.panel) {
		padding: 2px;
	}
	:global(.panel--danger) {
		--gw-tint: var(--danger-tint);
		--gw-rim: var(--danger-rim);
	}

	.panel__inner {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.panel__head {
		padding: 18px 20px 14px;
	}
	.panel__title {
		font-size: var(--step-1);
	}
	.panel__caption {
		margin-top: 4px;
		font-size: var(--step--1);
		color: var(--text-faint);
		max-width: 52ch;
	}

	.panel__body {
		padding: 0 12px;
	}

	.panel__foot {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		padding: 16px 20px 18px;
		margin-top: auto;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding-bottom: 6px;
	}
	.form__row {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.form__pair {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
	}
	.form__pair > * {
		min-width: 0;
	}

	.rows {
		display: flex;
		flex-direction: column;
		padding-bottom: 12px;
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 18px;
		padding: 14px 8px;
		border-top: 1px solid var(--hairline);
	}
	.row:first-child {
		border-top: 0;
	}
	.row__text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.row__label {
		font-size: var(--step-0);
		font-weight: 550;
	}
	.row__hint {
		font-size: var(--step--1);
		color: var(--text-faint);
		max-width: 46ch;
	}
	.row > :global(.switch),
	.row > :global(.btn) {
		flex: none;
	}

	.panel__hint {
		font-size: 11px;
		color: var(--text-faint);
		margin-top: 6px;
	}

	.settings__foot {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 6px;
		font-size: var(--step--1);
		color: var(--text-faint);
	}

	@media (max-width: 560px) {
		.form__pair {
			grid-template-columns: 1fr;
		}
		.row {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>