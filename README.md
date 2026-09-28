V9.2 LIVE CONTENT LOADER REPAIR

This is a targeted repair for the V9 "Could not load site content" error.

IMPORTANT:
- Do NOT replace data/site.json.
- Keep your existing data/site.json because it contains your real portfolio content.
- Copy index.html and the js/site.js file from this package into the repository, preserving the js/ folder.
- Commit/push to GitHub Pages.
- Hard refresh the live site (Ctrl+Shift+R).

The repair makes JSON loading more robust and prevents the navigation active-section code from crashing when a navigation item is external or malformed.
