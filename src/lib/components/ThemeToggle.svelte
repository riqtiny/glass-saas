<script lang="ts">
	import { prefs } from '#lib/state/prefs.svelte';
	import Icon from './Icon.svelte';

	const label = $derived(prefs.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
</script>

<button
	type="button"
	class="icon-btn"
	aria-label={label}
	title={label}
	onclick={() => prefs.toggleTheme()}
>
	<Icon name={prefs.theme === 'dark' ? 'sun' : 'moon'} size={17} />
</button>

<style>
	.icon-btn {
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		flex: none;
		border: 0;
		border-radius: 10px;
		color: var(--text-dim);
		background: transparent;
		cursor: pointer;
		transition: color 0.15s var(--ease), background-color 0.15s var(--ease);
	}
	.icon-btn:hover {
		color: var(--text);
		background: var(--hairline);
	}
</style>