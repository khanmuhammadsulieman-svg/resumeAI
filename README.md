# ResumeAI

A fully functional, local-first resume builder. Created by Muhammad Sulieman Khan.

## Run it
No build step — it's a static site.

- **Locally:** open `index.html` in a browser, or run `npx serve .`
- **Deploy:** drag the folder into Netlify/Vercel, or push to a GitHub Pages repo. No `npm install` or build command needed since there's no bundler — just static `index.html` + `app.js`.

## What's implemented
- Landing page, dashboard (multi-resume management), and full builder
- Personal info, summary (with local demo "AI" rewrite actions), experience, education,
  skills (with proficiency), projects, certifications, languages, achievements, references,
  and fully custom sections
- Live A4 preview with zoom / fit-to-screen
- 8 genuinely distinct templates (Classic, Minimal, Executive, Sidebar, Timeline, Swiss, Compact/ATS, Creative)
  — not recolored copies, each has a different layout, header treatment, and skill display style
- Design panel: font family (11 fonts), font size, accent color (presets + custom picker),
  margins/spacing/line-height sliders, section reordering, field visibility toggles
- Real PDF export (html2pdf.js) and a proper print stylesheet
- Autosave to localStorage, undo/redo, JSON export/import (single resume or full backup)
- ATS score + resume completeness score, both rule-based (no external API)
- Dark mode (app chrome only — the resume itself stays print-safe), Ctrl/Cmd+K command palette,
  keyboard shortcuts (Save, Print, Undo/Redo)
- Responsive down to mobile (builder switches to single-pane on narrow screens)

## Scope note
The original brief asked for 20+ templates. Shipping meaningfully distinct layouts (not just
different accent colors) for 20+ takes real design time per template, so this build ships 8 that
are genuinely different in structure. The template system (`renderTemplate()` in `app.js`) is set
up so more can be added the same way — happy to add more on request.

## Connecting a real AI API
`panelSummary()`'s "Improve / Make Professional / Make Concise" buttons currently run local text
transforms so the app works with zero configuration. To wire up a real model, replace `aiAction()`
in `app.js` with a call to your API of choice.
