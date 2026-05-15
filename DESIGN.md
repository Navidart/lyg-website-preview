# DESIGN.md

## Purpose

This file defines the design rules for the LYG Front Facing Website.

It helps AI coding agents preserve the existing LYG design system instead of guessing new colors, typography, spacing, radius, or component styles.

This document should protect the current design direction.

Do not use this file to introduce a new design system.
Do not copy rules from external websites or third-party design systems.
Do not replace existing tokens with hardcoded values.

---

## Design Token Location

Design tokens live in the project root under:

```txt
/design-tokens/
├── LYG.tokens.json
├── primitives.tokens.json
├── textStyles.json
├── image.tokens.json
├── Dark.tokens.json
├── Light.tokens.json
├── Desktop.tokens.json
├── Mobile.tokens.json
└── Tablet.tokens.json
```

Use these files as the source of truth for visual decisions.

Do not paste token JSON into components.
Do not duplicate token values manually.
Do not create a second token system in code.

---

## Source of Truth Order

When editing UI, follow this priority:

1. Existing implemented components
2. Existing page/section patterns
3. Figma tokens in `/design-tokens/`
4. This `DESIGN.md`
5. Reasonable fallback based on nearby UI

If there is a conflict, preserve the existing implementation and ask before changing the design direction.

---

## Design Direction

The LYG website should feel:

- premium
- calm
- maritime-aware
- editorial
- trustworthy
- structured
- enterprise-grade

The visual style should be refined and confident, not decorative or noisy.

Avoid:

- playful SaaS styling
- loud gradients
- random bright colors
- excessive shadows
- over-rounded UI
- generic startup visuals
- unnecessary animations
- inconsistent form styles

---

## Token Usage Rules

Always prefer semantic tokens over primitive tokens.

Preferred examples:

```css
var(--color-surface-default)
var(--color-text-primary)
var(--color-border-default)
var(--color-bg-brand-primary-default)
```

Avoid using primitive or raw color values directly unless no semantic token exists:

```css
var(--color-cobalis-600)
var(--brand-color-primary-600)
#346875
#0F172A
#FFFFFF
```

Hardcoded values should only be used when no token exists and the decision is intentional.

---

## Brand Color Rules

The primary LYG brand direction is based on the Cobalis color family.

Use brand colors through semantic tokens whenever possible.

Primary brand colors are suitable for:

- primary buttons
- active states
- selected states
- key brand moments
- limited emphasis areas

Do not overuse brand color for every heading, icon, or surface.

The secondary brand direction is based on the Verdan color family.

Use secondary colors sparingly for supporting UI and secondary emphasis.

---

## Semantic Color Rules

Use semantic color groups for interface decisions:

- `color/surface`
- `color/text`
- `color/icon`
- `color/border`
- `color/bg`
- `color/focus`

Use light and dark mode tokens correctly.

Do not manually invert colors.
Do not create one-off dark mode colors.
Do not use primitive colors when semantic colors exist.

---

## Light and Dark Mode

Use:

- `Light.tokens.json` for light mode semantic values
- `Dark.tokens.json` for dark mode semantic values

Light mode should generally use:

- light surfaces
- dark text
- subtle borders
- controlled brand emphasis

Dark mode should generally use:

- dark surfaces
- light text
- restrained borders
- non-glowing brand emphasis

Do not manually create theme overrides in components unless the existing architecture requires it.

---

## Surface Rules

Use surface tokens for layout backgrounds.

Common surface roles:

- Page/canvas background
- Default content surface
- Subtle background
- Muted/disabled background
- Overlay
- Inverse surface

Avoid using brand colors as large backgrounds unless the section is intentionally branded.

---

## Text Color Rules

Use text tokens by hierarchy.

Common usage:

- Main headings: primary text
- Paragraphs: secondary text
- Metadata/helper text: tertiary text
- Disabled content: disabled text
- Brand emphasis: brand text
- Links: link text

Do not use muted text for important content.
Do not use brand color for every heading.
Do not hardcode text colors.

---

## Icon Color Rules

Icons should follow the same hierarchy as text.

Use icon tokens for:

- default icons
- subtle icons
- brand icons
- success/warning/error states
- disabled icons

Avoid decorative icon colors unless part of a specific designed section.

---

## Border Rules

Use border tokens consistently.

Common usage:

- Standard border: default border token
- Light divider: subtle border token
- Strong divider: strong border token
- Disabled border: disabled border token
- Focus/active brand border: brand border token

Avoid random opacity values.
Avoid mixing many border colors inside one component family.

---

## Focus Rules

