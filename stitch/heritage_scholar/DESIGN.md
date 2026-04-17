# The Design System: Editorial Academic Excellence

## 1. Overview & Creative North Star
This design system is anchored by a Creative North Star we call **"The Scholarly Curator."** 

Moving away from the cluttered, "dashboard-heavy" look of traditional EdTech, this system treats digital space as a premium editorial canvas. It balances the high-trust authority of a Ghanaian academic institution with the fluid, effortless intelligence of modern AI. 

To achieve this, we move beyond the "standard template" look. We utilize **intentional asymmetry**, where large display typography is offset by generous whitespace, and **tonal layering**, where depth is created through shifting surface values rather than rigid lines. The result is a UI that feels "breathable," inclusive, and undeniably premium.

---

## 2. Colors & Tonal Depth
Our palette honors Ghanaian identity—Gold (`secondary`), Green (`tertiary`), and Red (`error`)—but executes them with the restraint of a high-end SaaS.

### The "No-Line" Rule
**Borders are prohibited for sectioning.** To define a new area, use a background shift. 
*   Place a `surface_container_low` section on a `surface` background. 
*   The transition between these two tones is all the boundary the eye needs. This creates a sophisticated, seamless flow.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, physical layers.
*   **Base:** `surface` (#fcf9f8).
*   **Floating Elements:** `surface_container_lowest` (#ffffff).
*   **Recessed Content:** `surface_container` (#f0eded).
*   **Nesting Example:** A study module (`surface_container_lowest`) sitting inside a sidebar (`surface_container_low`) creates natural lift without a single drop shadow.

### Signature Textures
Avoid flat backgrounds for Hero sections or Primary CTAs. Use a **Linear Gradient** from `primary` (#00366c) to `primary_container` (#004d95) at a 135-degree angle. This adds a "visual soul" and depth that feels custom-engineered.

---

## 3. Typography: The Editorial Voice
We use a dual-font strategy to balance character with legibility. **Manrope** provides a geometric, modern authority for headings, while **Inter** ensures maximum readability for dense academic texts.

*   **Display (Manrope, 3.5rem - 2.25rem):** Use for hero moments and major section headers. Use `on_surface` with tight letter spacing (-0.02em) to feel impactful.
*   **Headline & Title (Manrope/Inter, 2rem - 1rem):** Use `primary` (#00366c) for headlines to instill trust.
*   **Body (Inter, 1rem - 0.75rem):** Always use `on_surface_variant` (#434653) for long-form text to reduce eye strain.
*   **Labels (Inter, 0.75rem - 0.6875rem):** Uppercase with +0.05em tracking for a "labeled" academic feel.

---

## 4. Elevation & Depth
In this system, light is our tool for hierarchy.

*   **The Layering Principle:** Stacking `surface_container` tiers (Lowest to Highest) is the primary method of elevation.
*   **Ambient Shadows:** If an element must float (e.g., a language selector popover), use a custom shadow: `0px 12px 32px rgba(27, 27, 28, 0.06)`. Note the low opacity; it should feel like a soft glow of light, not a dark stain.
*   **Glassmorphism:** For the Top Navigation Bar or Language Selection Overlays, use:
    *   Background: `surface_bright` at 80% opacity.
    *   Backdrop-blur: `12px`.
    *   This ensures the "Ghanaian Identity" colors of the background content bleed through beautifully.
*   **Ghost Borders:** If a border is required for accessibility in forms, use `outline_variant` (#c3c6d5) at **20% opacity**.

---

## 5. Components

### Buttons
*   **Primary:** Gradient (`primary` to `primary_container`), `lg` (1rem) roundedness. No border.
*   **Secondary:** `surface_container_high` background with `on_surface` text.
*   **Tertiary:** No background. Underline only on hover.

### Language Chips (Multilingual Selection)
*   **Shape:** `full` (pill-shaped).
*   **State:** Unselected chips use `surface_container`. Selected chips use `secondary_container` (#ffbf2e) with `on_secondary_container` text to provide a "Gold" highlight that signals importance.

### Form Fields
*   **Standard:** Use `surface_container_lowest` as the input background to make it pop against `surface`.
*   **Validation:** Use `error` (#ba1a1a) for text and a 1px `error` border only during the error state.

### Cards & Lists
*   **Rule:** Forbid divider lines.
*   **Action:** Separate list items using `spacing.4` (1rem) and subtle background shifts. Cards must use `lg` (1rem) or `xl` (1.5rem) corner radius.

### Specialized AI Component: "The Insight Card"
A custom card type for AI-generated summaries. Use a `tertiary_container` (#005934) background with a "Glass" overlay. This uses the Ghanaian Green to represent "growth and intelligence."

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts. A 2/3 and 1/3 split for academic content feels more editorial than a 50/50 split.
*   **Do** utilize `spacing.16` (4rem) for top-level section padding to give the AI assistant room to "think."
*   **Do** ensure all text on `secondary_container` (Gold) passes WCAG AA contrast by using `on_secondary_container`.

### Don’t:
*   **Don’t** use pure black (#000000). Use `on_surface` (#1b1b1c) for a softer, more premium feel.
*   **Don’t** use 1px solid borders to separate the sidebar from the main chat. Use a background color change from `surface` to `surface_container_low`.
*   **Don’t** use standard "blue" for everything. Lean into the `tertiary` (Green) and `secondary` (Gold) tokens to maintain the Ghanaian identity.

---

## 7. Dark Mode Guidance
When shifting to Dark Mode, the "No-Line" rule becomes even more critical.
*   **Background:** Invert `surface` and `on_surface`. 
*   **Elevation:** In dark mode, higher elevation = lighter surface colors. 
*   **Gradients:** Maintain the `primary` gradient but reduce saturation by 10% to prevent "neon" vibrating edges on dark backgrounds.