const $=s=>document.querySelector(s);
let state=null,clientData={clients:[]},owner='',repo='',token='',sha='',clientSha='',tab='overview',dirty=false,clientDirty=false;
const api=(path,opts={})=>fetch('https://api.github.com'+path,{...opts,headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28',...(opts.headers||{})}});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function b64(s){return btoa(unescape(encodeURIComponent(s)))}
function from64(s){return decodeURIComponent(escape(atob(s)))}
function uid(prefix='item'){return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`}
function val(path){return path.split('.').reduce((a,k)=>a[k],state)}
function setPath(path,v){const parts=path.split('.');let o=state;parts.slice(0,-1).forEach(k=>o=o[k]);o[parts.at(-1)]=v}
function input(label,path,value,multi=false){return `<div class="field"><label>${label}</label>${multi?`<textarea data-path="${path}">${esc(value)}</textarea>`:`<input data-path="${path}" value="${esc(value)}">`}</div>`}
function checkbox(label,path,value){return `<label class="check"><input type="checkbox" data-path="${path}" ${value?'checked':''}> ${label}</label>`}
function collect(){document.querySelectorAll('[data-path]').forEach(e=>setPath(e.dataset.path,e.type==='checkbox'?e.checked:e.value))}
function notice(msg,good=true){const n=$('#notice');n.textContent=msg;n.className='notice '+(good?'good':'bad');setTimeout(()=>n.classList.add('hidden'),3500)}
async function readRepoFile(path){
  const r=await api(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=main`);
  if(!r.ok) return null;
  const j=await r.json();
  return {sha:j.sha,content:from64(j.content.replace(/\n/g,''))};
}
async function getFile(){
  const site=await readRepoFile('data/site.json');
  if(!site)throw new Error('Could not read data/site.json. Check the repository, branch and token permissions.');
  sha=site.sha;state=JSON.parse(site.content);normalize();
  const clients=await readRepoFile('data/clients.json');
  if(clients){clientSha=clients.sha;clientData=JSON.parse(clients.content);}
  else {clientSha='';clientData={clients:[]};}
  clientData ||= {clients:[]}; clientData.clients=Array.isArray(clientData.clients)?clientData.clients:[];
  clientData.clients.forEach(c=>{c.active=c.active!==false;c.files=Array.isArray(c.files)?c.files:[];});
}
function normalize(){state ||= {};state.site ||= {};state.hero ||= {};state.projects = Array.isArray(state.projects)?state.projects:[];state.testimonials = Array.isArray(state.testimonials)?state.testimonials:[];state.about ||= {};state.about.stats = Array.isArray(state.about.stats)?state.about.stats:[];state.services = Array.isArray(state.services)?state.services:[];state.socials = Array.isArray(state.socials)?state.socials:[];state.navigation = Array.isArray(state.navigation)?state.navigation:[];state.settings ||= {};state.settings.accent ||= '#ff4d1f';state.settings.dark ||= '#0b0c0e';state.settings.light ||= '#f5f2eb';state.settings.font ||= 'DM Sans, system-ui, sans-serif';state.settings.headingFont ||= 'Space Grotesk, system-ui, sans-serif';state.settings.maxWidth ||= 1240;state.settings.buttonRadius ||= 999;state.settings.cardRadius ||= 15;state.settings.imageRadius ||= 0;state.settings.grayscaleImages = state.settings.grayscaleImages !== false;state.logo ||= {enabled:false,image:''};state.footer ||= {enabled:true,text:'Designed & built with intention.',copyright:'© {year} {name}',showNavigation:true,showSocials:true};state.projectSection ||= {viewAllLabel:'View All Projects',viewAllUrl:'#work'};state.projectSection.viewAllLabel ||= 'View All Projects';state.projectSection.viewAllUrl ??= '#work';state.workSection ||= {eyebrow:'Featured Work',title:'Selected Projects'};state.servicesSection ||= {eyebrow:'What I Do',title:'Services'};state.testimonialsSection ||= {eyebrow:'Kind Words',title:'Testimonials'};state.contactSection ||= {eyebrow:"Let's Work Together",title:'Have a project in mind?',description:"Let's talk about what we can create."};state.header ||= {hireLabel:'Hire Me',hireUrl:'#contact'};state.header.hireLabel ||= 'Hire Me';state.header.hireUrl ??= '#contact';state.hero.primaryCtaUrl ??= '#work';state.hero.secondaryCtaUrl ??= '#contact';state.hero.portraitEnabled = state.hero.portraitEnabled!==false;state.hero.heroImage ||= '';state.logo.enabled=state.logo.enabled===true;state.projects.forEach(p=>{p.gallery ||= [];p.viewMoreLabel ||= 'View More';p.viewMoreUrl ??= '';p.client ??= '';p.role ??= '';p.overview ??= p.description||'';p.challenge ??= '';p.strategy ??= '';p.solution ??= '';p.results ??= '';delete p.link;});state.testimonials.forEach(t=>{t.photo ??= '';t.photoEnabled=t.photoEnabled!==false;});state.seo ||= {title:`${state.site.name||'Portfolio'} — ${state.site.role||'Graphic Designer'}`,description:state.site.tagline||'',socialImage:'',favicon:''};state.seo.title ??= '';state.seo.description ??= '';state.seo.socialImage ??= '';state.seo.favicon ??= '';state.visibility ||= {showHero:true,showProjects:true,showAbout:true,showServices:true,showTestimonials:true,showContact:true,showAllProjects:true};['showHero','showProjects','showAbout','showServices','showTestimonials','showContact','showAllProjects'].forEach(k=>state.visibility[k]=state.visibility[k]!==false);state.contactForm ||= {enabled:false,buttonLabel:'Start a Project',emailSubject:'New project enquiry'};
state.portal ||= {enabled:true,title:'Client Design Portal',intro:'Enter the access code provided to you to view and download your designs.',path:'client-portal.html'};
state.portal.enabled = state.portal.enabled === true;
state.portal.title ||= 'Client Design Portal';
state.portal.intro ||= 'Enter the access code provided to you to view and download your designs.';
state.portal.path ||= 'client-portal.html';state.contactForm.enabled=state.contactForm.enabled===true;state.contactForm.buttonLabel ||= 'Start a Project';state.contactForm.emailSubject ||= 'New project enquiry';}
async function optimizeImage(file, options = {}) {
  const maxDimension = options.maxDimension || 2400;
  const targetBytes = options.targetBytes || 3 * 1024 * 1024;
  const qualityStart = options.quality || 0.86;

  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');

  // SVGs are already vector/compressed and should be uploaded unchanged.
  if (file.type === 'image/svg+xml') return { blob: file, extension: 'svg', originalBytes: file.size, optimizedBytes: file.size, width: null, height: null };

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: true });
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Prefer WebP for much smaller portfolio images. Fall back to JPEG if WebP is unavailable.
  const type = 'image/webp';
  let quality = qualityStart;
  let blob = await new Promise(resolve => canvas.toBlob(resolve, type, quality));
  let extension = 'webp';

  if (!blob) {
    extension = 'jpg';
    blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
  }

  // Reduce quality progressively if the browser produced a file larger than our target.
  while (blob && blob.size > targetBytes && quality > 0.45) {
    quality -= 0.08;
    const next = await new Promise(resolve => canvas.toBlob(resolve, type, quality));
    if (!next) break;
    blob = next;
  }

  if (!blob) throw new Error('Your browser could not process this image. Try JPG or PNG.');
  return { blob, extension, originalBytes: file.size, optimizedBytes: blob.size, width, height };
}

