const $=s=>document.querySelector(s);
let state=null,owner='',repo='',token='',sha='',tab='overview';
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
async function getFile(){const r=await api(`/repos/${owner}/${repo}/contents/data/site.json?ref=main`);if(!r.ok)throw new Error('Could not read data/site.json. Check the repository, branch and token permissions.');const j=await r.json();sha=j.sha;state=JSON.parse(from64(j.content.replace(/\n/g,'')));normalize()}
function normalize(){state.site ||= {};state.hero ||= {};state.projects ||= [];state.testimonials ||= [];state.about ||= {stats:[]};state.services ||= [];state.socials ||= [];state.navigation ||= [];state.settings ||= {};state.logo ||= {enabled:false,image:''};state.footer ||= {enabled:true,text:'Designed & built with intention.',copyright:'© {year} {name}',showNavigation:true,showSocials:true};state.hero.portraitEnabled = state.hero.portraitEnabled!==false;state.hero.heroImage ||= '';state.logo.enabled=state.logo.enabled===true}
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
 $('#pageTitle').textContent=({site:'Site & Hero',projects:'Projects',testimonials:'Testimonials',footer:'Footer',about:'About',services:'Services',theme:'Theme',advanced:'Advanced JSON',overview:'Overview'})[tab]||tab;
 const p=$('#panel');
 if(tab==='overview')p.innerHTML=`<div class="stats"><div class="stat"><div class="eyebrow">Projects</div><b>${state.projects.length}</b></div><div class="stat"><div class="eyebrow">Testimonials</div><b>${state.testimonials.length}</b></div><div class="stat"><div class="eyebrow">Hero portrait</div><b>${state.hero.portraitEnabled&&state.hero.heroImage?'On':'Off'}</b></div><div class="stat"><div class="eyebrow">Logo</div><b>${state.logo.enabled&&state.logo.image?'On':'Off'}</b></div></div><div class="card"><h2>Your CMS controls</h2><p class="muted">Use Projects and Testimonials to add or delete entries. Use Site & Hero to upload/remove your portrait and optional 16×16 logo. Footer controls everything shown at the bottom of the public site.</p></div>`;
 if(tab==='site')p.innerHTML=`<div class="card"><h2>Site identity</h2>${input('Name','site.name',val('site.name'))}${input('Short name / fallback logo','site.shortName',val('site.shortName'))}${input('Professional title','site.role',val('site.role'))}${input('Tagline','site.tagline',val('site.tagline'),true)}${input('Email','site.email',val('site.email'))}${input('Location','site.location',val('site.location'))}${input('Availability','site.availability',val('site.availability'))}</div><div class="card"><h2>16 × 16 logo</h2>${state.logo.image?`<div class="preview"><img src="${esc(state.logo.image)}" width="16" height="16" alt="Logo"><span class="muted">Current logo</span></div>`:''}${fileControl('Logo image','logo.image','logo.enabled')}<button class="danger" type="button" onclick="removeLogo()">Delete logo & hide it</button></div><div class="card"><h2>Hero</h2>${input('Eyebrow','hero.eyebrow',val('hero.eyebrow'))}${input('Hero title','hero.title',val('hero.title'))}${input('Hero description','hero.description',val('hero.description'),true)}${input('Primary button','hero.primaryCta',val('hero.primaryCta'))}${input('Secondary button','hero.secondaryCta',val('hero.secondaryCta'))}${state.hero.heroImage?`<div class="preview"><img src="${esc(state.hero.heroImage)}" alt="Hero portrait"><span class="muted">Current hero portrait</span></div>`:''}${fileControl('Hero portrait','hero.heroImage','hero.portraitEnabled')}<button class="danger" type="button" onclick="removeHeroPortrait()">Delete portrait & hide it</button></div>`;
 if(tab==='projects')p.innerHTML=`<div class="card"><div class="addbar"><div><h2>Projects</h2><p class="muted">Add, edit or delete projects without touching code.</p></div><button class="edit" type="button" onclick="addProject()">+ Add Project</button></div>${state.projects.map((x,i)=>projectEditor(x,i)).join('')}</div>`;
 if(tab==='testimonials')p.innerHTML=`<div class="card"><div class="addbar"><div><h2>Testimonials</h2><p class="muted">Add or delete client testimonials from the dashboard.</p></div><button class="edit" type="button" onclick="addTestimonial()">+ Add Testimonial</button></div>${state.testimonials.map((x,i)=>testimonialEditor(x,i)).join('')}</div>`;
 if(tab==='footer')p.innerHTML=`<div class="card"><h2>Footer</h2>${checkbox('Show footer','footer.enabled',val('footer.enabled'))}${input('Footer text','footer.text',val('footer.text'),true)}${input('Copyright template','footer.copyright',val('footer.copyright'))}${checkbox('Show footer navigation','footer.showNavigation',val('footer.showNavigation'))}${checkbox('Show footer social links','footer.showSocials',val('footer.showSocials'))}<p class="muted">Use <code>{year}</code> and <code>{name}</code> in the copyright field. The year and your site name are filled automatically.</p></div><div class="card"><h3>Footer navigation</h3>${state.navigation.map((n,i)=>`<div class="two">${input('Label',`navigation.${i}.label`,n.label)}${input('Link',`navigation.${i}.href`,n.href)}</div>`).join('')}</div><div class="card"><h3>Social links</h3>${state.socials.map((s,i)=>`<div class="two">${input('Platform',`socials.${i}.label`,s.label)}${input('URL',`socials.${i}.url`,s.url)}</div>`).join('')}</div>`;
 if(tab==='about')p.innerHTML=`<div class="card">${input('Eyebrow','about.eyebrow',val('about.eyebrow'))}${input('Title','about.title',val('about.title'))}${input('About text','about.text',val('about.text'),true)}<h3>Stats</h3>${state.about.stats.map((s,i)=>`<div class="two">${input('Value',`about.stats.${i}.value`,s.value)}${input('Label',`about.stats.${i}.label`,s.label)}</div>`).join('')}</div>`;
 if(tab==='services')p.innerHTML=`<div class="card">${state.services.map((s,i)=>`<div class="two">${input('Title',`services.${i}.title`,s.title)}${input('Description',`services.${i}.description`,s.description,true)}</div>`).join('')}</div>`;
 if(tab==='theme')p.innerHTML=`<div class="card"><h2>Visual system</h2><div class="two">${input('Accent color','settings.accent',val('settings.accent'))}${input('Dark color','settings.dark',val('settings.dark'))}</div>${input('Light / paper color','settings.light',val('settings.light'))}${input('Font stack','settings.font',val('settings.font'))}</div>`;
 if(tab==='advanced')p.innerHTML=`<div class="card"><p class="muted">Master editor for future fields. Normal site management should use the visual controls above.</p><div class="field"><label>Complete site.json</label><textarea id="jsonEditor" class="json-editor">${esc(JSON.stringify(state,null,2))}</textarea></div><button class="edit" type="button" onclick="applyJson()">Apply JSON changes</button></div>`;
}
function projectEditor(x,i){return `<div class="project-card"><div class="item-head"><strong>${esc(x.title||'New Project')}</strong><div class="actions"><button class="danger" type="button" onclick="deleteProject(${i})">Delete</button></div></div><div class="two">${input('Title',`projects.${i}.title`,x.title)}${input('Category',`projects.${i}.category`,x.category)}</div><div class="two">${input('Year',`projects.${i}.year`,x.year)}${input('Project link',`projects.${i}.link`,x.link||'#')}</div>${input('Description',`projects.${i}.description`,x.description,true)}${checkbox('Featured project',`projects.${i}.featured`,!!x.featured)}<div class="preview"><img src="${esc(x.image||'')||'assets/project-01.svg'}" alt=""><div><div class="muted">Image</div><div class="upload"><input type="file" accept="image/*" data-upload-path="projects.${i}.image"><button class="secondary" type="button" onclick="handleUpload(this)">Upload image</button></div></div></div></div>`}
function testimonialEditor(x,i){return `<div class="testimonial-card"><div class="item-head"><strong>${esc(x.name||'New Testimonial')}</strong><button class="danger" type="button" onclick="deleteTestimonial(${i})">Delete</button></div>${input('Quote',`testimonials.${i}.quote`,x.quote,true)}<div class="two">${input('Client name',`testimonials.${i}.name`,x.name)}${input('Role / company',`testimonials.${i}.role`,x.role)}</div></div>`}
window.addProject=()=>{collect();state.projects.push({id:uid('project'),title:'New Project',category:'Category',year:String(new Date().getFullYear()),description:'Project description.',image:'assets/project-01.svg',featured:false,link:'#'});render();notice('Project added. Fill it in, then Save to GitHub.')}
window.deleteProject=i=>{if(!confirm(`Delete “${state.projects[i].title||'this project'}”?`))return;collect();state.projects.splice(i,1);render();notice('Project deleted. Press Save to GitHub to publish.')}
window.addTestimonial=()=>{collect();state.testimonials.push({quote:'A great experience working together.',name:'Client Name',role:'Role, Company'});render();notice('Testimonial added. Fill it in, then Save to GitHub.')}
window.deleteTestimonial=i=>{if(!confirm(`Delete testimonial from “${state.testimonials[i].name||'this client'}”?`))return;collect();state.testimonials.splice(i,1);render();notice('Testimonial deleted. Press Save to GitHub to publish.')}
window.removeLogo=async()=>{if(!confirm('Delete the logo and hide it from the site?'))return;collect();const old=state.logo.image;state.logo.image='';state.logo.enabled=false;try{await deleteFile(old)}catch(e){}render();notice('Logo removed. Press Save to GitHub to publish.')}
window.removeHeroPortrait=async()=>{if(!confirm('Delete the hero portrait and hide it from the site?'))return;collect();const old=state.hero.heroImage;state.hero.heroImage='';state.hero.portraitEnabled=false;try{await deleteFile(old)}catch(e){}render();notice('Hero portrait removed. Press Save to GitHub to publish.')}
window.applyJson=()=>{try{state=JSON.parse($('#jsonEditor').value);normalize();render();notice('JSON is valid. Press Save to GitHub to publish.')}catch(e){notice('Invalid JSON: '+e.message,false)}};
async function save(){collect();$('#save').disabled=true;$('#save').textContent='Saving…';try{const content=JSON.stringify(state,null,2);const r=await api(`/repos/${owner}/${repo}/contents/data/site.json`,{method:'PUT',body:JSON.stringify({message:'Update portfolio content',content:b64(content),sha,branch:'main'})});if(!r.ok)throw new Error(await r.text());const j=await r.json();sha=j.content.sha;$('#save').textContent='Saved ✓';notice('Published to GitHub. GitHub Pages may take a short moment to update.')}catch(e){$('#save').textContent='Save to GitHub';notice('Save failed: '+e.message,false)}finally{setTimeout(()=>{$('#save').disabled=false;if($('#save').textContent==='Saved ✓')$('#save').textContent='Save to GitHub'},1800)}}
$('#connect').onclick=async()=>{owner=$('#owner').value.trim();repo=$('#repo').value.trim();token=$('#token').value.trim();if(!owner||!repo||!token)return alert('Enter your GitHub username, repository and token.');try{await getFile();sessionStorage.setItem('gh_owner',owner);sessionStorage.setItem('gh_repo',repo);sessionStorage.setItem('gh_token',token);$('#login').classList.add('hidden');$('#dashboard').classList.remove('hidden');render()}catch(e){alert(e.message)}};
$('#logout').onclick=()=>{sessionStorage.clear();location.reload()};$('#save').onclick=save;
document.querySelectorAll('aside nav button').forEach(b=>b.onclick=()=>{collect();tab=b.dataset.tab;document.querySelectorAll('aside nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');render()});
(async()=>{owner=sessionStorage.getItem('gh_owner')||'';repo=sessionStorage.getItem('gh_repo')||'';token=sessionStorage.getItem('gh_token')||'';if(owner&&repo&&token){try{await getFile();$('#login').classList.add('hidden');$('#dashboard').classList.remove('hidden');render()}catch(e){sessionStorage.clear()}}if(!$('#login').classList.contains('hidden')){$('#owner').value=owner;$('#repo').value=repo}})();
