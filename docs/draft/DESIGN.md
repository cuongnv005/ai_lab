---
name: Kinetic Enterprise
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#434653'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#737784'
  outline-variant: '#c3c6d5'
  surface-tint: '#2559bd'
  primary: '#00327d'
  on-primary: '#ffffff'
  primary-container: '#0047ab'
  on-primary-container: '#a5bdff'
  inverse-primary: '#b1c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#343739'
  on-tertiary: '#ffffff'
  tertiary-container: '#4b4e50'
  on-tertiary-container: '#bcbfc1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b1c5ff'
  on-primary-fixed: '#001946'
  on-primary-fixed-variant: '#00419e'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2.5rem
  gutter: 1.5rem
  margin-desktop: 2rem
  margin-mobile: 1rem
---

## Brand & Style
The design system is engineered for high-density information management where clarity and trust are paramount. It follows a **Corporate / Modern** aesthetic, prioritizing a balanced distribution of white space to reduce cognitive load in complex workflows. The interface evokes a sense of stability and precision through a disciplined 70/20/10 color distribution, ensuring that the primary Cobalt Blue remains a powerful signal for action rather than a source of visual fatigue. 

The style is characterized by "Functional Minimalism"—where every border, shadow, and margin exists to clarify hierarchy. Visual noise is aggressively eliminated to allow the user's data to take center stage, supported by a structural grid that feels both architectural and approachable.

## Colors
The palette is rooted in a "Cobalt Core" philosophy. 
- **Primary (#0047AB):** Used exclusively for primary calls-to-action, active states, and critical branding touchpoints. 
- **Neutral/Background (70%):** A crisp White (#FFFFFF) is the primary canvas, supported by the Tertiary off-white (#F8FAFC) for grouping sections and background fills.
- **UI Elements (20%):** Secondary grays are used for borders, icons, and de-emphasized text.
- **Accents (10%):** The Primary Cobalt is used sparingly to draw focus.
- **Semantic:** Red is reserved strictly for destructive actions (delete, error); Yellow is used for cautionary status indicators (pending, warning). No green is used; "Success" is communicated through the primary blue or neutral checkmarks to maintain the strict professional palette.

## Typography
This design system utilizes **Inter** for its exceptional legibility and systematic grit. The type hierarchy is strictly enforced to ensure that dashboards remain scannable. 
- **Headlines:** Use semi-bold weights with slight negative letter-spacing to appear more compact and authoritative.
- **Body:** Standardized at 16px for optimal readability, utilizing a neutral gray (#334155) to reduce harsh contrast against white backgrounds.
- **Labels:** Used for buttons, chips, and table headers. These employ a medium or semi-bold weight to distinguish them from standard body text.
- **Mobile:** Large headlines scale down aggressively to prevent awkward line breaks in data-heavy views.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. Navigation sidebars are fixed-width (280px), while the main content area utilizes a fluid 12-column grid.
- **Grid:** 12 columns on desktop, 8 on tablet, 4 on mobile. 
- **Gutters:** Standardized at 24px (1.5rem) to ensure elements breathe.
- **Rhythm:** An 8pt linear scale is used for all spacing. 
- **Safe Areas:** 32px padding is required for the main content container on desktop to maintain the "balanced whitespace" brand pillar. On mobile, this reduces to 16px.

## Elevation & Depth
Elevation is communicated through **Ambient Shadows** rather than heavy lines. 
- **Level 0 (Flat):** Used for the primary background canvas.
- **Level 1 (Subtle):** Low-opacity shadow (4% alpha) with a large blur radius (8px), used for standard cards and surface containers.
- **Level 2 (Active):** Used for hover states or dropdowns. Increased opacity (8% alpha) and 12px blur.
- **Borders:** When depth is not required, 1px solid borders in a light neutral gray (#E2E8F0) define boundaries.
- **Z-Index Strategy:** Modals and overlays always use a backdrop blur (8px) to maintain context without visual clutter.

## Shapes
The design system employs a **Rounded** shape language to soften the industrial feel of a management interface. 
- **Standard Elements (Buttons, Inputs):** 0.5rem (8px) corner radius.
- **Large Elements (Cards, Modals):** 1rem (16px) corner radius.
- **Small Elements (Chips, Checkboxes):** 4px radius for checkboxes; fully rounded (pill) for chips.
This consistent curvature ensures the interface feels approachable and modern while maintaining professional structure.

## Components
- **Buttons:** Primary buttons use the Cobalt Blue fill with white text. Secondary buttons use a subtle gray border with Primary Blue text. No "Success" green buttons—actionable intent is always Blue.
- **Inputs:** Focus states are indicated by a 2px Primary Cobalt ring with a 4px soft outer glow.
- **Chips/Badges:** Use a light tint of the primary or semantic color (e.g., 10% opacity blue background with 100% blue text) for a refined, modern look.
- **Data Tables:** Row hover states use the Tertiary off-white. Vertical borders are omitted; only horizontal dividers are used to emphasize horizontal reading flow.
- **Cards:** White background, Level 1 shadow, and 16px corner radius. Cards should never have a dark border unless they are in an "error" state.