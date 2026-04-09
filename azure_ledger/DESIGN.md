```markdown
# Design System Document: The Precision Architect

## 1. Overview & Creative North Star
**Creative North Star: The Digital Curator**
This design system moves beyond the utility of a standard PDF editor to create an environment that feels like a high-end architectural studio. It rejects the cluttered "utility-first" aesthetic in favor of **The Digital Curator**—a philosophy where the document is the hero, and the interface is a silent, sophisticated facilitator.

To break the "template" look, we employ **Intentional Asymmetry**. Instead of perfectly centered grids, we utilize generous, purposeful white space and high-contrast typography scales. By pairing the technical precision of *Inter* with the editorial elegance of *Manrope*, we signal to the user that this is not just a tool, but a professional workstation.

---

## 2. Colors & Surface Philosophy
Our palette is rooted in a technical "Deep Blue," but its application is anything but standard. We utilize tonal depth to guide the eye, rather than physical boundaries.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts. Use `surface-container-low` for secondary sections sitting on a `surface` background. If you feel the need for a line, use a `2.5 (0.5rem)` spacing gap instead.

### Surface Hierarchy & Nesting
Treat the UI as a series of layered sheets. 
- **Base Layer:** `surface` (#f8fafb).
- **Secondary Containers:** `surface-container-low` (#f2f4f5) for grouping metadata.
- **Hero/Active Cards:** `surface-container-lowest` (#ffffff) to create a natural "lift."
- **Tertiary Elements:** `surface-container-high` (#e6e8e9) for sunken utility bars or search fields.

### The Glass & Gradient Rule
To provide "visual soul," primary CTAs and floating action buttons (FABs) should not be flat. Use a subtle linear gradient from `primary` (#005bbf) to `primary_container` (#1a73e8) at a 135° angle. 
For tool overlays and bottom sheets, apply **Glassmorphism**: 
- Background: `surface` at 80% opacity.
- Backdrop Blur: 20px.
- This ensures the document remains visible beneath the tools, maintaining the user’s context.

---

## 3. Typography
We use a dual-typeface system to balance technical metadata with editorial authority.

*   **Display & Headlines (Manrope):** High-end, wide-set, and authoritative. Use `display-lg` for empty state headers and `headline-sm` for document titles to give them a "published" feel.
*   **UI & Body (Inter):** Maximum legibility for dense PDF data. Use `label-md` for metadata (file size, date modified) to maintain a clean, "tech" aesthetic.

**Hierarchy Tip:** Never use `title-lg` and `body-lg` at the same weight. If the title is Bold, the body must be Regular or Light to create the "Editorial Contrast" that defines this system.

---

## 4. Elevation & Depth
In this system, "Elevation" is a feeling, not a drop shadow.

*   **Tonal Layering:** Achieve 90% of your hierarchy by stacking `surface-container` tiers. A `surface-container-lowest` card on a `surface-container-low` background creates a sophisticated, soft lift.
*   **Ambient Shadows:** For floating elements (like the PDF editing FAB), use a shadow with a blur of `16 (3.5rem)` and an opacity of 6%. The shadow color must be a tinted version of `on-surface` (#191c1d), never pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., in Dark Mode), use `outline-variant` at **15% opacity**. A 100% opaque border is a failure of the system's elegance.

---

## 5. Components

### Buttons & Interaction
*   **Primary Button:** Gradient fill (`primary` to `primary_container`), `md` (0.75rem) rounded corners. Text is `label-md` in All Caps with 0.05rem letter spacing for a premium "label" look.
*   **Secondary/Ghost:** No container. Use `primary` text with a subtle `surface-container-highest` background only on hover/press.

### Contextual PDF Cards
*   **Style:** No borders. Use `surface-container-lowest` as the card base. 
*   **Spacing:** Use `spacing-4` (0.9rem) for internal padding. 
*   **Asymmetry:** Place document metadata (date/size) in `label-sm` aligned to the right, while the title remains left-aligned in `title-md`.

### Tool Bottom Sheets
*   **Styling:** Use the Glassmorphism rule (80% opacity + blur). 
*   **Corner Radius:** Use `xl` (1.5rem) only on the top two corners to mimic a physical folder being opened.

### Inputs & Annotation Tools
*   **Input Fields:** Forbid the "box" look. Use a `surface-container-high` background with a `md` (0.75rem) bottom-only radius.
*   **Selection Chips:** Use `secondary_container` with `primary` text. Avoid outlines; the color fill change is the state indicator.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Overlapping Elements:** Let the PDF page slightly "peek" out from under the bottom sheet tools to create depth.
*   **Embrace Large Type:** Use `display-sm` for total file counts or storage metrics to make data feel like art.
*   **Prioritize Negative Space:** If a screen feels crowded, increase the spacing to `8` or `10` before adding a divider.

### Don’t:
*   **Don't use Divider Lines:** If you think you need a line to separate two list items, use a `surface-variant` background shift instead.
*   **Don't use pure Black (#000000):** Even in Dark Mode, use `inverse_surface` to keep the "Ink and Paper" feel.
*   **Don't use Standard Shadows:** Never use the default shadow settings of your design tool. Always increase the blur and decrease the opacity to maintain the "Ambient Light" philosophy.