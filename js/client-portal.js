const $=s=>document.querySelector(s);
let site=null,clients=null;

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function formatBytes(bytes){if(bytes<1024)return `${bytes} B`;if(bytes<1024*1024)return `${(bytes/1024).toFixed(1)} KB`;return `${(bytes/(1024*1024)).toFixed(2)} MB`}
function normalizeCode(v){return String(v||'').trim().toUpperCase()}
function showMessage(text){$('#message').textContent=text}
function fileExt(name){const m=String(name||'').toLowerCase().match(/\.([a-z0-9]+)$/);return m?m[1]:''}
function isImage(name){return ['jpg','jpeg','png','webp','gif','svg','avif'].includes(fileExt(name))}
function fileUrl(path){return String(path||'').split('/').map(encodeURIComponent).join('/')}
function renderClient(client){
  $('#gate').classList.add('hidden');$('#clientPage').classList.remove('hidden');
  $('#clientName').textContent=client.name||'Client';
  $('#clientProject').textContent=client.project||'';
  $('#clientDescription').textContent=client.description||'Your design files are ready.';
  const files=$('#files');
  if(!client.files?.length){files.innerHTML='<div class="empty">No design files have been added yet. Please contact your designer.</div>';return}
  files.innerHTML=client.files.map(f=>{
    const url=fileUrl(f.path), image=isImage(f.name);
    return `<article class="file-card"><div class="file-preview">${image?`<img loading="lazy" src="${esc(url)}" alt="${esc(f.name)}">`:`<div class="file-icon">.${esc(fileExt(f.name)||'FILE').toUpperCase()}</div>`}</div><div class="file-info"><div class="file-name">${esc(f.name)}</div><div class="file-size">${formatBytes(Number(f.size)||0)}</div><a class="download" href="${esc(url)}" download>Download file ↓</a></div></article>`;
  }).join('');
}
async function init(){
  try{
    const [sr,cr]=await Promise.all([fetch('data/site.json',{cache:'no-store'}),fetch('data/clients.json',{cache:'no-store'})]);
    if(!sr.ok||!cr.ok)throw new Error('Portal data could not be loaded.');
    site=await sr.json();clients=await cr.json();
    $('#portalTitle').textContent=site.portal?.title||'Client Design Portal';
    $('#portalIntro').textContent=site.portal?.intro||'Enter the access code provided to you to view and download your designs.';
    if(site.portal?.enabled!==true){$('#gate').innerHTML='<div class="brand">BO / CLIENT PORTAL</div><div class="eyebrow">Unavailable</div><h1>Portal is currently offline.</h1><p>The client delivery portal has been temporarily disabled. Please contact your designer for assistance.</p>';return}
    const q=new URLSearchParams(location.search).get('code');if(q){$('#accessCode').value=normalizeCode(q);openCode(normalizeCode(q))}
  }catch(e){$('#gate').innerHTML='<div class="brand">BO / CLIENT PORTAL</div><h1>Could not load the portal.</h1><p>Please try again later or contact your designer.</p>'}
}
function openCode(code){
  const client=(clients?.clients||[]).find(c=>normalizeCode(c.code)===normalizeCode(code)&&c.active!==false);
  if(!client){showMessage('That access code is invalid or inactive. Please check the code and try again.');return}
  showMessage('');renderClient(client);
}
$('#codeForm').addEventListener('submit',e=>{e.preventDefault();openCode(normalizeCode($('#accessCode').value))});
$('#changeCode').addEventListener('click',()=>{history.replaceState({},'',location.pathname);$('#clientPage').classList.add('hidden');$('#gate').classList.remove('hidden');$('#accessCode').focus()});
init();