async function blobToBase64(blob) {
  const buffer = await blob.arrayBuffer();
  const arr = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < arr.length; i += chunk) {
    binary += String.fromCharCode(...arr.subarray(i, Math.min(i + chunk, arr.length)));
  }
  return btoa(binary);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function uploadFile(file, folder='assets/media', options={}) {
  if (!file) return null;
  const optimized = await optimizeImage(file, options);
  const base = file.name.replace(/\.[^/.]+$/,'').toLowerCase().replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'') || 'image';
  const path = `${folder}/${Date.now()}-${base}.${optimized.extension}`;
  const content = await blobToBase64(optimized.blob);
  const endpoint = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=main`;
  const r = await api(endpoint, {method:'PUT', body:JSON.stringify({message:`Upload optimized ${path}`,content,branch:'main'})});
  const body = await r.text();
  if (!r.ok) throw new Error(`Image upload failed (${r.status}): ${body}`);
  return { path, originalBytes: optimized.originalBytes, optimizedBytes: optimized.optimizedBytes, width: optimized.width, height: optimized.height };
}

function publicAssetUrl(path){
  if(!path)return '';
  if(/^https?:\/\//i.test(path))return path;
  return path;
}
async function deleteFile(path){if(!path||!path.startsWith('assets/media/'))return;const r=await api(`/repos/${owner}/${repo}/contents/${path}?ref=main`);if(!r.ok)return;const j=await r.json();await api(`/repos/${owner}/${repo}/contents/${path}`,{method:'DELETE',body:JSON.stringify({message:`Remove ${path}`,sha:j.sha,branch:'main'})})}
function fileControl(label,path,enabledPath=''){return `<div class="field"><label>${label}</label><div class="upload"><input type="file" accept="image/*" data-upload-path="${path}">${enabledPath?checkbox('Show on website',enabledPath,val(enabledPath)):''}<button class="secondary" type="button" onclick="handleUpload(this)">Upload</button></div><div class="small">Large images are automatically resized and compressed to WebP/JPG before upload. The optimized file is saved in <code>assets/media/</code>. Then save the content.</div></div>`}
window.handleUpload=async(btn)=>{
  const wrap=btn.parentElement;
  const input=wrap.querySelector('input[type=file]');
  const f=input?.files?.[0];
  const path=input?.dataset?.uploadPath;
  if(!f) return notice('Choose an image first.',false);
  btn.disabled=true;
  btn.textContent='Optimizing…';
  try{
    collect();
    const old=val(path);
    const maxDimension = path==='logo.image' ? 256 : 2400;
    const result=await uploadFile(f,'assets/media',{maxDimension,targetBytes:3*1024*1024});
    setPath(path,result.path);
    if(path==='hero.heroImage') state.hero.portraitEnabled=true;
    if(path==='logo.image') state.logo.enabled=true;
    if(old && old!==result.path) await deleteFile(old);
    render();
    const reduction=Math.max(0,Math.round((1-result.optimizedBytes/result.originalBytes)*100));
    notice(`Uploaded and optimized: ${formatBytes(result.originalBytes)} → ${formatBytes(result.optimizedBytes)} (${reduction}% smaller). Now click “Save to GitHub”.`);
  }catch(e){
    notice(e.message||'Image upload failed.',false);
  }finally{
    btn.disabled=false;
    btn.textContent='Upload';
  }
};

function render(){
 $('#pageTitle').textContent=({site:'Homepage',projects:'Projects',clients:'Client Portal',testimonials:'Testimonials',footer:'Footer',about:'About',services:'Services',navigation:'Navigation',socials:'Social Links',theme:'Appearance',seo:'SEO',visibility:'Section Visibility',advanced:'Advanced JSON',overview:'Overview'})[tab]||tab;
 const p=$('#panel');
 if(tab==='overview')p.innerHTML=`<div class="stats"><div class="stat"><div class="eyebrow">Projects</div><b>${state.projects.length}</b></div><div class="stat"><div class="eyebrow">Testimonials</div><b>${state.testimonials.length}</b></div><div class="stat"><div class="eyebrow">Services</div><b>${state.services.length}</b></div><div class="stat"><div class="eyebrow">Social links</div><b>${state.socials.length}</b></div></div><div class="card"><h2>Your CMS controls</h2><p class="muted">Manage the homepage, projects, testimonials, services, navigation, social links, footer and visual appearance without editing code.</p></div>`;
 if(tab==='site')p.innerHTML=`
 <div class="card"><h2>Homepage — identity</h2>${input('Name','site.name',val('site.name'))}${input('Short name / fallback logo','site.shortName',val('site.shortName'))}${input('Professional title','site.role',val('site.role'))}${input('Email','site.email',val('site.email'))}${input('Location','site.location',val('site.location'))}${input('Availability','site.availability',val('site.availability'))}</div>
 <div class="card"><h2>Hero</h2>${input('Eyebrow','hero.eyebrow',val('hero.eyebrow'))}${input('Headline','hero.title',val('hero.title'))}${input('Introduction','hero.description',val('hero.description'),true)}<div class="two">${input('Primary button label','hero.primaryCta',val('hero.primaryCta'))}${input('Primary button link','hero.primaryCtaUrl',val('hero.primaryCtaUrl'))}</div><div class="two">${input('Secondary button label','hero.secondaryCta',val('hero.secondaryCta'))}${input('Secondary button link','hero.secondaryCtaUrl',val('hero.secondaryCtaUrl'))}</div>${state.hero.heroImage?`<div class="preview"><img src="${esc(state.hero.heroImage)}" alt="Hero portrait"><span class="muted">Current portrait</span></div>`:''}${fileControl('Hero portrait','hero.heroImage','hero.portraitEnabled')}<button class="danger" type="button" onclick="removeHeroPortrait()">Delete portrait & hide it</button></div>
 <div class="card"><h2>Header</h2><div class="two">${input('Hire button label','header.hireLabel',val('header.hireLabel'))}${input('Hire button link','header.hireUrl',val('header.hireUrl'))}</div></div>
 <div class="card"><h2>Projects section</h2>${input('Section eyebrow','workSection.eyebrow',val('workSection.eyebrow'))}${input('Section title','workSection.title',val('workSection.title'))}${input('View All label','projectSection.viewAllLabel',val('projectSection.viewAllLabel'))}${input('View All link','projectSection.viewAllUrl',val('projectSection.viewAllUrl'))}</div>
 <div class="card"><h2>About section</h2>${input('Eyebrow','about.eyebrow',val('about.eyebrow'))}${input('Title','about.title',val('about.title'))}${input('About text','about.text',val('about.text'),true)}<h3>Stats</h3>${state.about.stats.map((x,i)=>`<div class="two">${input('Value',`about.stats.${i}.value`,x.value)}${input('Label',`about.stats.${i}.label`,x.label)}</div>`).join('')}</div>
 <div class="card"><h2>Services section</h2>${input('Section eyebrow','servicesSection.eyebrow',val('servicesSection.eyebrow'))}${input('Section title','servicesSection.title',val('servicesSection.title'))}</div>
 <div class="card"><h2>Testimonials section</h2>${input('Section eyebrow','testimonialsSection.eyebrow',val('testimonialsSection.eyebrow'))}${input('Section title','testimonialsSection.title',val('testimonialsSection.title'))}</div>
 <div class="card"><h2>Contact section</h2>${input('Eyebrow','contactSection.eyebrow',val('contactSection.eyebrow'))}${input('Title','contactSection.title',val('contactSection.title'))}${input('Description','contactSection.description',val('contactSection.description'),true)}</div>
 <div class="card"><h2>16 × 16 logo</h2>${state.logo.image?`<div class="preview"><img src="${esc(state.logo.image)}" width="16" height="16" alt="Logo"><span class="muted">Current logo</span></div>`:''}${fileControl('Logo image','logo.image','logo.enabled')}<button class="danger" type="button" onclick="removeLogo()">Delete logo & hide it</button></div>`;
 if(tab==='projects')p.innerHTML=`<div class="card"><h2>Projects section</h2>${input('View All Projects label','projectSection.viewAllLabel',val('projectSection.viewAllLabel'))}${input('View All Projects URL','projectSection.viewAllUrl',val('projectSection.viewAllUrl'))}<p class="muted">Use a Pinterest or Behance URL to send visitors to your wider portfolio.</p></div><div class="card"><div class="addbar"><div><h2>Projects</h2><p class="muted">Add, edit, delete and manage project galleries.</p></div><button class="edit" type="button" onclick="addProject()">+ Add Project</button></div>${state.projects.map((x,i)=>projectEditor(x,i)).join('')}</div>`;
 if(tab==='clients')p.innerHTML=`<div class="card"><h2>Client Portal</h2><p class="muted">Turn the portal on or off globally. This controls access to the client delivery page without deleting any client projects or files.</p>${checkbox('Enable Client Portal','portal.enabled',val('portal.enabled'))}${input('Portal title','portal.title',val('portal.title'))}${input('Portal introduction','portal.intro',val('portal.intro'),true)}${input('Portal page','portal.path',val('portal.path'))}<div class="portal-status ${state.portal.enabled?'is-on':'is-off'}"><strong>${state.portal.enabled?'● Portal is ACTIVE':'○ Portal is INACTIVE'}</strong><span>${state.portal.enabled?'Clients can use their access codes.':'All client access is currently disabled.'}</span></div></div><div class="card"><div class="addbar"><div><h2>Clients</h2><p class="muted">Create unique access codes and attach downloadable design files. Disabling one client does not affect the others.</p></div><button class="edit" type="button" onclick="addClient()">+ Add Client</button></div>${clientData.clients.map((x,i)=>clientEditor(x,i)).join('')||'<p class="muted">No clients yet. Add your first client.</p>'}</div>`;
 if(tab==='testimonials')p.innerHTML=`<div class="card"><div class="addbar"><div><h2>Testimonials</h2><p class="muted">Add or delete client testimonials, edit client details, and optionally upload a client photo.</p></div><button class="edit" type="button" onclick="addTestimonial()">+ Add Testimonial</button></div>${state.testimonials.map((x,i)=>testimonialEditor(x,i)).join('')}</div>`;
 if(tab==='footer')p.innerHTML=`<div class="card"><h2>Footer</h2>${checkbox('Show footer','footer.enabled',val('footer.enabled'))}${input('Footer text','footer.text',val('footer.text'),true)}${input('Copyright template','footer.copyright',val('footer.copyright'))}${checkbox('Show footer navigation','footer.showNavigation',val('footer.showNavigation'))}${checkbox('Show footer social links','footer.showSocials',val('footer.showSocials'))}<p class="muted">Use <code>{year}</code> and <code>{name}</code> in the copyright field.</p></div>`;
 if(tab==='about')p.innerHTML=`<div class="card"><div class="addbar"><div><h2>About</h2><p class="muted">Edit your biography and statistics.</p></div></div>${input('Eyebrow','about.eyebrow',val('about.eyebrow'))}${input('Title','about.title',val('about.title'))}${input('About text','about.text',val('about.text'),true)}<h3>Stats</h3>${state.about.stats.map((s,i)=>`<div class="reorder-row"><div class="two">${input('Value',`about.stats.${i}.value`,s.value)}${input('Label',`about.stats.${i}.label`,s.label)}</div><div class="actions"><button class="secondary" type="button" onclick="moveItem('about.stats',${i},-1)">↑</button><button class="secondary" type="button" onclick="moveItem('about.stats',${i},1)">↓</button><button class="danger" type="button" onclick="deleteItem('about.stats',${i})">Delete</button></div></div>`).join('')}<button class="edit" type="button" onclick="addStat()">+ Add Stat</button></div>`;
 if(tab==='services')p.innerHTML=`<div class="card"><div class="addbar"><div><h2>Services</h2><p class="muted">Add, edit, delete and reorder the services displayed on your website.</p></div><button class="edit" type="button" onclick="addService()">+ Add Service</button></div>${state.services.map((s,i)=>`<div class="service-admin"><div class="item-head"><strong>${esc(s.title||'New Service')}</strong><div class="actions"><button class="secondary" type="button" onclick="moveItem('services',${i},-1)">↑</button><button class="secondary" type="button" onclick="moveItem('services',${i},1)">↓</button><button class="danger" type="button" onclick="deleteItem('services',${i})">Delete</button></div></div>${input('Service title',`services.${i}.title`,s.title)}${input('Description',`services.${i}.description`,s.description,true)}</div>`).join('')}</div>`;
 if(tab==='navigation')p.innerHTML=`<div class="card"><div class="addbar"><div><h2>Navigation</h2><p class="muted">Control the main menu. Use links such as <code>#work</code>, <code>#about</code>, or full URLs.</p></div><button class="edit" type="button" onclick="addNavigation()">+ Add Link</button></div>${state.navigation.map((n,i)=>`<div class="nav-admin"><div class="item-head"><strong>${esc(n.label||'New Link')}</strong><div class="actions"><button class="secondary" type="button" onclick="moveItem('navigation',${i},-1)">↑</button><button class="secondary" type="button" onclick="moveItem('navigation',${i},1)">↓</button><button class="danger" type="button" onclick="deleteItem('navigation',${i})">Delete</button></div></div><div class="two">${input('Label',`navigation.${i}.label`,n.label)}${input('Link / URL',`navigation.${i}.href`,n.href)}</div></div>`).join('')}</div>`;
 if(tab==='socials')p.innerHTML=`<div class="card"><div class="addbar"><div><h2>Social Links</h2><p class="muted">Add Instagram, LinkedIn, Pinterest, Behance or any other platform. These links appear in the contact/footer areas.</p></div><button class="edit" type="button" onclick="addSocial()">+ Add Social</button></div>${state.socials.map((s,i)=>`<div class="nav-admin"><div class="item-head"><strong>${esc(s.label||'New Social')}</strong><div class="actions"><button class="secondary" type="button" onclick="moveItem('socials',${i},-1)">↑</button><button class="secondary" type="button" onclick="moveItem('socials',${i},1)">↓</button><button class="danger" type="button" onclick="deleteItem('socials',${i})">Delete</button></div></div><div class="two">${input('Platform name',`socials.${i}.label`,s.label)}${input('Profile URL',`socials.${i}.url`,s.url)}</div></div>`).join('')}</div>`;
 if(tab==='theme')p.innerHTML=`<div class="card"><h2>Colors</h2><div class="two">${input('Accent color','settings.accent',val('settings.accent'))}${input('Dark / ink color','settings.dark',val('settings.dark'))}</div>${input('Light / paper color','settings.light',val('settings.light'))}</div><div class="card"><h2>Typography</h2>${input('Body font stack','settings.font',val('settings.font'))}${input('Heading font stack','settings.headingFont',val('settings.headingFont'))}<p class="muted">Example: <code>DM Sans, system-ui, sans-serif</code> or a web-safe/system font stack.</p></div><div class="card"><h2>Layout & shape</h2><div class="two">${input('Maximum content width (px)','settings.maxWidth',val('settings.maxWidth'))}${input('Button corner radius (px)','settings.buttonRadius',val('settings.buttonRadius'))}</div><div class="two">${input('Card corner radius (px)','settings.cardRadius',val('settings.cardRadius'))}${input('Image corner radius (px)','settings.imageRadius',val('settings.imageRadius'))}</div>${checkbox('Use grayscale effect on hero/project images','settings.grayscaleImages',val('settings.grayscaleImages'))}<p class="muted">Changes affect the public website after you save to GitHub.</p></div>`;
 if(tab==='seo')p.innerHTML=`<div class="card"><h2>SEO & sharing</h2>${input('Browser / search title','seo.title',val('seo.title'))}${input('Meta description','seo.description',val('seo.description'),true)}${input('Social sharing image path or URL','seo.socialImage',val('seo.socialImage'))}${input('Favicon path or URL','seo.favicon',val('seo.favicon'))}<p class="muted">Use a landscape social image for link previews. A local asset can be stored under <code>assets/media/</code>.</p></div><div class="card"><h2>Contact enquiry</h2>${checkbox('Enable mailto project enquiry button','contactForm.enabled',val('contactForm.enabled'))}${input('Button label','contactForm.buttonLabel',val('contactForm.buttonLabel'))}${input('Email subject','contactForm.emailSubject',val('contactForm.emailSubject'))}<p class="muted">This keeps the site fully static: enquiries open the visitor's email client rather than requiring a paid form backend.</p></div>`;
 if(tab==='visibility')p.innerHTML=`<div class="card"><h2>Homepage sections</h2><p class="muted">Hide sections without deleting their content. You can turn them back on at any time.</p>${checkbox('Show Hero','visibility.showHero',val('visibility.showHero'))}${checkbox('Show Projects','visibility.showProjects',val('visibility.showProjects'))}${checkbox('Show About','visibility.showAbout',val('visibility.showAbout'))}${checkbox('Show Services','visibility.showServices',val('visibility.showServices'))}${checkbox('Show Testimonials','visibility.showTestimonials',val('visibility.showTestimonials'))}${checkbox('Show Contact','visibility.showContact',val('visibility.showContact'))}${checkbox('Show all projects','visibility.showAllProjects',val('visibility.showAllProjects'))}</div>`;
 if(tab==='advanced')p.innerHTML=`<div class="card"><h2>Advanced JSON</h2><p class="muted">Master editor for future fields. Normal site management should use the visual controls above.</p><div class="field"><label>Complete site.json</label><textarea id="jsonEditor" class="json-editor">${esc(JSON.stringify(state,null,2))}</textarea></div><div class="actions"><button class="edit" type="button" onclick="applyJson()">Apply JSON changes</button><button class="secondary" type="button" onclick="downloadBackup()">Download Backup</button></div><p class="muted">Keep a backup before major edits. The backup contains your content settings and image paths, not your GitHub token.</p></div>`;
}

