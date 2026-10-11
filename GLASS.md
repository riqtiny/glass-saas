# The "clear glass" navbar in `index-glass.html`

A complete teardown of the liquid-glass / clear-glass effect used by the pill-shaped
navbar at the top of `index-glass.html` — what every line does, why it is there, and what
the numbers actually add up to.

> All measurements in this document come from a numerical reconstruction of
> `buildMap()` (`/tmp/opencode/map-sim.mjs`) that reproduces the composited displacement
> map, approximating the 7 px Gaussian blur with three box passes. Values should be read
> as "± 0.5 px, browser-dependent", not as ground truth to the last decimal.

---

## Table of contents

1. [What the effect actually is](#1-what-the-effect-actually-is)
2. [The three ingredients](#2-the-three-ingredients)
3. [Layer and stacking model](#3-layer-and-stacking-model)
4. [Ingredient 1 — the displacement map (`buildMap`)](#4-ingredient-1--the-displacement-map-buildmap)
   - [4.1 The neutral-point rule](#41-the-neutral-point-rule)
   - [4.2 Layer by layer](#42-layer-by-layer)
   - [4.3 Measured lens profile](#43-measured-lens-profile)
   - [4.4 Two exact properties of this construction](#44-two-exact-properties-of-this-construction)
5. [Ingredient 2 — the SVG filter chain (`#glass-filter`)](#5-ingredient-2--the-svg-filter-chain-glass-filter)
6. [Ingredient 3 — the CSS host (`.glass`)](#6-ingredient-3--the-css-host-glass)
7. [Sizing: why the map is rebuilt from JS](#7-sizing-why-the-map-is-rebuilt-from-js)
8. [Why the animated poster wall exists](#8-why-the-animated-poster-wall-exists)
9. [Tunables reference](#9-tunables-reference)
10. [Recipes: changing the look](#10-recipes-changing-the-look)
11. [Performance](#11-performance)
12. [Browser support and fallbacks](#12-browser-support-and-fallbacks)
13. [Accessibility](#13-accessibility)
14. [Footguns](#14-footguns)
15. [Verified quirks and dead code](#15-verified-quirks-and-dead-code)
16. [Appendix — minimal standalone reproduction](#16-appendix--minimal-standalone-reproduction)

---

## 1. What the effect actually is

It is **not** a `backdrop-filter: blur()` — there is no blur of the backdrop at all. It is a
2D refraction: the backdrop is *displaced* (shifted) by an amount that varies across the
surface of the pill, so the background bends as it passes through the "glass". Near the
rim the bend is strong (≈ 42 px), in the middle it is almost zero. That is the whole trick.

This is the standard cheap "liquid glass" approximation used on the web: instead of
rendering real geometry with a refraction index, you fake a **surface normal** with a
2D vector field (the displacement map) and push the backdrop around with it.

The visual signature is therefore:

| You see | It comes from |
|---|---|
| Background bent and pooled at the rim | `feDisplacementMap` sampling a map that falls off near the edges |
| Faint rainbow fringe on the rim | three displacement passes at slightly different `scale` values, one per colour channel |
| Content (`Home`, icons…) perfectly sharp | `backdrop-filter` only filters *what is behind* the element, never its children |
| Dark tinted pill | `background: rgba(0,0,0,.2)` painted **on top of** the filtered backdrop |

---

## 2. The three ingredients

| # | Ingredient | Lives in | Job |
|---|---|---|---|
| 1 | **Displacement map** — a data-URI SVG built by `buildMap()` | `<script>`, injected into `feImage#glass-map` | supplies the per-pixel bend direction/magnitude |
| 2 | **Filter chain** — `<filter id="glass-filter">` | inline `<svg>` in the DOM | applies the map, splits it into R/G/B, recombines, softens |
| 3 | **Host element** — `.glass` | `<style>` + `<nav>` markup | clips the result to the pill, tints it, and connects it to the page backdrop |

None of the three works alone. The map defines *what* happens; the filter does it; the host
element decides *where* it shows up and *what it is clipped to*.

---

## 3. Layer and stacking model

```
  page (root backdrop)
  ┌───────────────────────────────────────────────────────────────┐
  │  .wall   z-index:0                                            │
  │  5 rows of poster cards, animated on infinite loops           │
  │  ← this is the thing being refracted                          │
  └───────────────────────────────┬───────────────────────────────┘
                                  │  sampled as the "Backdrop Root" image
                                  ▼
  ┌───────────────────────────────────────────────────────────────┐
  │ .app-nav   position:fixed; top:16px; z-index:25              │
  │  ┌─────────────────────────────────────────────────────────┐  │
  │  │ .glass   backdrop-filter: url(#glass-filter) saturate(1)│  │
  │  │                                                         │  │
  │  │   1. filtered backdrop   ← the displacement happens here│  │
  │  │   2. background: rgba(0,0,0,.2)      (tint, painted on top)
  │  │   3. inset hairline + drop shadow  box-shadow            │  │
  │  │   4. .glass-inner  z-index:10      (content, NOT filtered)
  │  │        brand · links · tools                            │  │
  │  │                                                         │  │
  │  │   (hidden) .glass-svg  opacity:0; z-index:-10            │  │
  │  │        hosts <filter id="glass-filter"> and             │  │
  │  │        <feImage id="glass-map"> — it must exist in the  │  │
  │  │        document for url(#glass-filter) to resolve       │  │
  │  └─────────────────────────────────────────────────────────┘  │
  └───────────────────────────────────────────────────────────────┘
```

Three things follow from this diagram and are worth internalising:

1. **`.glass-inner` is above the filter.** `backdrop-filter` filters the backdrop, never the
   element's own children. That is why the labels and icons stay razor sharp while the
   wallpaper behind them swims. No extra work needed — just do not move the content out of
   the element.
2. **The tint is on top of the refraction**, not below it. `background: rgba(0,0,0,.2)` is
   painted after the filtered backdrop, so it darkens the *already bent* pixels.
3. **The `<svg>` host is invisible but must stay in the DOM.** A CSS `filter`/`backdrop-filter`
   that references `url(#id)` resolves against the document. `opacity: 0` keeps it invisible
   and non-interactive while leaving the reference valid; `display: none` is the risky choice
   (see [§14](#14-footguns)).

---

## 4. Ingredient 1 — the displacement map (`buildMap`)

```js
const RADIUS = 20, BLUR = 7, INSET_RATIO = 0.035, GREY = 'hsl(0 0% 50% / 0.93)';
```

`buildMap(w, h)` returns a complete SVG document as a string. It is fed to
`feImage#glass-map` as a URL-encoded data URI.

### 4.1 The neutral-point rule

`feDisplacementMap` is defined as:

```
P'(x, y) = P( x + scale · (XC(x, y) − 0.5),  y + scale · (YC(x, y) − 0.5) )
```

`XC` is the channel named by `xChannelSelector`, `YC` the one named by `yChannelSelector`.
Here that is **`R` for x** and **`G` for y**.

The single most important consequence: **channel value `0.5` means "do not move this pixel"**.
Anything above 0.5 pushes one way, below 0.5 the other way, and the push is linear in the
distance from 0.5 multiplied by `scale`. There is no normalisation and no gamma — `R`/`G`
are used as raw 0–1 floats.

So the entire design problem is: *paint a map that is exactly 0.5 everywhere except in a
band near the rim, where it ramps away from 0.5.*

### 4.2 Layer by layer

Four shapes are painted, bottom to top, into a `w × h` viewport (`w`/`h` = the pill's live
border-box size):

**Layer 1 — black base**

```html
<rect width="${w}" height="${h}" fill="black"/>
```

Everything not painted over stays `(0,0,0)`. Since the displacement map is sampled as a raw
channel value and **alpha is ignored**, `0` is a perfectly valid displacement value — it
means "full displacement", not "transparent". The black base is the "no idea" state.

**Layer 2 — horizontal ramp, `#x`**

```html
<linearGradient id="x" x1="100%" y1="0%" x2="0%" y2="0%">
  <stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="red"/>
</linearGradient>
<rect width="${w}" height="${h}" rx="20" fill="url(#x)"/>
```

Transparent at the **right** edge, opaque red at the **left** edge. Only the **R** channel
matters: `R` runs 0 → 255 from right to left. This is the horizontal component of the bend
— though, as [§4.4 A](#44-two-exact-properties-of-this-construction) shows, its real job is
to keep the left and right rims balanced against each other.

**Layer 3 — vertical ramp, `#y`**

```html
<linearGradient id="y" x1="0%" y1="0%" x2="0%" y2="100%">
  <stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="blue"/>
</linearGradient>
<rect width="${w}" height="${h}" rx="20" fill="url(#y)" style="mix-blend-mode:screen"/>
```

Transparent at the top, opaque **blue** at the bottom. This layer is **inert** — see
[§15.1](#151-the-blue-vertical-ramp-does-nothing). `feDisplacementMap` samples **G** for
vertical displacement, and blue has `G = 0`; the `screen` blend cannot change that because
`screen(x, 0) = x`.

**Layer 4 — the neutral island**

```html
<rect x="${i}" y="${i}" width="${w-i*2}" height="${h-i*2}" rx="20"
      fill="hsl(0 0% 50% / 0.93)" style="filter:blur(7px)"/>
```

where `i = h * INSET_RATIO = 48 × 0.035 ≈ 1.68 px`.

A 50 % grey rectangle, inset slightly, blurred by 7 px. This is the "flat glass" region:
`hsl(0 0% 50%)` is `rgb(127.5, 127.5, 127.5)`, i.e. exactly `0.5` in both R and G, i.e.
exactly the neutral point. The blur feathers its edges outward, so between the pill's true
edge and ≈ 15 px inward there is a smooth ramp from "neutral" to "fully displaced". That
ramp *is* the lens.

### 4.3 Measured lens profile

For an 800 × 48 pill, `scale = -180` for the red pass and `-170` for the green pass. Values
are "source offset in px": negative = the output samples from the left of itself, so the
content visually moves **right / inward**.

**Horizontal, along the vertical centre line (y = 24), distance from the left rim:**

| d (px) | map R | map G | dx (R) | dx (G) | dx (B) | R↔B split |
|---:|---:|---:|---:|---:|---:|---:|
| 0   | 0.736 | 0.264 | −42.5 | −40.2 | −37.8 | 4.7 px |
| 1   | 0.724 | 0.275 | −40.3 | −38.1 | −35.9 | 4.5 px |
| 2   | 0.711 | 0.288 | −37.9 | −35.8 | −33.7 | 4.2 px |
| 4   | 0.682 | 0.317 | −32.7 | −30.9 | −29.1 | 3.6 px |
| 8   | 0.618 | 0.379 | −21.3 | −20.1 | −18.9 | 2.4 px |
| 12  | 0.568 | 0.430 | −12.3 | −11.6 | −10.9 | 1.4 px |
| 16  | 0.542 | 0.456 | −7.6 | −7.1 | −6.7 | 0.8 px |
| 24  | 0.533 | 0.465 | −5.9 | −5.6 | −5.3 | 0.7 px |
| 32+ | 0.532 | 0.465 | −5.8 | −5.5 | −5.2 | 0.6 px |
| centre (x = 400) | 0.500 | 0.465 | 0.0 | 0.0 | 0.0 | 0.0 px |

Mirror-image at the right rim (+42.5 px at x = 799, i.e. sampling from the right, so content
moves left/inward). Summary: **a symmetric lens that peaks at ±42 px and dies out by ≈ 20 px
in from the edge.**

**Vertical, down the horizontal centre line (x = 400), distance from the top rim:**

| d (px) | map G | dy (R) | dy (G) | dy (B) | R↔B split |
|---:|---:|---:|---:|---:|---:|
| 0  | 0.287 | +38.4 | +36.3 | +34.1 | 4.3 px |
| 4  | 0.336 | +29.5 | +27.9 | +26.2 | 3.3 px |
| 8  | 0.393 | +19.2 | +18.1 | +17.1 | 2.1 px |
| 16 | 0.459 | +7.3 | +6.9 | +6.5 | 0.8 px |
| 24+ | 0.465 | +6.3 | +5.9 | +5.6 | 0.7 px |

Here the sign is **positive at both the top and the bottom rim**, meaning the backdrop is
dragged *upward* everywhere, strongest at the rims. That asymmetry (rim bends inward
horizontally, but one-directional vertically) is the direct fingerprint of the inert blue
ramp — see [§15.1](#151-the-blue-vertical-ramp-does-nothing).

### 4.4 Two exact properties of this construction

**A. The horizontal lens is exactly symmetric, for any `BLUR` / `INSET_RATIO`.**

Composite value at a pixel: `R = a/2 + tx·(1 − a)`, where `a` is the blurred grey alpha and
`tx ∈ [0,1]` is the red ramp (0 at the right rim, 1 at the left rim). `a` is symmetric, so at
the two extremes:

```
left  rim:  R = a/2 + 1 − a  = 1 − a/2   →  R − 0.5 = +(1−a)/2
right rim:  R = a/2         = a/2        →  R − 0.5 = −(1−a)/2
```

Identical magnitude, opposite sign — for any `a`. The red ramp's real job is not to *tilt*
the glass, it is to **rebalance** the lens so the left and right rims match. Nice.

Rim strength is therefore `(1 − a)/2 × scale`. Lower `BLUR`, or a larger `INSET_RATIO`
(thinner neutral island) → smaller `a` at the edge → stronger rim.

**B. The 0.93 alpha of `GREY` introduces a constant residual drift.**

`GREY` is painted at 93 % opacity **over the black base**, so a fully neutral interior pixel
composites to `0.93 × 0.5 = 0.465`, not `0.5`. That 0.035 deficit shows up as:

* a constant **≈ 6 px upward shift** of the whole backdrop inside the pill, and
* a small horizontal tilt: about −3 px a quarter of the way in from each rim, exactly 0 at
  the centre (visible in the table above as the 0.533 → 0.500 slope).

If you want a perfectly neutral interior, make `GREY` opaque (`hsl(0 0% 50%)`) — at the cost
of losing the subtle "the glass slides the image a little" feel, which is arguably part of
the charm.

---

## 5. Ingredient 2 — the SVG filter chain (`#glass-filter`)

```html
<filter id="glass-filter" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
```

**`color-interpolation-filters="sRGB"`** — mandatory, not decorative. The SVG default is
`linearRGB`, which would change the meaning of the 0.5 midpoint, of the 50 % grey, and of
the channel values generally. Without it the map is sampled through a different transfer
curve and the lens lands in the wrong place.

**`x/y/width/height` = `0%/0%/100%/100%`** — `filterUnits` defaults to `objectBoundingBox`,
so these percentages resolve against the border box of `.glass`, giving a filter region of
exactly the pill. The default region is `-10% -10% 120% 120%`; overriding it keeps the map
aligned with the visible edge instead of an oversized, offset region.

### The primitive chain

| # | Primitive | What it does |
|---|---|---|
| 1 | `feImage#glass-map` | pulls in the displacement map. `preserveAspectRatio="none"` so the map stretches to the filter region instead of letterboxing. Result name: `map` |
| 2 | `feDisplacementMap` `scale="-180"` | bends `SourceGraphic` (the backdrop) by the map's R/G. Result `dispRed` |
| 3 | `feColorMatrix` → `red` | **zeroes G and B**, keeps R + alpha. Result is pure red with a transparent-looking, premultiplied-0 G/B |
| 4 | `feDisplacementMap` `scale="-170"` | same map, slightly weaker bend. Result `dispGreen` |
| 5 | `feColorMatrix` → `green` | keeps G only |
| 6 | `feDisplacementMap` `scale="-160"` | same map, weakest bend. Result `dispBlue` |
| 7 | `feColorMatrix` → `blue` | keeps B only |
| 8 | `feBlend` `screen` (red ⊕ green) | recombines. Because the three results are channel-isolated, `screen` degenerates to plain addition — no clipping, no darkening |
| 9 | `feBlend` `screen` (rg ⊕ blue) | final full-colour result `output` |
| 10 | `feGaussianBlur` `stdDeviation="0.5"` | ≈ 1 px softening. Hides the hairline seams between the three recombined channels and suppresses banding in the smooth ramp |

### Why three passes and not one

This is the **chromatic aberration**. Real glass has a wavelength-dependent index of
refraction: red bends slightly less than blue. Here that is simulated by sampling the *same*
map at three different strengths — 180 / 170 / 160 — and keeping one channel from each. The
channels then land a few pixels apart at the rim, producing a prismatic red-on-one-side /
blue-on-the-other fringe. Measured spread between the R and B samples:

* horizontal rim: **4.7 px** (≈ 2.35 px of visible fringe each way)
* vertical rim: **4.3 px**
* interior: **0 px** — the three passes coincide again, so the centre stays clean

The gradient of the fringe is the point: zero in the middle, max at the rim, exactly like a
real lens.

### Cost

Three displacement samples + two blends + a blur, per pixel, per frame, over the pill's
area. At 800 × 48 CSS px and DPR 2 that is ~154 000 px × ~10 texture fetches per frame. See
[§11](#11-performance).

---

## 6. Ingredient 3 — the CSS host (`.glass`)

```css
.glass{
  position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;
  height:48px;gap:4px;padding:2px 4px;border-radius:20px;
  background:rgba(0,0,0,.2);
  -webkit-backdrop-filter:url(#glass-filter) saturate(1);
  backdrop-filter:url(#glass-filter) saturate(1);
  box-shadow:rgba(255,255,255,.1) 0 0 0 .5px inset, rgba(0,0,0,.1) 0 4px 16px, rgba(0,0,0,.08) 0 8px 24px;
  transition:opacity 260ms ease-out;
  will-change:backdrop-filter,transform;transform:translateZ(0);backface-visibility:hidden;
  perspective:1000px;contain:layout style paint;
}
```

| Declaration | Role | Verdict |
|---|---|---|
| `backdrop-filter: url(#glass-filter) saturate(1)` | the effect itself | — |
| `saturate(1)` | identity function | **no-op.** Present because the original site used a filter list; harmless, keep for parity |
| `-webkit-backdrop-filter` | Safari/older Chrome | keep — unprefixed `backdrop-filter` is unsupported in Safari < 18 |
| `background: rgba(0,0,0,.2)` | tint | also the **entire fallback** when the browser cannot run the filter |
| `border-radius: 20px` | clips the filtered backdrop to the pill | must equal `RADIUS` in `buildMap`, or the lens rim drifts off the visible edge |
| `overflow: hidden` | belt-and-braces clipping; also clips the child `<svg>` | redundant given `contain: paint`, harmless |
| `box-shadow` 1st layer | `inset rgba(255,255,255,.1) 0 0 0 .5px` — the **hairline rim highlight**, the single most important cue that this is glass | keep |
| `box-shadow` 2nd/3rd layers | soft drop shadow so the pill separates from the wallpaper | keep |
| `will-change: backdrop-filter, transform` | pins a composited layer so the filter is not re-created on every frame | keep while the backdrop animates; costs memory permanently |
| `transform: translateZ(0)` | second, older way to force a layer | redundant next to `will-change` |
| `backface-visibility: hidden` | avoids edge artefacts when the layer is promoted | vestigial here |
| `perspective: 1000px` | applies to **children**, not to the element's own `transform` | **inert.** Copied from the original; the only child with a 3D transform is the invisible `<svg>` |
| `contain: layout style paint` | clips paint, makes `.glass` a stacking context and containing block | the stacking context is what keeps `z-index:-10` on the child `<svg>` from escaping |
| `transition: opacity 260ms ease-out` | for the hide-on-scroll behaviour of the original site | **inert in this replica** — nothing toggles opacity |

### The invisible filter host

```css
.glass-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;
  opacity:0;z-index:-10;transform:translateZ(0);will-change:transform}
```

It has **no `viewBox`**, so it is just a 100 % × 100 % viewport sitting behind the content.
`opacity: 0` keeps it invisible, `pointer-events: none` keeps it out of hit-testing,
`z-index: -10` puts it behind the content. It exists purely so that `#glass-filter` and
`#glass-map` are part of the document.

### The content layer

```css
.glass-inner{position:relative;z-index:10;…;padding:4px;border-radius:inherit}
```

`padding: 4px` here plus `padding: 2px 4px` on `.glass` gives the 8 px vertical / 8 px
horizontal text inset. `border-radius: inherit` is cosmetic — the element has no background
of its own — but it keeps any future one consistent.

---

## 7. Sizing: why the map is rebuilt from JS

```js
function syncMap() {
  const {width, height} = glass.getBoundingClientRect();
  if (!width || !height) return;
  feImage.setAttribute('href', 'data:image/svg+xml,' + encodeURIComponent(buildMap(width, height)));
}
new ResizeObserver(syncMap).observe(glass);
document.fonts?.ready.then(syncMap);
syncMap();
```

The map's gradients are defined in **user units of the pill's own pixel size**
(`viewBox="0 0 ${w} ${h}"`, percentage stops resolved against `w`/`h`). If the pill were
800 px wide and the map were painted for 400 px, the ramp would reach its extremes in the
middle of the pill and the lens would be half as wide. So the map must track the live size.

Three triggers cover every way the size can change:

| Trigger | Why |
|---|---|
| `ResizeObserver` | viewport resize, zoom, sidebar appearing, font-size change, container query |
| `document.fonts.ready` | Geist swaps in and the navbar gets wider/narrower |
| the immediate `syncMap()` | first paint, before `ResizeObserver` has had a chance to fire |

Details that matter:

* **`encodeURIComponent` is required**, not cosmetic. The data URI contains `#` (in `#x`,
  `#y`) and `<`/`>`; unescaped, the URI would be truncated at the first `#` and the map would
  silently fail to load.
* **`width`/`height` are fractional** (e.g. `823.3281`) because of sub-pixel layout. That is
  fine and even desirable: the map is a smooth gradient, there is nothing to alias.
* **No debounce is needed.** `ResizeObserver` already fires at most once per frame, and
  rebuilding the string costs microseconds.
* **Identical URLs are cached** by the image decoder, so a no-op resize costs nothing.
* `if (!width || !height) return` guards the case where the element is `display: none`
  (it is, below 768 px — see [§13](#13-accessibility)) and would otherwise build a `0 × 0` map.
* The filter region is re-derived automatically by the browser on every layout; only the
  map's *contents* need the explicit rebuild.

---

## 8. Why the animated poster wall exists

The wall (`#wall`, 5 rows × 24 cards, each row duplicated end-to-end and translated by
`-50%` for a seamless loop) is not decoration for its own sake. A displacement map is
**invisible on a flat background** — displace a uniform colour and you get the same uniform
colour. The effect needs high-frequency detail and motion behind the glass to read at all:
edges are what make a 42 px bend look like refraction rather than a mistake.

Two supporting details:

* Each card carries a radial specular highlight and a bottom scrim (`.card::after`), so
  there are crisp edges and gradients inside the wallpaper itself.
* The rows run at different speeds (64 s / 84 s / 72 s / 96 s / 78 s) and alternate
  direction, so the pattern behind the pill never repeats visibly.

---

## 9. Tunables reference

| Name | Value | Defined in | What it controls | Effect of increasing it |
|---|---|---|---|---|
| `RADIUS` | `20` | `buildMap` | corner radius baked into the map | **must match `.glass{border-radius}`** |
| `BLUR` | `7` | `buildMap` | width of the refraction band at the rim | softer, wider, weaker lens |
| `INSET_RATIO` | `0.035` | `buildMap` | inset of the neutral island, as a fraction of height | thinner island → stronger rim |
| `GREY` | `hsl(0 0% 50% / .93)` | `buildMap` | the neutral point and its alpha | alpha ↑ → less residual drift |
| `scale` R/G/B | `-180 / -170 / -160` | `#glass-filter` | bend strength + chromatic spread | stronger bend and thicker fringe |
| `stdDeviation` | `0.5` | `#glass-filter` | post-blend softening | hides seams, softens everything |
| `color-interpolation-filters` | `sRGB` | `#glass-filter` | colour space of the whole chain | must stay `sRGB` |
| `background` | `rgba(0,0,0,.2)` | `.glass` | tint **and** no-`backdrop-filter` fallback | darker, more opaque |
| inset `box-shadow` | `rgba(255,255,255,.1) 0 0 0 .5px` | `.glass` | the rim highlight | this is what sells "glass" |
| `height` | `48px` | `.glass` | pill height; drives `INSET_RATIO` in px | — |

---

## 10. Recipes: changing the look

**Thicker, glassier rim** — raise `BLUR`:
```js
const RADIUS = 20, BLUR = 12, INSET_RATIO = 0.035, GREY = 'hsl(0 0% 50% / 0.93)';
```

**Sharper, more "cut crystal" edge** — lower `BLUR` to `3` and drop `INSET_RATIO` to `0.01`.

**More visible rainbow** — widen the scale spread. The fringe is `(scaleR − scaleB)/2`:
```html
<feDisplacementMap … scale="-220"/>   <!-- red   -->
<feDisplacementMap … scale="-190"/>   <!-- green -->
<feDisplacementMap … scale="-160"/>   <!-- blue  -->
```
At `BLUR = 7` that takes the rim fringe from 4.7 px to ~9 px. Keep the three values within
~15 % of each other or the colours visibly separate everywhere, not just at the rim.

**Kill the residual drift** — make the neutral island fully opaque:
```js
const GREY = 'hsl(0 0% 50%)';
```
The backdrop then stays put in the middle of the pill.

**True vertical lens** — change the `#y` ramp stop from `blue` to `lime`:
```html
<stop offset="100%" stop-color="lime"/>   <!-- #0f0: G=255 -->
```
Now the vertical ramp actually reaches the G channel. With `GREY` at 0.93 alpha it is heavily
attenuated, so also raise the alpha to 1 to see it, and expect the top and bottom rims to
bend in opposite directions (a proper symmetric lens) instead of both dragging upward.

**No-`backdrop-filter` fallback** — make the pill carry its own weight:
```css
@supports not (backdrop-filter: blur(1px)){
  .glass{background:rgba(0,0,0,.55)}
}
```

---

## 11. Performance

The expensive part is not the DOM — it is that **the backdrop-filter is re-evaluated every
frame the backdrop changes**. Here the backdrop is a continuously animating poster wall, so
it is re-evaluated forever: roughly half a dozen texture fetches per pixel (three
displacement maps, each reading the map *and* the source) over the pill's box, at device
pixel ratio. At 800 × 48 CSS px and DPR 2 that is ~154 000 px touched per frame — which is
what the rest of this section is about.

What the file does about it:

* `will-change: backdrop-filter` keeps the element on its own compositor layer so the filter
  chain is not rebuilt from scratch each frame.
* `transform: translateZ(0)` / `backface-visibility: hidden` reinforce the layer promotion.
* `contain: layout style paint` limits invalidation to the pill's own box.

Things to keep in mind if you ship this:

* `will-change` is a promise to the compositor. Holding it permanently costs memory; drop it
  when the animation stops.
* If the navbar ever sits above a **scrolling** page instead of a self-contained animation,
  this is the single most expensive thing you can put in a header. Consider swapping to a
  static `blur()` above a threshold, or to `content-visibility` tricks.
* The map rebuild on resize is cheap (string concatenation + `setAttribute`). Do not
  optimise it.
* Scaling `scale` up does not cost more; it only displaces further. Cost scales with the
  *area* of the pill and the number of primitives, which are fixed.

---

## 12. Browser support and fallbacks

| Feature | Support |
|---|---|
| `backdrop-filter` | Chrome 76+, Edge 79+, Firefox 103+, Safari 18+ (prefixed `-webkit-` back to Safari 9) |
| `url()` SVG filter inside `backdrop-filter` | Chromium and WebKit: yes. Firefox: supported but historically the flakiest of the three — verify before shipping |
| `feImage` with a `data:` URI | all modern engines; SVG 2 plain `href` attribute (no `xlink:href`) is fine everywhere current. For very old Safari use `setAttributeNS('http://www.w3.org/1999/xlink', 'href', …)` |
| `mix-blend-mode` on an SVG shape (inside the map) | all modern engines — but see [§15.1](#151-the-blue-vertical-ramp-does-nothing), it does not matter here |
| `ResizeObserver` | all modern engines |
| `color-interpolation-filters` | universal |

**Failure mode to know about.** If the engine cannot resolve `#glass-filter`, it does not
skip that function — **the entire `backdrop-filter` declaration is invalid and dropped**,
along with the `-webkit-` twin. What you see is then just `background: rgba(0,0,0,.2)`: a
flat, slightly translucent dark pill. That is a perfectly acceptable degradation (the markup
is fully legible and usable), which is why no `@supports` guard is strictly required — but
see the recipe in [§10](#10-recipes-changing-the-look) if you want it darker.

---

## 13. Accessibility

* **Reduced motion** — `@media (prefers-reduced-motion: reduce){ .strip{animation:none} }`
  stops the wallpaper. The glass itself is entirely static (it only samples the backdrop), so
  nothing else needs to be disabled. The effect is still fully legible with a frozen
  background; only the refraction's "motion" goes away.
* **Mobile** — below 768 px the whole navbar is `display: none`; the site swaps in a separate
  mobile bar. `syncMap()`'s `if (!width || !height) return` guard exists for exactly this
  case. A standalone copy of this file on a phone shows the wallpaper and nothing else.
* **Semantics** — the structure is real: `<nav aria-label="Main">`, `<a>`/`<button>` for
  every action, `aria-current="page"` on the active link, and `aria-label` on each icon-only
  control. The decorative wallpaper is `aria-hidden="true"`; so is every inline icon `<svg>`,
  because the accessible name comes from the label on the parent control.
* **Focus** — `:focus-visible` styles are defined for the links, the tool buttons and the
  pill itself (2 px `#0A84FF` outline at 2 px offset). `.glass` has `tabindex="-1"`, i.e. it
  is programmatically focusable but not in the tab order — vestigial from the original.
* **Contrast** — link labels are `rgb(255 255 255 / .7)` over a 20 %-black tint over a dark
  wallpaper. Fine for the replica; on a real site, verify against the *brightest* backdrop
  state, since the tint is fixed but the wallpaper behind it moves.

---

## 14. Footguns

1. **`url(#…)` needs the `<svg>` in the document.** Removing `.glass-svg` from the markup
   silently kills the whole effect — no error, just a flat pill.
2. **Do not use `display: none` on `.glass-svg`.** `opacity: 0` is safe. Filter references
   resolve to elements in the DOM, but engines have historically been inconsistent about
   references into a `display: none` subtree. This is why the file opts for opacity.
3. **`id="glass-filter"` and `id="glass-map"` must be unique.** They are document-global.
   Two navbars on one page = duplicate IDs = both reference the first one. The gradient IDs
   *inside the map* (`#x`, `#y`) are fine, because each map is its own SVG document.
4. **`RADIUS` in JS must equal `border-radius` in CSS.** They are in different files' worth
   of code with nothing linking them. Change one, change both.
5. **`feImage` needs the map rebuilt on resize**, or the lens will not align with the pill's
   edges at any width other than the one it was built for.
6. **An ancestor with `filter`, `opacity < 1`, `mask`, or `will-change: filter` breaks it.**
   Those create a new backdrop root, so `.glass` would only refract what is inside it.
7. **`contain: paint` / a stacking context is what makes `z-index:-10` safe.** Remove
   `contain`, `will-change` *and* `backdrop-filter` at once and the hidden `<svg>` will
   start painting behind `.glass`'s own background.
8. **The tint is painted over the refraction**, so changing `background` changes the mood
   much more than changing `scale` does.

---

## 15. Verified quirks and dead code

### 15.1 The blue vertical ramp does nothing

`buildMap` paints a vertical gradient from transparent to **blue** with
`mix-blend-mode: screen`, expecting it to drive the vertical component of the displacement.
It does not:

* `feDisplacementMap` reads **G** for `yChannelSelector="G"`.
* Blue is `rgb(0, 0, 255)` — its **G is 0 everywhere along the ramp**.
* `screen(cb, cs) = cb + cs − cb·cs`; with `cs = 0` this is exactly `cb`, so the blend cannot
  manufacture any G.
* Net effect: the G channel is `0` outside the grey island and `0.465` inside it. The only
  vertical variation in the map is the grey island's own blurred falloff — which is
  *symmetric*, so both rims bend the same direction instead of opposing each other.

Confirm it yourself: change `blue` to `lime` in `buildMap` and watch the top and bottom rims
start bending in opposite directions.

(Secondary: even with `lime`, `GREY`'s 0.93 alpha attenuates whatever is underneath to 7 %.
To make the vertical ramp matter, `GREY` has to be opaque too.)

### 15.2 `GREY`'s alpha is not free

`hsl(0 0% 50% / 0.93)` over black composites to `0.465`, not `0.5` — see
[§4.4 B](#44-two-exact-properties-of-this-construction). Harmless, probably intentional
(the glass "slides" the image ~6 px up), but it means the interior is *not* mathematically
neutral.

### 15.3 Inert declarations

| Declaration | Why it does nothing |
|---|---|
| `saturate(1)` in `backdrop-filter` | identity |
| `perspective: 1000px` on `.glass` | affects children's transforms; the only 3D-transformed child is the invisible `<svg>` |
| `transition: opacity 260ms ease-out` | nothing in this replica changes the pill's opacity |
| `.glass { tabindex="-1" }` + `:focus-visible` | not reachable by keyboard |
| `#y` gradient + its `screen` blend | [§15.1](#151-the-blue-vertical-ramp-does-nothing) |
| `transform: translateZ(0)` | redundant next to `will-change: transform` |

None of these are bugs — they are traces of the original `shuttletv.su` implementation. They
are listed so that nobody spends an afternoon wondering why changing them has no effect.

---

## 16. Appendix — minimal standalone reproduction

Everything the glass needs, nothing else. Save as `.html` and open it.

```html
<!doctype html>
<meta charset="utf-8">
<style>
  body{margin:0;height:100vh;background:
    repeating-linear-gradient(90deg,#123 0 40px,#c46 40px 80px);  /* something to refract */
    display:grid;place-items:start center;padding-top:40px}

  .glass{
    position:relative;overflow:hidden;height:48px;padding:2px 8px;border-radius:20px;
    background:rgba(0,0,0,.2);color:#fff;font:500 13px system-ui;display:flex;gap:12px;align-items:center;
    backdrop-filter:url(#glass-filter) saturate(1);
    -webkit-backdrop-filter:url(#glass-filter) saturate(1);
    box-shadow:rgba(255,255,255,.1) 0 0 0 .5px inset, rgba(0,0,0,.3) 0 8px 24px;
    contain:layout style paint;
  }
  .glass-svg{position:absolute;inset:0;width:100%;height:100%;opacity:0;z-index:-10;pointer-events:none}
</style>

<nav class="glass" id="glass">
  <svg class="glass-svg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glass-filter" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
        <feImage id="glass-map" width="100%" height="100%" preserveAspectRatio="none" result="map"/>
        <feDisplacementMap in="SourceGraphic" in2="map" scale="-180" xChannelSelector="R" yChannelSelector="G" result="dr"/>
        <feColorMatrix in="dr" type="matrix" result="red" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/>
        <feDisplacementMap in="SourceGraphic" in2="map" scale="-170" xChannelSelector="R" yChannelSelector="G" result="dg"/>
        <feColorMatrix in="dg" type="matrix" result="green" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"/>
        <feDisplacementMap in="SourceGraphic" in2="map" scale="-160" xChannelSelector="R" yChannelSelector="G" result="db"/>
        <feColorMatrix in="db" type="matrix" result="blue" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"/>
        <feBlend in="red" in2="green" mode="screen" result="rg"/>
        <feBlend in="rg" in2="blue" mode="screen" result="out"/>
        <feGaussianBlur in="out" stdDeviation="0.5"/>
      </filter>
    </defs>
  </svg>
  <span>Refraction needs detail behind it — stripes work great.</span>
</nav>

<script>
  const RADIUS = 20, BLUR = 7, INSET_RATIO = 0.035, GREY = 'hsl(0 0% 50% / 0.93)';
  const glass = document.getElementById('glass');
  const feImage = document.getElementById('glass-map');

  const buildMap = (w, h) => {
    const i = h * INSET_RATIO;
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="x" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="red"/>
        </linearGradient>
        <linearGradient id="y" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="blue"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="black"/>
      <rect width="${w}" height="${h}" rx="${RADIUS}" fill="url(#x)"/>
      <rect width="${w}" height="${h}" rx="${RADIUS}" fill="url(#y)" style="mix-blend-mode:screen"/>
      <rect x="${i}" y="${i}" width="${w-i*2}" height="${h-i*2}" rx="${RADIUS}"
            fill="${GREY}" style="filter:blur(${BLUR}px)"/>
    </svg>`;
  };

  const syncMap = () => {
    const {width, height} = glass.getBoundingClientRect();
    if (!width || !height) return;
    feImage.setAttribute('href', 'data:image/svg+xml,' + encodeURIComponent(buildMap(width, height)));
  };
  new ResizeObserver(syncMap).observe(glass);
  document.fonts?.ready.then(syncMap);
  syncMap();
</script>
```

To debug it live: temporarily set `.glass-svg{opacity:1}` to see the filter host, or
comment out the `feDisplacementMap` primitives and leave the colour matrices to inspect the
channel isolation in DevTools' filter editor.