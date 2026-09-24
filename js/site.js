const FALLBACK='data/site.json';
async function loadData(){const r=await fetch(FALLBACK,{cache:'no-store'});return r.json()}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(d){
 document.title=`${d.site.name} — ${d.site.role}`;
 document.documentElement.style.setProperty('--accent',d.settings.accent);
 const nav=d.navigation.map(n=>`<a href="${esc(n.href)}">${esc(n.label)}</a>`).join('');
 const projects=d.projects.map(p=>`<a class="project reveal" href="${esc(p.link||'#')}"><div class="project-img"><img src="${esc(p.image)}" alt="${esc(p.title)}"></div><div class="project-title">${esc(p.title)}</div><div class="project-meta"><span>${esc(p.category)}</span><span>${esc(p.year)}</span></div></a>`).join('');
 const services=d.services.map((s,i)=>`<div class="service reveal"><div class="service-no">${String(i+1).padStart(2,'0')}</div><div><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p></div></div>`).join('');
 const quotes=d.testimonials.map(t=>`<article class="quote reveal"><blockquote>“${esc(t.quote)}”</blockquote><small>${esc(t.name)} · ${esc(t.role)}</small></article>`).join('');
 const socials=d.socials.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noreferrer">${esc(s.label)} ↗</a>`).join('');
 const logo=(d.logo?.enabled&&d.logo?.image)?`<img class="logo-image" src="${esc(d.logo.image)}" alt="${esc(d.site.name)} logo">`:`<span>${esc(d.site.shortName)}</span>`;
 const heroPortrait=(d.hero?.portraitEnabled!==false&&d.hero?.heroImage)?`<div class="hero-art"><div class="side-index">01 — 05</div><img src="${esc(d.hero.heroImage)}" alt="${esc(d.site.name)}"></div>`:'';
 const footerEnabled=d.footer?.enabled!==false;
 const footerCopyright=(d.footer?.copyright||'© {year} {name}').replace('{year}',new Date().getFullYear()).replace('{name}',d.site.name);
 document.querySelector('#app').innerHTML=`
 <header class="nav"><div class="container nav-inner"><a class="logo" href="#home">${logo}</a><nav class="links">${nav}</nav><a class="hire" href="#contact">Hire Me →</a></div></header>
 <main>
 <section class="hero container ${heroPortrait?'':'no-portrait'}" id="home"><div><div class="eyebrow">${esc(d.hero.eyebrow)}</div><h1>${esc(d.hero.title)}</h1><p>${esc(d.hero.description)}</p><div class="actions"><a class="btn primary" href="#work">${esc(d.hero.primaryCta)} →</a><a class="btn" href="#contact">${esc(d.hero.secondaryCta)}</a></div></div>${heroPortrait}</section>
 <section class="section container" id="work"><div class="section-head"><div><div class="eyebrow">Featured Work</div><h2>Selected Projects</h2></div><a class="small-link" href="#work">View All Projects →</a></div><div class="grid">${projects}</div></section>
 <section class="section dark" id="about"><div class="container about"><div><div class="eyebrow muted">${esc(d.about.eyebrow)}</div><h2>${esc(d.about.title)}</h2></div><div><p>${esc(d.about.text)}</p><div class="stats">${d.about.stats.map(s=>`<div class="stat"><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`).join('')}</div></div></div></section>
 <section class="section container" id="services"><div class="section-head"><div><div class="eyebrow">What I Do</div><h2>Services</h2></div></div><div class="services">${services}</div></section>
 <section class="section container" id="testimonials"><div class="section-head"><div><div class="eyebrow">Kind Words</div><h2>Testimonials</h2></div></div><div class="quote-grid">${quotes}</div></section>
 <section class="section container" id="contact"><div class="contact"><div><div class="eyebrow">Let's Work Together</div><h2>Have a project in mind?</h2><p class="contact-copy">${esc(d.site.availability)}<br>Let's talk about what we can create.</p></div><div><div class="contact-list"><div class="contact-row"><span>Email</span><a href="mailto:${esc(d.site.email)}">${esc(d.site.email)} ↗</a></div><div class="contact-row"><span>Location</span><span>${esc(d.site.location)}</span></div>${socials?`<div class="contact-row"><span>Social</span><span style="display:flex;gap:18px">${socials}</span></div>`:''}</div></div></div></section>
 </main>${footerEnabled?`<footer class="container footer"><div><span>${esc(footerCopyright)}</span>${d.footer?.text?`<span class="footer-text">${esc(d.footer.text)}</span>`:''}</div>${(d.footer?.showNavigation!==false||d.footer?.showSocials!==false)?`<div class="footer-right">${d.footer?.showNavigation!==false?`<nav>${nav}</nav>`:''}${d.footer?.showSocials!==false&&socials?`<div class="footer-socials">${socials}</div>`:''}</div>`:''}</footer>`:''}`;
 const obs=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('show')),{threshold:.08});document.querySelectorAll('.reveal').forEach(x=>obs.observe(x));
}
loadData().then(render).catch(()=>document.querySelector('#app').innerHTML='<div style="padding:40px;font-family:system-ui">Could not load site content.</div>');