function projectEditor(x,i){
 const gallery=Array.isArray(x.gallery)?x.gallery:[];
 return `<div class="project-card"><div class="item-head"><strong>${esc(x.title||'New Project')}</strong><div class="actions"><button class="secondary" type="button" onclick="moveItem('projects',${i},-1)">↑</button><button class="secondary" type="button" onclick="moveItem('projects',${i},1)">↓</button><button class="danger" type="button" onclick="deleteProject(${i})">Delete</button></div></div><div class="two">${input('Title',`projects.${i}.title`,x.title)}${input('Category',`projects.${i}.category`,x.category)}</div><div class="two">${input('Year',`projects.${i}.year`,x.year)}${input('Client',`projects.${i}.client`,x.client)}</div><div class="two">${input('Designer / role',`projects.${i}.role`,x.role)}${input('View More button label',`projects.${i}.viewMoreLabel`,x.viewMoreLabel||'View More')}</div>${input('Short description',`projects.${i}.description`,x.description,true)}${input('Overview',`projects.${i}.overview`,x.overview,true)}<div class="two">${input('Challenge',`projects.${i}.challenge`,x.challenge,true)}${input('Strategy / process',`projects.${i}.strategy`,x.strategy,true)}</div><div class="two">${input('Solution',`projects.${i}.solution`,x.solution,true)}${input('Results',`projects.${i}.results`,x.results,true)}</div>${input('View More URL (Pinterest / Behance)',`projects.${i}.viewMoreUrl`,x.viewMoreUrl||'')}${checkbox('Featured project',`projects.${i}.featured`,!!x.featured)}<div class="preview"><img src="${esc(x.image||'')||'assets/project-01.svg'}" alt=""><div><div class="muted">Cover image</div><div class="upload"><input type="file" accept="image/*" data-upload-path="projects.${i}.image"><button class="secondary" type="button" onclick="handleUpload(this)">Upload cover</button></div></div></div><div class="gallery-admin"><div class="addbar"><div><h3>Additional project images</h3><p class="muted">These appear after the cover image. Each image has its own title.</p></div><button class="edit" type="button" onclick="addGalleryImage(${i})">+ Add Image</button></div>${gallery.length?gallery.map((g,j)=>galleryEditor(i,j,g)).join(''):`<p class="muted">No additional images yet.</p>`}</div></div>`;
}
function galleryEditor(i,j,g){return `<div class="gallery-admin-item"><div class="gallery-admin-thumb"><img src="${esc(g.image||'assets/project-01.svg')}" alt=""></div><div class="gallery-admin-fields">${input('Image title',`projects.${i}.gallery.${j}.title`,g.title||'') }<div class="upload"><input type="file" accept="image/*" data-upload-path="projects.${i}.gallery.${j}.image"><button class="secondary" type="button" onclick="handleUpload(this)">Replace image</button></div></div><button class="danger" type="button" onclick="deleteGalleryImage(${i},${j})">Delete</button></div>`}
function clientInput(label,i,field,value,multi=false){return `<div class="field"><label>${label}</label>${multi?`<textarea data-client-path="${i}.${field}">${esc(value)}</textarea>`:`<input data-client-path="${i}.${field}" value="${esc(value)}">`}</div>`}
function collectClients(){document.querySelectorAll('[data-client-path]').forEach(e=>{const [i,...parts]=e.dataset.clientPath.split('.');const field=parts.join('.');clientData.clients[Number(i)][field]=e.value})}
function clientEditor(x,i){
  return `<div class="client-card"><div class="item-head"><div><strong>${esc(x.name||'New Client')}</strong><div class="client-code">${esc(x.code||'No code')}</div></div><div class="actions"><button class="${x.active!==false?'secondary':'edit'}" type="button" onclick="toggleClient(${i})">${x.active!==false?'Deactivate':'Activate'}</button><button class="danger" type="button" onclick="deleteClient(${i})">Delete</button></div></div><div class="two">${clientInput('Client name',i,'name',x.name||'')}${clientInput('Project name',i,'project',x.project||'')}</div>${clientInput('Client page description',i,'description',x.description||'',true)}<div class="client-code-row"><span>Access code</span><code>${esc(x.code)}</code><button class="secondary" type="button" onclick="copyClientLink(${i})">Copy Client Link</button><button class="secondary" type="button" onclick="regenerateClientCode(${i})">New Code</button></div><div class="client-files"><div class="addbar"><div><h3>Design files</h3><p class="muted">Upload PDFs, JPGs, PNGs, ZIPs and other client deliverables. Keep each file under 25 MB for reliable browser uploads.</p></div><label class="edit file-button">+ Add File<input type="file" hidden onchange="handleClientFile(this,${i})"></label></div>${x.files.length?x.files.map((f,j)=>`<div class="client-file"><div><strong>${esc(f.name)}</strong><span>${formatBytes(f.size||0)}</span></div><button class="danger" type="button" onclick="deleteClientFile(${i},${j})">Delete</button></div>`).join(''):'<p class="muted">No files uploaded yet.</p>'}</div></div>`;
}
function setClientPath(i,field,value){clientData.clients[i][field]=value}
window.addClient=()=>{collect();collectClients();clientData.clients.push({id:uid('client'),code:clientCode(),name:'New Client',project:'New Project',description:'Your design files are ready.',active:true,files:[]});clientDirty=true;render();notice('Client added. Save to GitHub when you are finished.')}
window.toggleClient=i=>{collectClients();clientData.clients[i].active=clientData.clients[i].active===false;clientDirty=true;render();notice(`Client ${clientData.clients[i].active?'activated':'deactivated'}. Save to GitHub to publish.`)}
window.deleteClient=async i=>{collectClients();const c=clientData.clients[i];if(!confirm(`Delete “${c.name||'this client'}” and all of their portal files?`))return;try{for(const f of c.files||[])await deleteRepoFile(f.path)}catch(e){notice(e.message||'Some files could not be deleted.',false)}clientData.clients.splice(i,1);clientDirty=true;render();notice('Client deleted. Save to GitHub to publish.')}
window.regenerateClientCode=i=>{collectClients();clientData.clients[i].code=clientCode();clientDirty=true;render();notice('New access code generated. The old code no longer works after saving.')}
window.copyClientLink=i=>{collectClients();const c=clientData.clients[i];const base=new URL(state.portal.path||'client-portal.html',location.href);base.searchParams.set('code',c.code);navigator.clipboard?.writeText(base.href);notice('Client link copied.')}
window.handleClientFile=async(inputEl,i)=>{const file=inputEl.files?.[0];if(!file)return;const c=clientData.clients[i];const btn=inputEl.closest('.file-button');if(btn)btn.classList.add('busy');try{const result=await uploadRawFile(file,`client-files/${c.id}`);c.files.push({id:uid('file'),name:result.name,path:result.path,size:result.size});clientDirty=true;render();notice('Client file uploaded. Save to GitHub to publish the client record.')}catch(e){notice(e.message||'File upload failed.',false)}finally{if(btn)btn.classList.remove('busy');inputEl.value=''}}
window.deleteClientFile=async(i,j)=>{collectClients();const f=clientData.clients[i].files[j];if(!confirm(`Delete “${f.name}”?`))return;try{await deleteRepoFile(f.path)}catch(e){notice(e.message||'Could not delete file.',false);return}clientData.clients[i].files.splice(j,1);clientDirty=true;render();notice('File deleted. Save to GitHub to publish.')}
function testimonialEditor(x,i){return `<div class="testimonial-card"><div class="item-head"><strong>${esc(x.name||'New Testimonial')}</strong><button class="danger" type="button" onclick="deleteTestimonial(${i})">Delete</button></div>${input('Quote',`testimonials.${i}.quote`,x.quote,true)}<div class="two">${input('Client name',`testimonials.${i}.name`,x.name)}${input('Role / company',`testimonials.${i}.role`,x.role)}</div>${x.photo?`<div class="preview testimonial-photo-preview"><img src="${esc(x.photo)}" alt="Client photo"><span class="muted">Current client photo</span></div>`:''}${fileControl('Client photo (optional)',`testimonials.${i}.photo`,`testimonials.${i}.photoEnabled`)}<button class="danger" type="button" onclick="removeTestimonialPhoto(${i})">Delete client photo</button></div>`}
function arrayAt(path){return path.split('.').reduce((a,k)=>a[k],state)}
window.moveItem=(path,i,dir)=>{collect();const arr=arrayAt(path);const j=i+dir;if(!Array.isArray(arr)||j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];render();notice('Order changed. Press Save to GitHub to publish.')}
window.deleteItem=(path,i)=>{collect();const arr=arrayAt(path);if(!Array.isArray(arr)||!arr[i])return;if(!confirm('Delete this item?'))return;arr.splice(i,1);render();notice('Item deleted. Press Save to GitHub to publish.')}
window.addService=()=>{collect();state.services.push({title:'New Service',description:'Service description.'});render();notice('Service added. Fill it in, then Save to GitHub.')}
window.addNavigation=()=>{collect();state.navigation.push({label:'New Link',href:'#'});render();notice('Navigation link added.')}
window.addSocial=()=>{collect();state.socials.push({label:'New Social',url:'https://'});render();notice('Social link added.')}
window.addStat=()=>{collect();state.about.stats.push({value:'0+',label:'New Stat'});render();notice('Stat added.')}

