# Personal Designer Portfolio — V8

V8 is the production-hardening build of the portfolio CMS.

## Public site
- Responsive editorial/personal-designer layout
- Mobile navigation
- Accessible skip link and keyboard focus states
- Reduced-motion support
- Project case-study modal with gallery, details and previous/next navigation
- Safe handling of configured URLs and image paths
- Lazy-loaded gallery/project images
- SEO title, description and Open Graph/Twitter metadata from `data/site.json`
- Static mailto contact enquiry

## Admin
- Homepage content
- Projects, galleries and case studies
- Testimonials
- Footer
- About
- Services
- Navigation
- Social links
- Appearance
- SEO & Contact
- Section visibility
- Advanced JSON editor
- Downloadable `site.json` backup
- Unsaved-change warning
- GitHub Pages publishing through the GitHub Contents API

## Deployment
1. Replace the contents of your existing repository with this folder's contents.
2. Commit to the branch used by GitHub Pages (normally `main`).
3. Open `/admin.html`.
4. Use the same fine-grained GitHub token with repository Contents read/write permission.
5. Save changes with **Save to GitHub**.

The token is stored only in `sessionStorage` for the current browser session. Never publish the token in the repository.
