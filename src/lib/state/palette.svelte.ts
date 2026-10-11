/** Shared open state for the command palette, so ⌘K works from anywhere. */
class Palette {
	open = $state(false);
	toggle() {
		this.open = !this.open;
	}
}

export const palette = new Palette();