window.addProject=()=>{collect();state.projects.push({id:uid('project'),title:'New Project',category:'Category',year:String(new Date().getFullYear()),client:'',role:'Graphic Designer / Art Director',description:'Project description.',overview:'Project overview.',challenge:'',strategy:'',solution:'',results:'',image:'assets/project-01.svg',gallery:[],featured:false,viewMoreLabel:'View More',viewMoreUrl:''});render();notice('Project added. Fill it in, then Save to GitHub.')}
window.deleteProject=i=>{if(!confirm(`Delete “${state.projects[i].title||'this project'}”?`))return;collect();state.projects.splice(i,1);render();notice('Project deleted. Press Save to GitHub to publish.')}

window.addGalleryImage=(i)=>{collect();state.projects[i].gallery ||= [];state.projects[i].gallery.push({id:uid('gallery'),image:'',title:`Image ${state.projects[i].gallery.length+1}`});render();notice('Gallery image slot added. Upload an image, give it a title, then Save to GitHub.')}
window.deleteGalleryImage=async(i,j)=>{if(!confirm('Delete this gallery image?'))return;collect();const item=state.projects[i].gallery[j];const old=item?.image;state.projects[i].gallery.splice(j,1);try{await deleteFile(old)}catch(e){}render();notice('Gallery image deleted. Press Save to GitHub to publish.')}
window.addTestimonial=()=>{collect();state.testimonials.push({quote:'A great experience working together.',name:'Client Name',role:'Role, Company',photo:'',photoEnabled:true});render();notice('Testimonial added. Fill it in, then Save to GitHub.')}

