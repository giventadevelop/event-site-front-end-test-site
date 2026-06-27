# Home Page Event Strip – Card Image Spec & Admin Infotip

## Where this image appears

- **Location**: Home page → **Live Events** and **Featured Events** sections → left column of each event card.
- **DOM (for reference)**: First card ≈ `main > section > div > div[2] > div[1] > div > div[1]`; second card ≈ `... div[2] > div > div[1]` (left column = image container).

The image is the **only content in the left column** of the 70/30 card; the right column has title, date/time/location, and action buttons.

---

## Display behavior (responsive)

| Breakpoint   | Container size (approx.) | Behavior |
|-------------|---------------------------|----------|
| **Mobile**  | Full width × **192px**    | Full-width strip; image fills area, cropped to fit (object-cover). |
| **Desktop (md+)** | **70%** of content width × **200px** | Fixed 200px height; image fills and is cropped to fit (object-cover). |

- **Layout**: Left column = 70% width (desktop), 100% (mobile). Height is fixed (200px desktop, 192px mobile).
- **Image fit**: `object-cover` — image **fills the container**; sides or top/bottom may be cropped depending on aspect ratio.
- **Overlays (Featured only)**: “Featured Event” badge at **top-left**; optional “Buy Tickets” / “Donate” CTA at **bottom-right**. Keep important content out of those corners.

---

## Recommended image spec (fits and stays responsive)

### Dimensions and aspect ratio

- **Recommended aspect ratio**: **Landscape 4∶1 to 2∶1** (e.g. 1200×300 to 1200×600).
  - Desktop slot is ~806×200px (≈4∶1); mobile is variable width × 192px (≈2∶1 on typical phones). Landscape avoids heavy letterboxing and keeps the frame filled.
- **Minimum recommended size**: **1200×400px** (3∶1).
- **Comfortable size**: **1200×600px** (2∶1) or **1600×400px** (4∶1).
- **Retina**: For sharp display on high-DPI screens, use at least **2400px** on the long side (e.g. 2400×600 or 2400×800).

### Format and quality

- **Format**: WebP (preferred) or JPEG.
- **File size**: Under **300 KB** for fast loading.
- **Quality**: 80–85% (JPEG) or equivalent for WebP.

### Content and composition

- **Subject**: Event photo, flyer, or promotional graphic (one event per image).
- **Safe zone**: Keep important subjects and text in the **center 60%** of the image; **top-left** and **bottom-right** can be covered by overlays on Featured cards.
- **Contrast**: Image sits beside a light (white/slate) panel; avoid a single flat dark strip so the card doesn’t look unbalanced.
- **Text in image**: If the image includes text (event name, date), make it large and high-contrast so it stays readable when scaled down on small screens.

---

## Admin infotip (short text for image upload)

Use the following (or a shortened version) **above the image upload** in the admin “event media” or “card image” section:

---

**Suggested infotip (full):**

> **Event strip card image**  
> Used on the home page in the Live and Featured event strips (left side of each card).  
> **Best results:** Landscape image, **1200×600px** or **1600×400px** (2∶1 or 4∶1). Min **1200×400px**. WebP or JPEG, under 300 KB.  
> Image fills the slot and may be cropped (center is safest). On Featured cards, the top-left and bottom-right corners may be covered by badges/buttons.

---

**Short infotip (when space is limited):**

> **Home event strip:** Use a **landscape** image (e.g. 1200×600px). Center important content; corners may be cropped or covered by overlays.

---

## Summary table (for quick reference)

| Item            | Value |
|-----------------|--------|
| **Placement**   | Home page → Live / Featured event strips → left column of card |
| **Display size (desktop)** | ~70% width × 200px height |
| **Display size (mobile)**  | Full width × 192px height |
| **Fit**         | object-cover (fill; may crop) |
| **Aspect**      | Landscape 4∶1 to 2∶1 |
| **Min size**    | 1200×400px |
| **Recommended** | 1200×600px or 1600×400px; &lt; 300 KB; WebP or JPEG |
| **Safe zone**   | Center 60%; avoid critical content in top-left and bottom-right (overlays on Featured) |

This spec and the infotip text can be reused in the admin UI and in any internal docs for event media or homepage content.
