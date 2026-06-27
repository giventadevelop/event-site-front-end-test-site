# Hero Section Image Resize – AI Image Editor Prompt

Use this prompt with your AI image editor to resize hero images so they fit the section without letterboxing, cropping important content, or losing quality.

---

## For **Section 1 (Left Panel)** – Kerala / MALAYALEES.US banner

*Use when the image is the tall portrait banner: tropical backwaters, vertical “MALAYALEES.US” text, yellow “malayalees Friends” circular logo, palm trees, US flag elements.*

**Copy-paste prompt (reduce height + add top/bottom padding in the image):**

```
Resize this image for a website hero section (left panel) by REDUCING its height and ADDING padding to the top and bottom inside the image itself, so the banner content fits the frame without being cropped.

TARGET SPECS:
- Final output aspect ratio: 5:6 (portrait) — width : height = 5 : 6
- Output dimensions: 1000 × 1200 pixels (or 1200 × 1440 for high-DPI/retina)
- Format: Same as source (e.g. PNG or JPEG), high quality (min. 90% or equivalent)

REQUIREMENTS:
1. REDUCE THE HEIGHT of the visual content: scale down the main banner (tropical scene, "MALAYALEES.US" text, yellow logo, palms, water, US flag) so it occupies less vertical space — do not crop any of this content; only make it smaller vertically so it fits in a shorter canvas.
2. ADD PADDING TO THE TOP AND BOTTOM: extend the canvas to the full 5:6 output size and fill the new top and bottom areas with padding. Use one of these:
   - Soft gradient (e.g. dark blue/purple or a muted tone that matches the image) so it blends with the hero background, or
   - A solid color that matches the darkest part of the image (e.g. deep blue or purple), or
   - Gentle extension of the sky at the top and the water reflection at the bottom so the padding looks natural.
   The padding should be roughly equal above and below so the main content is centered vertically.
3. PRESERVE ALL CONTENT: the full vertical "MALAYALEES.US" text, the yellow circular logo (palm frond + "malayalees Friends"), the US flag elements, palm trees, water, and tropical scene must remain fully visible and legible — only scaled down, never cropped.
4. Keep colors, contrast, and sharpness of the main content at original quality. The added padding areas can be soft or solid but must look intentional and clean.
5. Final image must be exactly 5:6 aspect ratio with the banner content centered and padding at top and bottom, so when displayed with object-cover or object-contain in the hero section, nothing is cut off and the image fits the frame.
```

---

## For **Section 2 (Right Panel)** – “THIS IS KERALA” / group photo

*Use when the image is the wider scene: people in traditional dress, Kathakali performer, “THIS IS KERALA” text, US flags, houseboat, Malayalees.US logo.*

**Copy-paste prompt:**

```
Resize this image for a website hero section (right panel) so it fills the frame with no empty bands at the top or bottom and no important content cut off.

TARGET SPECS:
- Aspect ratio: 2:1 (landscape) — width : height = 2 : 1
- Output dimensions: 1920 × 960 pixels (or 2400 × 1200 for high-DPI/retina)
- Format: Same as source (e.g. PNG or JPEG), high quality (min. 90% or equivalent)

REQUIREMENTS:
- Do not crop out or obscure: the "THIS IS KERALA" text, the "MALAYALEES.US" logo, the Kathakali performer, the group of people (adults and children in traditional dress), the US flags, the houseboat (Kettuvallam), or the sky and autumn trees.
- Preserve all text and logos at full legibility.
- Reframe or scale the image so it fits exactly the 2:1 ratio; avoid letterboxing. Prefer intelligent crop or content-aware resize so the main scene (people, dancer, flags, houseboat) remains fully visible and centered.
- Keep colors, contrast, and sharpness at original quality — no compression artifacts or blur.
- Output must be exactly 2:1 aspect ratio so it fills the hero right panel with no empty space at top or bottom when displayed with object-contain.
```

---

## Why these ratios

- **Section 1 (left):** The left panel is about 32% of the viewport width and shares the hero row height, which gives a portrait shape. **5:6** matches that so the image fills the panel with `object-contain` and no side gaps.
- **Section 2 (right):** The right panel is about 68% width by the same row height, so it’s landscape. **2:1** matches that so the image fills with `object-contain` and no top/bottom letterboxing.

After resizing, replace the image file in the project and, if needed, switch the hero back to `object-contain` for that panel so the full image is shown with no cropping and no empty space.
