const FALLBACK='data/site.json';
async function loadData(){const r=await fetch(FALLBACK,{cache:'no-store'});return r.json()}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(d){
 document.title=`${d.site.name} — ${d.site.role}`;
 document.documentElement.style.setProperty('--accent',d.settings.accent);
 const nav=d.navigation.map(n=>`<a href="${esc(n.href)}">${esc(n.label)}</a>`).join('');
 const projects=d.projects.map((p,i)=>{
   const gallery=[{image:p.image,title:p.title},...(Array.isArray(p.gallery)?p.gallery:[])].filter(x=>x&&x.image);
   return `<article class="project reveal" tabindex="0" role="button" data-project-index="${i}"><div class="project-img"><img src="${esc(p.image)}" alt="${esc(p.title)}"></div><div class="project-title">${esc(p.title)}</div><div class="project-meta"><span>${esc(p.category)}</span><span>${esc(p.year)}</span></div></article>`;
 }).join('');
 const services=d.services.map((s,i)=>`<div class="service reveal"><div class="service-no">${String(i+1).padStart(2,'0')}</div><div><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p></div></div>`).join('');
 const quotes=d.testimonials.map(t=>`<article class="quote reveal"><blockquote>“${esc(t.quote)}”</blockquote><small>${esc(t.name)} · ${esc(t.role)}</small></article>`).join('');
 const socials=d.socials.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noreferrer">${esc(s.label)} ↗</a>`).join('');
 const logo=(d.logo?.enabled&&d.logo?.image)?`<img class="logo-image" src="${esc(d.logo.image)}" alt="${esc(d.site.name)} logo">`:`<span>${esc(d.site.shortName)}</span>`;
 const heroPortrait=(d.hero?.portraitEnabled!==false&&d.hero?.heroImage)?`<div class="hero-art"><div class="side-index">01 — 05</div><img src="${esc(d.hero.heroImage)}" alt="${esc(d.site.name)}"></div>`:'';
 const footerEnabled=d.footer?.enabled!==false;
 const footerCopyright=(d.footer?.copyright||'© {year} {name}').replace('{year}',new Date().getFullYear()).replace('{name}',d.site.name);
 const viewAllLabel=d.projectSection?.viewAllLabel||'View All Projects';
 const viewAllUrl=d.projectSection?.viewAllUrl||'#work';
 document.querySelector('#app').innerHTML=`
 <header class="nav"><div class="container nav-inner"><a class="logo" href="#home">${logo}</a><nav class="links">${nav}</nav><a class="hire" href="#contact">Hire Me →</a></div></header>
 <main>
 <section class="hero container ${heroPortrait?'':'no-portrait'}" id="home"><div><div class="eyebrow">${esc(d.hero.eyebrow)}</div><h1>${esc(d.hero.title)}</h1><p>${esc(d.hero.description)}</p><div class="actions"><a class="btn primary" href="#work">${esc(d.hero.primaryCta)} →</a><a class="btn" href="#contact">${esc(d.hero.secondaryCta)}</a></div></div>${heroPortrait}</section>
 <section class="section container" id="work"><div class="section-head"><div><div class="eyebrow">Featured Work</div><h2>Selected Projects</h2></div>${viewAllUrl&&viewAllUrl!=='#work'?`<a class="small-link" href="${esc(viewAllUrl)}" target="_blank" rel="noreferrer">${esc(viewAllLabel)} →</a>`:`<a class="small-link" href="#work">${esc(viewAllLabel)} →</a>`}</div><div class="grid">${projects}</div></section>
 <section class="section dark" id="about"><div class="container about"><div><div class="eyebrow muted">${esc(d.about.eyebrow)}</div><h2>${esc(d.about.title)}</h2></div><div><p>${esc(d.about.text)}</p><div class="stats">${d.about.stats.map(s=>`<div class="stat"><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`).join('')}</div></div></div></section>
 <section class="section container" id="services"><div class="section-head"><div><div class="eyebrow">What I Do</div><h2>Services</h2></div></div><div class="services">${services}</div></section>
 <section class="section container" id="testimonials"><div class="section-head"><div><div class="eyebrow">Kind Words</div><h2>Testimonials</h2></div></div><div class="quote-grid">${quotes}</div></section>
 <section class="section container" id="contact"><div class="contact"><div><div class="eyebrow">Let's Work Together</div><h2>Have a project in mind?</h2><p class="contact-copy">${esc(d.site.availability)}<br>Let's talk about what we can create.</p></div><div><div class="contact-list"><div class="contact-row"><span>Email</span><a href="mailto:${esc(d.site.email)}">${esc(d.site.email)} ↗</a></div><div class="contact-row"><span>Location</span><span>${esc(d.site.location)}</span></div>${socials?`<div class="contact-row"><span>Social</span><span style="display:flex;gap:18px">${socials}</span></div>`:''}</div></div></div></section>
 </main>${footerEnabled?`<footer class="container footer"><div><span>${esc(footerCopyright)}</span>${d.footer?.text?`<span class="footer-text">${esc(d.footer.text)}</span>`:''}</div>${(d.footer?.showNavigation!==false||d.footer?.showSocials!==false)?`<div class="footer-right">${d.footer?.showNavigation!==false?`<nav>${nav}</nav>`:''}${d.footer?.showSocials!==false&&socials?`<div class="footer-socials">${socials}</div>`:''}</div>`:''}</footer>`:''}
 <div id="projectModal" class="project-modal" aria-hidden="true"><div class="project-modal-backdrop" data-close-project></div><div class="project-modal-panel" role="dialog" aria-modal="true" aria-labelledby="projectModalTitle"><button class="project-modal-close" type="button" aria-label="Close project gallery" data-close-project>×</button><div class="project-modal-top"><div><div class="eyebrow" id="projectModalCategory"></div><h2 id="projectModalTitle"></h2><p id="projectModalDescription"></p></div><a id="projectModalViewMore" class="btn primary" href="#" target="_blank" rel="noreferrer">View More ↗</a></div><div id="projectGallery" class="project-gallery"></div></div></div>`;
 const obs=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('show')),{threshold:.08});document.querySelectorAll('.reveal').forEach(x=>obs.observe(x));
 document.querySelectorAll('[data-project-index]').forEach(card=>{card.addEventListener('click',()=>openProject(Number(card.dataset.projectIndex)));card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openProject(Number(card.dataset.projectIndex));}})});
 document.querySelectorAll('[data-close-project]').forEach(x=>x.addEventListener('click',closeProject));
 document.addEventListener('keydown',handleProjectKeydown,{once:true});
}
function openProject(index){
 const d=window.__portfolioData, p=d.projects[index]; if(!p)return;
 const gallery=[{image:p.image,title:p.title},...(Array.isArray(p.gallery)?p.gallery:[])].filter(x=>x&&x.image);
 const modal=document.querySelector('#projectModal');
 document.querySelector('#projectModalCategory').textContent=[p.category,p.year].filter(Boolean).join(' · ');
 document.querySelector('#projectModalTitle').textContent=p.title||'';
 document.querySelector('#projectModalDescription').textContent=p.description||'';
 const more=document.querySelector('#projectModalViewMore');
 const url=p.viewMoreUrl||'';
 more.textContent=(p.viewMoreLabel||'View More')+' ↗';
 more.href=url||'#';
 more.style.display=url?'inline-flex':'none';
 document.querySelector('#projectGallery').innerHTML=gallery.map((g,i)=>`<figure class="gallery-item"><img src="${esc(g.image)}" alt="${esc(g.title||p.title)}"><figcaption>${esc(g.title||p.title||`Image ${i+1}`)}</figcaption></figure>`).join('');
 modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
}
function closeProject(){const modal=document.querySelector('#projectModal');if(!modal)return;modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');}
function handleProjectKeydown(e){if(e.key==='Escape')closeProject();else document.addEventListener('keydown',handleProjectKeydown,{once:true});}
loadData().then(d=>{window.__portfolioData=d;render(d)}).catch(()=>document.querySelector('#app').innerHTML='<div style="padding:40px;font-family:system-ui">Could not load site content.</div>');