Use focus tokens for accessible focus states.

Focus states should be:

- visible
- calm
- consistent
- accessible

Never remove focus states.

Do not replace focus styles with only color changes unless accessibility is preserved.

---

## Typography System

Use the exported styles in:

```txt
/design-tokens/textStyles.json
```

Font roles:

- Display and title: `PT Serif`
- Body copy: `Open Sans`
- UI, controls, labels, menus, tables: `Inter`
- Code: `JetBrains Mono`

Use typography by role, not by visual guesswork.

Do not create random font sizes.
Do not replace the font families.
Do not use body styles for buttons or controls.

---

## Typography Roles

### Display

Use display styles for large marketing and hero moments only.

Available roles:

- `Typography/Display/LG`
- `Typography/Display/MD`
- `Typography/Display/SM`

Do not use display styles inside dense admin UI.

---

### Titles

Use title styles for page and section hierarchy.

Available roles:

- `Typography/Title/Page`
- `Typography/Title/Section`
- `Typography/Title/Panel`

Usage:

- Page title: main page heading
- Section title: major page block heading
- Panel title: card, panel, or grouped content heading

Do not create one-off heading sizes.

---

### Subtitles

Use subtitle styles for supporting text under titles.

Available roles:

- `Typography/Subtitle/Page`
- `Typography/Subtitle/Section`
- `Typography/Subtitle/Panel`

Subtitles should clarify the title, not repeat it.

---

### Body

Use body styles for readable content.

Available roles:

- `Typography/Body/LG`
- `Typography/Body/MD`
- `Typography/Body/SM`
- `Typography/Body/LG Strong`
- `Typography/Body/MD Strong`
- `Typography/Body/SM Strong`

Default body copy should usually use body MD.

---

### Controls and Buttons

Use Inter-based control styles for UI elements.

Controls:

- `Typography/Control/LG`
- `Typography/Control/MD`
- `Typography/Control/SM`

Buttons:

- `Typography/Button/LG`
- `Typography/Button/MD`
- `Typography/Button/SM`

Button text should follow the exported button text style, including uppercase behavior and letter spacing.

Do not use body text styles for buttons.

---

### Labels, Menus, Tables, Utility

Use specific typography roles for specific UI needs.

Labels:

- `Typography/Label/LG`
- `Typography/Label/MD`
- `Typography/Label/SM`

Menus:

- `Typography/Menu/Default`
- `Typography/Menu/Sub Menu`

Tables:

- `Typography/Table/Header`
- `Typography/Table/Cell`
- `Typography/Table/Caption`

Utility:

- `Typography/Utility/Caption`
- `Typography/Utility/Caption Strong`
- `Typography/Utility/Helper`
- `Typography/Utility/Helper Strong`
- `Typography/Utility/Overline`
- `Typography/Utility/Code`

Do not replace these with generic body styles unless no specific role exists.

---

## Responsive Typography

Use responsive token files:

- `Desktop.tokens.json`
- `Tablet.tokens.json`
- `Mobile.tokens.json`

Do not manually guess mobile font sizes.

Important responsive behavior:

- Display text should reduce on tablet and mobile.
- Body text should remain readable.
- Line height should follow responsive typography tokens.
- Hero headings should not feel oversized on mobile.
- Admin UI should prioritize readability and compact scanning.

---

## Layout Rules

Use layout sizing tokens and existing page patterns.

Common layout roles:

- max container
- content width
- narrow content width
- wide content width
- page inset
- container inset
- section spacing

Avoid:

- full-width text blocks unless intentionally editorial
- fixed widths that break mobile
- random max-width values
- horizontal overflow
- cramped mobile layouts

---

## Spacing System

Use spacing tokens from the responsive token files.

Spacing roles include:

- page inset
- container inset
- section inset
- card inset
- panel inset
- dialog inset
- drawer inset
- popover inset
- stack gap
- form gap
- form-section gap
- list-item gap
- inline gap
- toolbar gap
- button gap
- control gap

Do not create random spacing values.

When spacing is unclear, reuse the closest existing component pattern.

---

## Common Spacing Rules

Use:

- section spacing for large page blocks
- container spacing for page wrappers
- card spacing for cards
- panel spacing for panels
- form spacing for form groups
- inline spacing for icons and text
- toolbar spacing for action rows

Avoid:

- mixing many gap values inside one component
- manually adding margins when layout gap exists
- inconsistent vertical rhythm
- cramped mobile layouts
- excessive empty space

Inputs and select controls should use consistent internal padding, height, and icon spacing so they feel like one unified control system.

---

## Radius Rules

