<script lang="ts" generics="T extends string">
	type Option = { value: T; label: string };

	type Props = {
		options: Option[];
		value: T;
		onchange: (value: T) => void;
		label: string;
		size?: 'sm' | 'md';
	};

	let { options, value, onchange, label, size = 'md' }: Props = $props();
</script>

<div class="segmented" class:sm={size === 'sm'} role="group" aria-label={label}>
	{#each options as option (option.value)}
		<button
			type="button"
			class="segmented__btn"
			class:active={option.value === value}
			aria-pressed={option.value === value}
			onclick={() => onchange(option.value)}
		>
			{option.label}
		</button>
	{/each}
</div>

<style>
	.segmented {
		display: inline-flex;
		padding: 3px;
		border-radius: 11px;
		background: var(--hairline);
		box-shadow: inset 0 0 0 1px var(--hairline-strong);
	}
	.segmented__btn {
		padding: 0 12px;
		height: 28px;
		border: 0;
		border-radius: 8px;
		background: transparent;
		color: var(--text-dim);
		font-size: var(--step--1);
		font-weight: 550;
		cursor: pointer;
		white-space: nowrap;
		transition: color 0.16s var(--ease), background-color 0.16s var(--ease);
	}
	.segmented__btn:hover {
		color: var(--text);
	}
	.segmented__btn.active {
		color: var(--text);
		background: color-mix(in oklab, var(--gw-tint-solid) 88%, transparent);
		box-shadow:
			0 1px 2px rgb(0 0 0 / 0.2),
			inset 0 0 0 1px var(--hairline);
	}
	.segmented.sm .segmented__btn {
		height: 24px;
		padding: 0 10px;
	}
</style>