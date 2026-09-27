# Portfolio CMS V9 — Final Polish Build

This is an upgrade for the existing GitHub Pages portfolio.

## IMPORTANT
**Keep your existing `data/site.json`.** V9 intentionally does not include or replace that file, so your current portfolio content, uploaded images, projects, testimonials, and admin settings are preserved.

Replace/add the V9 files in your existing repository:
- `index.html`
- `style.css`
- `admin.html`
- `admin.css`
- `js/site.js`
- `js/admin.js`
- `assets/*` only where needed

## V9 highlights
- Refined hero composition with the portrait above the accent circle and a soft portrait edge blend.
- Improved project-card hover treatment and project modal presentation.
- Refined About, Services, Testimonials, Contact and Footer spacing.
- Improved mobile composition and touch targets.
- Active navigation state while scrolling.
- Mobile menu closes after navigation and when clicking outside it.
- Reduced-motion support.
- Accessibility focus improvements.
- Preserves V8 CMS functionality and GitHub publishing workflow.

## Deploy
1. Back up your current repository if desired.
2. Copy the V9 files into the root of the existing GitHub repository.
3. **Do not delete or replace `data/site.json`.**
4. Commit and push to `main`.
5. Wait for GitHub Pages to redeploy.
6. Hard-refresh the live site and `admin.html`.
