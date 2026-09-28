# Bamise Oladimeji Portfolio — V9.1 Repair Build

This build fixes the V9 `Could not load content` issue by restoring the required `data/site.json` file and using a safer relative content path.

## IMPORTANT: preserve your existing portfolio content
If your GitHub repository already contains your real `data/site.json`, **keep that file**. Copy/replace the other V9.1 files, but do not overwrite your real `data/site.json` with the starter file in this package.

If your `data/site.json` was deleted by the V9 installation, restore it from the GitHub commit immediately before V9, then deploy V9.1. The included `data/site.json` is only a valid emergency starter so the site can load; it is not a backup of your latest live portfolio content.

## Install
1. Extract this ZIP.
2. Copy the contents of `cmsedit` into the root of your existing GitHub Pages repository.
3. If you have your real `data/site.json`, preserve it.
4. Commit and push.
5. Wait for GitHub Pages to deploy.
6. Hard refresh the live site with Ctrl+Shift+R.