Use radius tokens.

Common radius roles:

- control radius for buttons, inputs, selects
- surface radius for cards and standard surfaces
- container radius for larger containers
- dialog radius for modals/dialogs
- full radius for pills, avatars, badges

Avoid:

- random radius values
- over-rounded SaaS-style cards
- mixing sharp and rounded corners in the same section
- creating new radius values in component files

---

## Elevation Rules

Use elevation tokens only where hierarchy requires it.

Use elevation for:

- popovers
- dialogs
- menus
- floating panels
- important overlays

Avoid heavy shadows on standard cards.

The LYG website should feel premium and calm, not shadow-heavy.

---

## Image Ratio Rules

Use image ratio tokens from:

```txt
/design-tokens/image.tokens.json
```

Available image ratio roles:

- Square: `1/1`
- Landscape small: `4/3`
- Landscape medium: `3/2`
- Wide: `16/9`
- Banner: `21/9`
- Portrait small: `4/5`
- Portrait medium: `3/4`
- Portrait large: `2/3`
- Poster: `9/16`

Use consistent ratios within the same content grid.

Do not mix random image ratios in card lists unless the layout intentionally supports it.

---

## Button Rules

Use existing button components and tokenized styles.

Button types:

- Primary
- Secondary
- Ghost
- Text/link
- Destructive

Primary buttons:

- use for the main action only
- use brand primary background tokens
- use correct on-brand text tokens
- should not be repeated multiple times in the same action group

Secondary buttons:

- use for supporting actions
- should not visually compete with primary buttons

Ghost/text buttons:

- use for low-emphasis actions

Destructive buttons:

- use only for delete, remove, or destructive actions
- use destructive semantic tokens

Do not invent new button heights, colors, or radius values.

---

## Button Sizing

Use tokenized spacing and sizing.

Button spacing roles:

- compact button spacing
- default button spacing
- large button spacing only where supported by the existing design

Do not manually create one-off button padding.

Button labels should use the correct button typography token.

---

## Form Controls

Input and dropdown components are not fully finalized yet.

Until formal components are created, use these rules:

- use control height from sizing tokens
- use control inset from spacing tokens
- use control radius from radius tokens
- use label typography for labels
- use control typography for input/dropdown text
- use helper typography for helper text
- use border tokens for borders
- use focus tokens for focus states
- use semantic surface/text tokens for backgrounds and text

Text inputs, selects, dropdowns, search fields, and textareas should feel like one family.

Do not create separate visual systems for each form control.

---

## Form Layout Rules

For forms:

- keep labels clear
- keep helper text short
- keep error messages specific
- use consistent field width
- use consistent field height
- align buttons beside inputs only when there is enough horizontal space
- stack fields and buttons on mobile
- keep admin forms compact and functional

For add-category style interactions:

- use a standard input width
- use standard input height
- place the action button beside the input on desktop
- stack input and button on mobile if needed
- preserve existing behavior unless asked to change it

## Input and Select Component Direction

Inputs, selects, dropdowns, and search fields should belong to one consistent form-control family.

Use the same visual foundation for:

- text input
- textarea
- select
- dropdown trigger
- search input
- date input
- number input

Default form controls should use:

- semantic surface token for background
- semantic text token for input text
- semantic placeholder/muted text token for placeholder
- semantic border token for border
- semantic focus token for focus ring
- control radius token
- control spacing token
- control typography token

Do not create separate visual styles for inputs and selects.

### Standard States

Every input/select should support these states:

- default
- hover
- focus
- disabled
- error
- success, only when validation requires it

### Default State

Use:

- background: surface/default or nearest existing surface token
- text: text/primary
- placeholder: text/tertiary or muted equivalent
- border: border/default

### Hover State

Hover should be subtle.

Use the existing hover border/surface token if available.

Do not make hover states visually loud.

### Focus State

Focus should use the project focus tokens.

Use:

- focus ring token
- focus ring offset token where applicable
- brand border only if already used by nearby form controls

Never remove visible focus states.

### Disabled State

Disabled controls should look inactive but readable.

Use:

- disabled surface token
- disabled text token
- disabled border token
- not-allowed cursor where applicable

### Error State

Use error/destructive semantic tokens only for real validation errors.

Do not use red/destructive styling for warnings.

Error text should use utility/helper typography.

### Select / Dropdown Rules

Select and dropdown triggers should match input height, radius, border, typography, and spacing.

The dropdown menu should use:

- surface token
- border token
- menu typography
- menu item spacing
- subtle hover state

Do not create custom dropdown styling that feels disconnected from inputs.

