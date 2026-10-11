import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		// SvelteKit 3 takes its whole config here — there is no svelte.config.js any more.
		sveltekit({
			// The glass effect is 100% client-side (ResizeObserver + SVG filter), so we ship a
			// static bundle with a single fallback document and no server runtime.
			adapter: adapter({ fallback: 'index.html', precompress: false, strict: false })
		})
	],
	server: { host: true, port: 5173 }
});