// The whole effect is client-side: an SVG displacement map sized from a ResizeObserver,
// painted through backdrop-filter. No SSR, so no hydration flash of a wrong-sized lens.
export const ssr = false;
export const prerender = false;