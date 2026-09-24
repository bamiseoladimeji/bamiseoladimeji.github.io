# Personal Designer Portfolio — GitHub Pages

A free static graphic-design portfolio with a GitHub-backed admin dashboard.

## Files
- `index.html` — public website
- `admin.html` — private admin interface
- `data/site.json` — editable site content
- `assets/` — images and placeholders
- `js/site.js` — public renderer
- `js/admin.js` — GitHub API editor
- `style.css` / `admin.css` — styling

## Deploy
1. Create a GitHub repository named `YOURUSERNAME.github.io`.
2. Upload all files in this folder to the repository.
3. GitHub → Settings → Pages → Deploy from branch → `main` → `/ (root)`.
4. Open `https://YOURUSERNAME.github.io/`.
5. Open `/admin.html` for the admin dashboard.

## Admin connection
The dashboard uses a GitHub fine-grained personal access token to commit edits to `data/site.json`.
Give the token access only to this portfolio repository and Contents: Read and write.
The token is held in browser session storage, not in the website source.

## Important
This is a deliberately serverless architecture so the hosting remains free on GitHub Pages. A truly public login system with passwords, secure sessions, and a database requires a backend. This dashboard instead authenticates the administrator directly against GitHub.
