<script lang="ts">
	type Props = {
		checked: boolean;
		onchange: (next: boolean) => void;
		label: string;
		disabled?: boolean;
	};

	let { checked, onchange, label, disabled = false }: Props = $props();
</script>

<button
	type="button"
	class="switch"
	class:on={checked}
	role="switch"
	aria-checked={checked}
	aria-label={label}
	{disabled}
	onclick={() => !disabled && onchange(!checked)}
>
	<span class="switch__thumb"></span>
</button>

<style>
	.switch {
		position: relative;
		width: 42px;
		height: 25px;
		flex: none;
		padding: 0;
		border: 0;
		border-radius: 999px;
		cursor: pointer;
		background: var(--hairline-strong);
		box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.25);
		transition: background-color 0.2s var(--ease);
	}
	.switch:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.switch.on {
		background: linear-gradient(140deg, var(--accent), var(--accent-2));
	}
	.switch__thumb {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 19px;
		height: 19px;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 2px 5px rgb(0 0 0 / 0.35);
		transition: transform 0.24s var(--ease);
	}
	.switch.on .switch__thumb {
		transform: translateX(17px);
	}
	.switch:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
</style>