### Form Layout

Labels should sit above fields unless the existing UI pattern uses another layout.

Helper text appears below the field.

Error text replaces or sits near helper text depending on the existing pattern.

On desktop, inline field + button layouts are allowed when space supports it.

On mobile, fields and buttons should stack cleanly.

---

## Dropdown Rules

Dropdowns should visually align with inputs.

Use:

- same height as input controls
- same radius as controls
- same border rules
- same focus rules
- same control typography
- same surface/text tokens

Avoid:

- custom dropdown styling that feels disconnected
- inconsistent menu width
- inconsistent dropdown item spacing
- hidden focus states

---

## Card Rules

Cards should feel calm, structured, and premium.

Use:

- surface token for background
- border token for outline
- surface/container radius token
- consistent padding
- clear heading/body hierarchy
- restrained elevation only when necessary

Avoid:

- too many card variants
- heavy shadows
- random borders
- inconsistent card padding
- random title sizes
- decorative card styles without purpose

---

## Section Rules

Sections should have clear hierarchy.

A section should usually include:

- optional eyebrow/overline
- section title
- supporting subtitle or body text
- content grid/list
- optional action

Use existing section spacing and container widths.

Do not redesign a section globally when only a small fix is requested.

---

## Content and News Sections

For news/content sections:

- use consistent card layout
- preserve category/date/status hierarchy
- use image ratios consistently
- do not hide content unless there is a clear data rule
- do not assume a visual issue before checking logic

If added content is not showing, check:

1. source data
2. publish/status field
3. visibility flag
4. display limit
5. sorting
6. pagination
7. frontend rendering condition

---

## Admin / CMS UI Rules

Admin and content management UI should be:

- clear
- compact
- predictable
- consistent
- easy to scan

Use:

- standard input height
- consistent table/cell spacing
- clear labels
- clear empty states
- predictable action placement
- compact controls

Avoid:

- unnecessary modals
- unclear action labels
- random field widths
- inconsistent button placement
- mixing inline edit and modal edit patterns without reason

---

## Tables

Use table typography tokens.

- Header: `Typography/Table/Header`
- Cell: `Typography/Table/Cell`
- Caption: `Typography/Table/Caption`

Use table spacing tokens for header and cell padding.

Table actions should be compact.

Avoid oversized table text.

Use sentence case in rows unless grammar or proper nouns require capitalization.

---

## Table / Grid Action Icons

Action icons in admin tables/grids use a standard 16px visual size unless explicitly overridden.

Examples:

- edit
- delete
- block/ban
- view
- status
- provider icons
- message actions

Rules:

- Keep icon sizing visually consistent across all admin tables.
- Maintain accessible click/tap targets even when the visible icon is 16px.
- Keep spacing between action icons compact and consistent.
- Use existing icon tokens/components when available.
- Action icons in admin tables should include concise tooltips when the meaning may not be obvious.
- Avoid mixing random icon sizes inside the same table.

Preferred behavior:

- visual icon size: 16px
- compact action groups
- vertically centered alignment

---

## Menus and Navigation

Use menu typography tokens.

- Main menu: `Typography/Menu/Default`
- Sub menu: `Typography/Menu/Sub Menu`

Use menu spacing tokens.

Avoid mixing menu text with body text styles.

Navigation should feel calm, editorial, and uncluttered.

---

## Status and Feedback

Use semantic status tokens.

Status categories may include:

- success
- warning
- destructive/error
- info
- neutral

Do not rely on color alone for status.

Use label, icon, helper text, or clear copy where needed.

---

## Motion Rules

Use motion only when it improves clarity.

Preferred motion:

- subtle fade
- slight translate
- smooth reveal
- short transition

Avoid:

- heavy parallax
- constant movement
- bouncing effects
- excessive hover animation
- animation that distracts from reading

Motion should support clarity, not decoration.

---

## Accessibility Rules

Preserve accessibility.

Use:

- semantic HTML
- readable contrast
- visible focus states
- connected labels and inputs
- descriptive alt text
- clear button names
- keyboard-accessible controls

Do not remove accessibility attributes.

Do not rely on color alone for important meaning.

---

## Content Tone

Website copy should feel:

- premium
- concise
- confident
- human
- maritime-aware
- trustworthy

Avoid:

- excessive AI buzzwords
- casual jokes
- generic startup phrases
- long marketing paragraphs
- unsupported claims
- excessive punctuation

Preferred tone:

“Built for modern yacht operations.”

Avoid tone like:

“Supercharge your workflow with next-gen AI magic!”

---

## AI Editing Rules

When AI edits UI:

