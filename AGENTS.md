# AGENTS.md

## Purpose

This file gives AI coding agents durable project guidance for the LYG Front Facing Website.

Primary goals:

- Keep UI and code consistent.
- Reduce repeated explanations and unnecessary file scanning.
- Prevent random design, naming, and architecture changes.
- Help AI make small, accurate edits instead of broad rewrites.

Keep this file concise. Detailed visual rules belong in `DESIGN.md`.

---

## Project Context

This repository is for the LYG (Luxury Yacht Group) front-facing website.

The website should feel:

- premium
- calm
- trustworthy
- editorial
- maritime-aware
- enterprise-grade

The experience should support:

- marketing pages
- public-facing content
- news/content sections
- category/content management where applicable
- employer and crew-facing messaging where applicable

Avoid:

- playful SaaS styling
- loud gradients
- random animations
- generic startup copy
- unnecessary complexity

---

## First Rule: Reuse Before Creating

Before creating a new file, component, style, utility, or pattern:

1. Search for an existing equivalent.
2. Reuse or extend the closest existing pattern.
3. Only create something new if no suitable pattern exists.
4. Keep changes focused on the requested task.

Do not introduce duplicate components with slightly different styling.

---

## Token-Saving Rules

To reduce unnecessary token usage:

- Do not explain the whole project back to the user.
- Do not print full files unless specifically asked.
- Prefer showing only changed code or a concise summary.
- Avoid scanning unrelated folders.
- Avoid broad refactors unless requested.
- Do not repeat `DESIGN.md` rules unless directly relevant.
- Do not create long plans for simple changes.
- When investigating a bug, inspect the smallest relevant file set first.
- Ask a question only if the missing information blocks the task.

When responding to the user:

- Be direct.
- Keep explanations short.
- Mention only what changed, why, and any next step.

---

## File Discovery Guidance

When working on a UI issue, search in this order:

1. Route/page file
2. Related section component
3. Shared component
4. Data/content file
5. Styling/token file
6. API/helper function if data is involved

For content visibility issues, check:

1. source data
2. filters
3. status/published flags
4. date sorting
5. display limits
6. pagination
7. rendering conditions

Do not assume the issue is visual until data and rendering logic are checked.

---

## Design Consistency

Follow the existing visual system.

Use:

- consistent spacing
- consistent border radius
- consistent button sizes
- consistent input heights
- consistent card styles
- clear hierarchy
- restrained motion
- premium typography

Avoid:

- random one-off spacing
- new colors without reason
- mixed shadows
- inconsistent font sizes
- excessive animations
- overly decorative UI

For detailed design rules, refer to:

`DESIGN.md`

Do not duplicate the full design system inside this file.

---

## Component Rules

Components should be:

- reusable
- readable
- focused
- easy to modify
- visually consistent

Prefer:

- small components
- composition
- semantic names
- existing UI primitives
- existing layout patterns

Avoid:

- large monolithic components
- deeply nested JSX
- inline styles unless already used by the project
- hardcoded repeated values
- new UI libraries without approval

Good component names:

- `HeroSection`
- `NewsSection`
- `CategoryForm`
- `SectionHeader`
- `WebsiteHeader`
- `WebsiteFooter`
- `ContentCard`
- `NewsCard`

---

## Form and Admin UI Rules

For admin/content forms:

- Use standard input height.
- Align buttons cleanly beside inputs when space allows.
- Keep labels clear.
- Use helper text only when it reduces confusion.
- Keep empty states simple.
- Preserve existing behavior unless asked to change it.

For add/edit actions:

- Keep forms compact.
- Avoid unnecessary modals.
- Prefer inline actions when the current pattern already uses inline editing.

---

## Content Tone

Website copy should be:

- concise
- confident
- premium
- human
- clear
- industry-aware

Avoid:

- long marketing paragraphs
- overuse of “AI-powered”
- buzzwords
- excessive punctuation
- casual jokes
- vague claims

Preferred tone:

“Built for modern yacht operations.”

Avoid tone like:

“Supercharge your workflow with next-gen AI magic!”

---

## Code Style

Follow the existing code style in the repository.

General rules:

- Do not change framework, routing, or architecture.
- Do not rename files unless required.
- Do not change public APIs unless required.
- Do not remove existing behavior without noting it.
- Keep changes minimal and reversible.
- Prefer readable code over clever code.
- Use existing utilities before creating new ones.
- Use existing package manager based on the lockfile.

If the project uses TypeScript:

- Preserve types.
- Avoid `any` unless already unavoidable.
- Prefer explicit prop types for shared components.

---

## Dependencies

Do not add new dependencies unless explicitly requested.

Before suggesting a dependency:

- check if the project already has a suitable package
- explain why the dependency is necessary
- prefer native/browser/framework features where practical

---

## Animation Rules

Use motion carefully.

Preferred:

- subtle fade
- slight translate
- smooth reveal
- short transitions

Avoid:

- heavy parallax
- constant movement
- distracting loops
- animation that hurts readability

Motion should support clarity, not decoration.

---

## Responsive Rules

All UI should work on:

- mobile
- tablet
- desktop
- wide desktop

Avoid:

- fixed widths that break mobile
- horizontal overflow
- oversized mobile headings
- cramped cards
- buttons wrapping awkwardly

When editing layout, check responsive behavior before finalizing.

---

## Bug Fix Rules

When fixing a bug:

1. Identify the cause.
2. Make the smallest fix.
3. Avoid unrelated cleanup.
4. Preserve existing behavior.
5. Mention any likely side effects.

For issues like “I added 5 items but only 3 show,” check:

- data length
- query limit
- frontend slice/limit
- publish/status field
- sorting
- pagination
- hidden/draft state
- rendering conditions

Do not guess visually before checking logic.

---

## Git Safety

Before large changes:

- check current modified files
- avoid touching unrelated files
- keep changes focused
- do not rewrite history
- do not delete files unless clearly required

Commit messages should be short and specific.

Examples:

- `Fix news display limit`
- `Adjust category input layout`
- `Add website agent instructions`

---

## AI Working Style

When asked to implement:

- Start with the smallest relevant files.
- Make targeted changes.
- Summarize the result briefly.
- Include commands only when useful.
- Do not over-explain.

When asked to investigate:

- State the likely cause only after checking.
- If multiple causes are possible, list the top 2–3.
- Recommend the safest next action.

When asked to create documentation:

- Keep it practical.
- Avoid generic theory.
- Use examples from this project.

---

## When Unsure

If the task is small, make a reasonable decision using existing patterns.

Ask first only if the decision affects:

- architecture
- data structure
- design system direction
- content model
- dependencies
- deployment
- authentication
- permissions
