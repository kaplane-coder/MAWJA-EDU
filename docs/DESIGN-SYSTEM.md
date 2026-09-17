# MAWJA Design System Documentation

## 1. Visual Philosophy
The MAWJA design language combines:
- **Apple-Level Editorial Simplicity:** Generous whitespace, razor-sharp typography scale, minimal clutter, subtle elevation borders.
- **Modern EdTech Confidence:** Structured lesson hierarchies, focus on clarity, progress indicators, and local Algerian purchasing trust (BaridiMob, CCP, DZD).
- **Zero-Ad-Hoc Styling:** All colors, spacing, borders, shadows, and radii originate exclusively from centralized CSS custom properties and Tailwind tokens.

---

## 2. Color Tokens

| Token Name | CSS Variable | Hex Equivalent (Light) | Purpose |
|---|---|---|---|
| **Primary** | `hsl(var(--primary))` | `#0A66C2` | Main brand color, interactive elements, highlights |
| **Primary Foreground** | `hsl(var(--primary-foreground))` | `#F8FAFC` | Text on primary buttons/badges |
| **Background** | `hsl(var(--background))` | `#F7F9FA` | Main platform canvas |
| **Foreground** | `hsl(var(--foreground))` | `#0F172A` | Primary typography color |
| **Surface** | `hsl(var(--surface))` | `#FFFFFF` | Cards, modals, sidebars |
| **Surface Elevated** | `hsl(var(--surface-elevated))` | `#FFFFFF` (Shadowed) | Floating elements, dropdowns |
| **Muted** | `hsl(var(--muted))` | `#F1F5F9` | Tab strips, inactive badges |
| **Muted Foreground** | `hsl(var(--muted-foreground))` | `#64748B` | Secondary descriptions, timestamps |
| **Border** | `hsl(var(--border))` | `#E2E8F0` | Structural dividers and card borders |
| **Success** | `hsl(var(--success))` | `#16A34A` | Completed progress, approved payments |
| **Warning** | `hsl(var(--warning))` | `#F59E0B` | Pending reviews, notices |
| **Error** | `hsl(var(--error))` | `#EF4444` | Validation errors, rejected proofs |
| **Info** | `hsl(var(--info))` | `#0EA5E9` | Informational callouts |

---

## 3. Typography Scale (IBM Plex Sans Arabic)

- **Display:** `text-4xl sm:text-5xl lg:text-6xl` (Hero headlines)
- **H1:** `text-3xl sm:text-4xl font-bold` (Page titles)
- **H2:** `text-2xl sm:text-3xl font-bold` (Section headers)
- **H3:** `text-xl sm:text-2xl font-semibold` (Card titles)
- **H4:** `text-lg sm:text-xl font-semibold` (Component subheadings)
- **Body Large:** `text-lg font-normal leading-relaxed`
- **Body Standard:** `text-base font-normal leading-relaxed`
- **Small:** `text-sm font-normal`
- **Caption:** `text-xs font-medium`
- **Button:** `text-sm font-semibold`

---

## 4. Radius System
- `--radius-sm`: `0.375rem` (6px) - Badges, micro chips
- `--radius-md`: `0.5rem` (8px) - Inputs, standard buttons
- `--radius-lg`: `0.75rem` (12px) - Standard cards, dialog containers
- `--radius-xl`: `1rem` (16px) - Feature modules, hero containers
- `--radius-2xl`: `1.5rem` (24px) - Large sections, banners

---

## 5. Elevation & Shadow System
- `shadow-xs`: Subtle card boundary helper
- `shadow-sm`: Base interactive elevation
- `shadow-md`: Hover card elevation & floating menus
- `shadow-lg`: Dropdowns and popovers
- `shadow-xl`: Modal dialogs and drawers
