# Design System: Dynamic QR Platform

## 1. Core Philosophy
* **Aesthetic:** Precision Digital, Engineered UI, Machinist Blueprint.
* **Vibe:** Technical, high-contrast, terminal-inspired, but highly polished. 
* **Focus:** Data legibility, frictionless QR code generation, and stark visual hierarchy.
* **Mode:** Dark Mode default (optimized for glowing accents and stark white QR matrices).

---

## 2. Typography
Use a geometric, highly legible sans-serif for the interface, paired strictly with a monospaced font for all technical data (scan counts, IDs, short links).

* **Primary UI Font:** Geist, Inter, or Roboto.
* **Technical Font:** Geist Mono, JetBrains Mono, or SF Mono.

### Type Scale
* **Display / Hero (H1):** 48px, Bold, tracking -0.04em, leading 1.1.
* **Section Headers (H2):** 24px, Semi-Bold, tracking -0.02em, leading 1.2.
* **Body Primary:** 14px, Regular, leading 1.5. (Used for general UI).
* **Body Secondary:** 12px, Regular, color muted. (Used for helper text).
* **Technical Data (Mono):** 13px, Medium, tracking 0em. (Used for QR IDs, URLs, timestamps).

---

## 3. Color System
The palette relies on absolute blacks and grays to let the QR code and data visualizations pop. Accents should look like a glowing terminal.

### Backgrounds
* **App Background:** `#000000` (Absolute Black)
* **Surface/Card:** `#0A0A0A` (Very Dark Gray)
* **Surface Hover:** `#121212`
* **Subtle Borders/Dividers:** `#1F1F1F`

### Text
* **Primary Text:** `#EDEDED` (Off-white to reduce eye strain against black)
* **Secondary Text:** `#A1A1AA` (Zinc 400)
* **Disabled Text:** `#52525B` (Zinc 600)

### Accents & Action
* **Primary Accent (Voltage Lime):** `#CCFF00` (Used sparingly for active states, main CTA, and scan chart peaks)
* **Success:** `#2ECA45`
* **Destructive/Error:** `#EF4444`

---

## 4. Spacing & Grid Structure
Strict adherence to an 8px baseline grid system. Zero fluff, high density.

* **Base Unit:** 8px
* **Micro Spacing:** 4px (Icon to text)
* **Component Padding:** 16px (Standard button, small card)
* **Section Spacing:** 48px (Between dashboard widgets)
* **Border Radius:** `6px` for all interactive elements (buttons, inputs). `12px` for large containers/cards. Do not use fully pill-shaped (rounded) corners.

---

## 5. Core Components

### The QR Code Display Frame
* **Container:** Must sit within a pristine white `#FFFFFF` container with a minimum 16px "quiet zone" (padding) around the matrix.
* **Frame Style:** Subtle 1px solid border `#1F1F1F` around the outer display card.
* **Shadows:** No soft drop shadows. Use a harsh 1px inner glow or 0px blur hard shadow if depth is needed.

### Buttons
* **Primary CTA:** Background `#EDEDED`, Text `#000000`. Font weight: Medium.
* **Secondary:** Background transparent, Border 1px solid `#1F1F1F`, Text `#EDEDED`.
* **Hover States:** Instead of changing colors, apply a subtle brightness increase or a 1px border color change to the Primary Accent (`#CCFF00`).

### Inputs & Forms (Link Generators)
* **Background:** `#0A0A0A`
* **Border:** 1px solid `#1F1F1F`
* **Focus State:** 1px solid `#CCFF00`, 0px outline.
* **Text:** 14px, Secondary Text color until focused, then Primary Text color.

### Data Tables & Scan Analytics
* **Row Borders:** 1px solid `#1F1F1F` on the bottom only. No vertical dividers.
* **Numbers/Metrics:** Always use the Technical Font (Monospace) to ensure numbers align perfectly in columns.

---

## 6. Motion & Interaction
Animations should feel instant, engineered, and snappy. Do not use slow, bouncy easings.

* **Durations:** Fast (100ms - 150ms).
* **Easing:** `ease-out` for incoming elements, `ease-in` for outgoing. 
* **Hover Effects:** Instant opacity shifts or sharp border illuminations.

---

## 7. Accessibility (WCAG Rules)
* Ensure contrast ratio of at least 4.5:1 for all readable text against background surfaces.
* Ensure contrast ratio of the QR Code matrix (black blocks) against its white quiet zone is maximum (21:1) to guarantee physical scanning across all devices and lighting conditions.