- use existing tokens
- use existing components
- use existing layout patterns
- use semantic colors before primitives
- preserve current visual direction
- make the smallest design-consistent change possible

Do not:

- introduce new colors
- introduce new typography
- create a new spacing system
- redesign a full section unless requested
- copy another website’s design system
- add new UI dependencies without approval
- hardcode values when tokens exist

When unsure, inspect nearby components and reuse their pattern.

---

## When Creating New Components

Before creating a new component:

1. Search for an existing component.
2. Reuse or extend the closest existing component.
3. Follow token naming and semantic usage.
4. Keep props simple.
5. Keep styling consistent with nearby UI.
6. Do not add new dependencies.
7. Document any new reusable pattern only when necessary.

New components should be named semantically.

Good names:

- `HeroSection`
- `SectionHeader`
- `NewsCard`
- `NewsSection`
- `CategoryForm`
- `ContentCard`
- `WebsiteHeader`
- `WebsiteFooter`

Avoid vague names:

- `BoxThing`
- `NewCard`
- `CustomSection`
- `FancyButton`

---

## Implementation Safety

When making changes:

- do not change unrelated files
- do not rename tokens
- do not rename components without reason
- do not change design direction
- do not remove existing states
- do not remove responsiveness
- do not remove accessibility states
- keep changes minimal and reversible

For small UI fixes, do not perform broad cleanup.

---

## Dialog and Modal Surface Rules

Dialogs, modals, popovers, and confirmation panels should use the standard light dialog surface, not the brand-primary or dark green surface.

Default modal/dialog surface:

- background: `color/surface/default` or the existing white/light dialog surface token
- text: `color/text/primary`
- secondary text: `color/text/secondary`
- muted/helper text: `color/text/tertiary`
- border: `color/border/default`
- close/icon color: `color/icon-secondary` or nearest existing icon token
- overlay/backdrop: keep the existing overlay token or existing dark translucent backdrop pattern
- radius/elevation: use existing dialog radius and elevation tokens

Do not use `surface/brand-primary`, `color/bg/brand-primary/default`, or dark green brand surfaces as the default modal background.

Brand-primary surfaces should only be used for intentionally branded sections, hero blocks, or special promotional areas.

If converting an existing dark modal to a light dialog surface, update all related foreground colors:

- white text should become primary text
- muted white text should become secondary or tertiary text
- white icons should become standard icon color
- light borders should become default/subtle border
- ghost buttons should use light-surface styling
- primary CTA should keep brand-primary button styling
- status messages should use semantic success/destructive surface, border, and text tokens

Do not redesign modal layout, spacing, copy, or behavior while making this conversion. The modal should feel like a clean light dialog, not a dark branded panel.

---

## Close Icon Rules

Close buttons in modals, dialogs, drawers, popovers, and panels should use the official Figma close icon assets.

Use:

- `icon cross small` for compact close buttons
- `icon cross large` for larger modal/dialog close buttons

Do not use random X icons from icon libraries when the official close icon exists.

Close icon behavior should not change.

Close icon color should follow the surface:

- light surface: use standard icon/text token
- dark or brand surface: use inverse icon/text token

---

## Brand/Provider Icon Rules

Provider sign-in buttons should use the official provider icon assets from Figma when available.

For Google authentication buttons:

- use `ICO-Google`
- place the icon before the label
- preserve the official icon colors
- do not replace it with a generic icon-library mark

---

## Authentication Modal Rules

Authentication modals should use a unified access pattern when supported by the auth system.

Prefer one screen over separate sign-in/sign-up tabs when the provider can determine whether the user already exists.

Default auth modal structure:

- Modal title
- Short subtitle
- Provider sign-in button
- Divider
- Email/password form
- Forgot password link
- Need help link

Google authentication should use:

- official `ico-Google` icon
- label: `Continue with Google`

Do not duplicate provider buttons across separate sign-in and sign-up tabs unless the backend requires separate flows.

Email/password flows may require separate backend handling. If unified email login/signup is not supported, preserve the existing safe behavior and document the limitation.

---

## Logo Asset Rules

Use the official LYG logo from the approved Figma logo component/link.

Do not use logo screenshots.
Do not export the logo with a frame background.
Do not manually recreate the logo.
Do not use multiple logo sources across the app.

The app should use one shared global logo asset/component for:

- authentication modals
- website headers
- footers
- branding sections

If the official logo changes, update the shared logo source once and reuse it everywhere.

---

## Final Rule

The design system already exists.

AI should not invent a new one.

AI should preserve and apply the existing LYG Figma token system consistently.
