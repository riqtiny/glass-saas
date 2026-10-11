<!--
	Command palette. Uses a native <dialog> so focus trapping, Esc and inertness come from
	the platform rather than from 80 lines of JavaScript.
-->
<script lang="ts">
	import GlassSurface from '#lib/glass/GlassSurface.svelte';
	import Icon from './Icon.svelte';
	import type { IconName } from './icons';

	type Props = { open?: boolean };
	type Action = {
		label: string;
		group: string;
		icon: IconName;
		href?: string;
		hint?: string;
		onclick?: () => void;
	};

	let { open = $bindable(false) }: Props = $props();

	const ACTIONS: Action[] = [
		{ label: 'Overview', group: 'Navigate', icon: 'grid', href: '/app' },
		{ label: 'Analytics', group: 'Navigate', icon: 'chart', href: '/app/analytics' },
		{ label: 'Customers', group: 'Navigate', icon: 'users', href: '/app/customers' },
		{ label: 'Data', group: 'Navigate', icon: 'database', href: '/app/data' },
		{ label: 'Settings', group: 'Navigate', icon: 'settings', href: '/app/settings' },
		{ label: 'Invite a teammate', group: 'Actions', icon: 'users', hint: '⌘I' },
		{ label: 'Create report', group: 'Actions', icon: 'file', hint: '⌘R' },
		{ label: 'Export as CSV', group: 'Actions', icon: 'download', hint: '⌘E' },
		{ label: 'API keys', group: 'Actions', icon: 'lock' },
		{ label: 'Back to the marketing site', group: 'Actions', icon: 'external', href: '/' }
	];

	let dialog: HTMLDialogElement;
	let query = $state('');
	let cursor = $state(0);
	let list: HTMLDivElement;

	const results = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return q ? ACTIONS.filter((a) => a.label.toLowerCase().includes(q)) : ACTIONS;
	});

	// Keep the cursor inside the result set while typing.
	$effect(() => {
		void results;
		cursor = 0;
	});

	$effect(() => {
		if (open && !dialog.open) {
			query = '';
			cursor = 0;
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});

	$effect(() => {
		void cursor;
		list?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
	});

	function onkeydown(event: KeyboardEvent) {
		const total = Math.max(results.length, 1);
		if (event.key === 'ArrowDown' || (event.key === 'Tab' && event.shiftKey)) {
			event.preventDefault();
			cursor = (cursor + 1) % total;
		} else if (event.key === 'ArrowUp' || event.key === 'Tab') {
			event.preventDefault();
			cursor = (cursor - 1 + total) % total;
		} else if (event.key === 'Enter') {
			event.preventDefault();
			run(results[cursor]);
		}
	}

	function run(action: Action | undefined) {
		if (!action) return;
		open = false;
		if (action.href) location.href = action.href;
		action.onclick?.();
	}

	const activeId = $derived(results[cursor] ? 'palette-opt-' + cursor : undefined);
</script>

<dialog
	bind:this={dialog}
	class="palette"
	onclose={() => (open = false)}
	onkeydown={onkeydown}
	aria-label="Command palette"
>
	<GlassSurface preset="window" class="palette__panel">
		<div class="palette__search">
			<Icon name="search" size={17} class="palette__search-icon" />
			<!-- svelte-ignore a11y_autofocus -->
			<input
				class="palette__input"
				type="text"
				role="combobox"
				aria-expanded="true"
				aria-controls="palette-list"
				aria-autocomplete="list"
				aria-activedescendant={activeId}
				placeholder="Jump to a page or run an action…"
				bind:value={query}
				autofocus
				aria-label="Search commands"
			/>
			<span class="kbd" aria-hidden="true">esc</span>
		</div>

		<div class="palette__list" id="palette-list" role="listbox" tabindex="-1" bind:this={list}>
			{#if results.length === 0}
				<p class="palette__empty">No matches for “{query}”.</p>
			{/if}
			{#each results as action, i (action.label)}
				<button
					type="button"
					class="palette__item"
					id={'palette-opt-' + i}
					role="option"
					aria-selected={i === cursor}
					data-active={i === cursor}
					onclick={() => run(action)}
				>
					<span class="palette__item-icon"><Icon name={action.icon} size={16} /></span>
					<span class="palette__item-label">{action.label}</span>
					<span class="palette__item-group">{action.group}</span>
					{#if action.hint}<span class="kbd">{action.hint}</span>{/if}
				</button>
			{/each}
		</div>
	</GlassSurface>
</dialog>

<style>
	.palette {
		width: min(640px, calc(100vw - 32px));
		max-height: min(70vh, 560px);
		padding: 0;
		border: 0;
		background: transparent;
		overflow: visible;
		margin: auto;
	}
	.palette::backdrop {
		background: rgb(3 5 11 / 0.5);
		backdrop-filter: blur(4px) saturate(0.8);
	}
	.palette[open] {
		animation: pop 0.28s var(--ease);
	}
	@keyframes pop {
		from {
			opacity: 0;
			transform: translateY(-10px) scale(0.97);
		}
	}

	/* global: rendered by GlassSurface */
	:global(.palette__panel) {
		display: flex;
		flex-direction: column;
		max-height: min(70vh, 560px);
		background: var(--gw-tint);
	}

	.palette__search {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 14px 16px;
		border-bottom: 1px solid var(--hairline);
	}
	:global(.palette__search-icon) {
		color: var(--text-faint);
		flex: none;
	}
	.palette__input {
		flex: 1;
		min-width: 0;
		border: 0;
		background: none;
		font-size: var(--step-1);
		outline: none;
	}
	.palette__input::placeholder {
		color: var(--text-faint);
	}

	.palette__list {
		overflow-y: auto;
		padding: 8px;
	}
	.palette__item {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 9px 10px;
		border: 0;
		border-radius: 11px;
		text-align: left;
		color: inherit;
		background: transparent;
		cursor: pointer;
	}
	.palette__item[data-active='true'] {
		background: var(--hairline-strong);
		box-shadow: inset 0 0 0 1px var(--hairline-strong);
	}
	.palette__item-icon {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		flex: none;
		border-radius: 8px;
		color: var(--text-dim);
		background: var(--hairline);
	}
	.palette__item-label {
		font-size: var(--step-0);
		font-weight: 500;
	}
	.palette__item-group {
		font-size: var(--step--1);
		color: var(--text-faint);
	}
	.palette__empty {
		padding: 22px 12px;
		color: var(--text-faint);
		text-align: center;
	}
</style>