window.removeTestimonialPhoto=async(i)=>{if(!confirm('Delete this client photo?'))return;collect();const old=state.testimonials[i]?.photo;state.testimonials[i].photo='';state.testimonials[i].photoEnabled=false;try{await deleteFile(old)}catch(e){}render();notice('Client photo removed. Press Save to GitHub to publish.')}
window.deleteTestimonial=i=>{if(!confirm(`Delete testimonial from “${state.testimonials[i].name||'this client'}”?`))return;collect();state.testimonials.splice(i,1);render();notice('Testimonial deleted. Press Save to GitHub to publish.')}
window.removeLogo=async()=>{if(!confirm('Delete the logo and hide it from the site?'))return;collect();const old=state.logo.image;state.logo.image='';state.logo.enabled=false;try{await deleteFile(old)}catch(e){}render();notice('Logo removed. Press Save to GitHub to publish.')}
window.removeHeroPortrait=async()=>{if(!confirm('Delete the hero portrait and hide it from the site?'))return;collect();const old=state.hero.heroImage;state.hero.heroImage='';state.hero.portraitEnabled=false;try{await deleteFile(old)}catch(e){}render();notice('Hero portrait removed. Press Save to GitHub to publish.')}
window.applyJson=()=>{try{state=JSON.parse($('#jsonEditor').value);normalize();dirty=true;render();notice('JSON is valid. Press Save to GitHub to publish.')}catch(e){notice('Invalid JSON: '+e.message,false)}};
window.downloadBackup=()=>{collect();const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='portfolio-site-backup.json';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);notice('Backup downloaded.');};
async function save(){collect();collectClients();$('#save').disabled=true;$('#save').textContent='Saving…';try{
  const content=JSON.stringify(state,null,2);
  const r=await api(`/repos/${owner}/${repo}/contents/data/site.json`,{method:'PUT',body:JSON.stringify({message:'Update portfolio content and client portal settings',content:b64(content),sha,branch:'main'})});
  if(!r.ok)throw new Error(await r.text()); const j=await r.json(); sha=j.content.sha;
  const clientContent=JSON.stringify(clientData,null,2);
  const cr=await api(`/repos/${owner}/${repo}/contents/data/clients.json`,{method:'PUT',body:JSON.stringify({message:'Update client portal records',content:b64(clientContent),...(clientSha?{sha:clientSha}:{}),branch:'main'})});
  if(!cr.ok)throw new Error(await cr.text()); const cj=await cr.json(); clientSha=cj.content.sha;
  dirty=false;clientDirty=false;$('#save').textContent='Saved ✓';notice('Published to GitHub. GitHub Pages may take a short moment to update.');
}catch(e){$('#save').textContent='Save to GitHub';notice('Save failed: '+e.message,false)}finally{setTimeout(()=>{$('#save').disabled=false;if($('#save').textContent==='Saved ✓')$('#save').textContent='Save to GitHub'},1800)}}
$('#connect').onclick=async()=>{owner=$('#owner').value.trim();repo=$('#repo').value.trim();token=$('#token').value.trim();if(!owner||!repo||!token)return alert('Enter your GitHub username, repository and token.');try{await getFile();sessionStorage.setItem('gh_owner',owner);sessionStorage.setItem('gh_repo',repo);sessionStorage.setItem('gh_token',token);$('#login').classList.add('hidden');$('#dashboard').classList.remove('hidden');render()}catch(e){alert(e.message)}};
document.addEventListener('input',e=>{if(e.target.matches('[data-client-path]'))clientDirty=true;else dirty=true});document.addEventListener('change',e=>{if(e.target.matches('[data-client-path]'))clientDirty=true;else dirty=true});window.addEventListener('beforeunload',e=>{if(dirty||clientDirty){e.preventDefault();e.returnValue=''}});$('#logout').onclick=()=>{if((dirty||clientDirty)&&!confirm('You have unsaved changes. Disconnect anyway?'))return;sessionStorage.clear();location.reload()};$('#save').onclick=save;
document.querySelectorAll('aside nav button').forEach(b=>{b.type='button';b.addEventListener('click',()=>{try{collect();collectClients();tab=b.dataset.tab;document.querySelectorAll('aside nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');render()}catch(e){console.error(e);notice('Could not open this section: '+(e.message||e),false)}})});
(async()=>{owner=sessionStorage.getItem('gh_owner')||'';repo=sessionStorage.getItem('gh_repo')||'';token=sessionStorage.getItem('gh_token')||'';if(owner&&repo&&token){try{await getFile();$('#login').classList.add('hidden');$('#dashboard').classList.remove('hidden');render()}catch(e){sessionStorage.clear()}}if(!$('#login').classList.contains('hidden')){$('#owner').value=owner;$('#repo').value=repo}})();
