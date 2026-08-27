# Asset Manifest — Upsarpanch Chai (गुड़ की चाय)

Built around the real menu: jaggery (gud) chai, 6 tea varieties, and tapri-style
snacks. The site runs **right now** with warm-white placeholder panels
wherever a video/image is missing — nothing breaks. Drop a real file in with
the **exact filename** below and it swaps in automatically on next reload.

Logo: save the attached logo as `assets/images/logo.png`.

Brand voice for every generation: **high-key daylight, off-white background,
warm amber/saffron light, no embedded text, no cartoon/illustration style —
real photographic realism.**

---

## Videos → `assets/video/`

**5 of 7 are in and confirmed loading.** They're all vertical 1080×1920
(reel-format) clips, used as full-bleed backgrounds with `object-fit: cover`
— on wide desktop viewports that crops the sides, which is expected until
16:9 cuts exist. Still needed: `chai-lineup.mp4` and `finale-counter-spread.mp4`.

| Filename | Status | Used in | Prompt |
|---|---|---|---|
| `hero-chai-pour.mp4` | ✅ received | Hero background | *(kulhad on tapri counter, brass kettles behind, chai pouring in — matched as-is)* |
| `chai-pour-macro.mp4` | ✅ received | Our Chai split panel | *(steaming kulhad macro, foam bubbles, wooden table — matched as-is)* |
| `chai-lineup.mp4` | ⬜ needed | Pinned scrub — Pick Your Chai | *"Overhead flat-lay: six drinks — plain tea, kulhad clay-cup tea, lemon tea, green tea, black tea, filter coffee — flying into frame one by one and arranging neatly in a row on a rustic wooden tray, bright daylight studio background, stop-motion assembly feel, camera locked-off, no text"* |
| `exploded-snacks.mp4` | ✅ received | Pinned scrub — Snacks, Elevated | *(floating cream roll, potato/paneer rolls, steaming maggi bowl on gradient — matched as-is)* |
| `jaggery-macro.mp4` | ✅ received | Gud spotlight panel | *(knife shaving a raw jaggery block, macro — matched as-is)* |
| `comfort-food.mp4` | ✅ received | Comfort Food split | *(split shot: butter-on-bun ↔ masala maggi bowl — matched as-is)* |
| `finale-counter-spread.mp4` | ⬜ needed | Finale/CTA background | *"Slow overhead pull-back revealing a full Indian tea-stall counter spread — kulhad chai, cream rolls, patties, a plate of maggi — warm golden-hour daylight, cinematic gentle camera drift, no text"* |

### Ready-to-paste prompt for the two still-missing clips

```
CHAI LINE-UP — Overhead flat-lay shot: six Indian tea-stall drinks — plain
milk tea, tea in a clay kulhad cup, lemon tea, green tea, black tea, and
filter coffee — flying into frame one at a time and settling into a neat
row on a rustic wooden tray, bright high-key daylight studio background,
stop-motion assembly feel, locked-off camera, ultra-realistic, 4K, no
on-screen text, no visible human faces, 8-10 seconds.
```

```
FINALE SPREAD — Slow overhead pull-back camera move revealing a full Indian
tea-stall counter spread: steaming kulhad chai, cream rolls, aloo and
paneer patties, a bowl of masala maggi, warm golden-hour daylight,
cinematic gentle drift, ultra-realistic, 4K, no on-screen text, no visible
human faces, loopable, 8-10 seconds.
```

### Ready-to-paste prompt for "another platform" (hero video)

Use this on Runway / Pika / Kling / Luma / Sora or similar text-to-video tools:

```
A rustic Indian tea stall (chai tapri) counter in warm golden-hour daylight.
Close-up, slow-motion shot of hot masala chai being poured from a height into
a traditional clay kulhad cup, thick steam rising and catching the light,
milky-brown liquid with a light foam, shallow depth of field, soft warm amber
and saffron tones, cinematic food commercial style, ultra-realistic, 4K,
smooth camera hold (no shake), no on-screen text, no visible human faces,
loopable seamless motion, 8-10 seconds.
```

Swap "kulhad cup" → "glass tumbler" and "masala chai" → "filter coffee" for a
second variant to use as `chai-pour-macro.mp4`.

---

## Images → `assets/images/`

**All 8 are in.** 7 sourced from Pexels (free license, no attribution
required) since the media-generation account has 0 credits; `logo.png` is
cropped straight from your real menu poster (mascot mark isolated, cream
background keyed to transparent via canvas chroma-key).

| Filename | Status | Used in | Pexels photo |
|---|---|---|---|
| `logo.png` | ✅ mascot-only crop for the small nav badge | Nav brand mark | — |
| `logo-full.webp` | ✅ your master file, used exactly as provided (genuinely transparent, no processing) | Hero badge + footer | — |
| `img-cream-roll.jpg` | ✅ | Gud spotlight gallery | [27126831](https://www.pexels.com/photo/27126831/) |
| `img-nankhatai.jpg` | ✅ (bright cookie/toast scene — closest daylight match; swap for a literal nankhatai shot if you find one) | Gud spotlight gallery | [16450180](https://www.pexels.com/photo/16450180/) |
| `img-makkhan-toast.jpg` | ✅ | Gud spotlight gallery | [14043698](https://www.pexels.com/photo/14043698/) |
| `img-jaggery-blocks.jpg` | ✅ | Gud spotlight + texture gallery | [3947885](https://www.pexels.com/photo/3947885/) |
| `img-kulhad-cups.jpg` | ✅ | Texture gallery | [10377676](https://www.pexels.com/photo/10377676/) |
| `img-spices-flatlay.jpg` | ✅ | Texture gallery | [28411491](https://www.pexels.com/photo/28411491/) |
| `img-tea-leaves.jpg` | ✅ | Texture gallery | [6870854](https://www.pexels.com/photo/6870854/) |
| `img-cutting-chai.jpg` | ✅ | Texture gallery | [34324342](https://www.pexels.com/photo/34324342/) |

If Nano Banana / Higgsfield credits get topped up later, regenerate any of
these with: *"Editorial food photograph of [item], shot from a 45-degree
angle on a rustic wooden surface, high-key daylight, off-white/cream
background, warm natural light, shallow depth of field, no text, no logos"*.

---

## Notes

- All `<video>` tags are `muted` (required for autoplay).
- `chai-lineup.mp4` and `exploded-snacks.mp4` are **scrubbed**, not played —
  export as a clean, locked-off sequence so `currentTime` scrubbing looks
  intentional forward (assemble) and backward (scatter/explode).
- Keep hero + finale videos reasonably compressed (H.264, ~6–10 Mbps) — full
  viewport backgrounds are the heaviest downloads on the page.
- Ask the assistant to run the Higgsfield generation + auto-download step
  once the connected account has credits — same prompts, no extra work.
