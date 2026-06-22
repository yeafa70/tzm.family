
const SHOP_CONFIG = {
  dataUrl: "shops.json",
  lineCardUrl: "https://lin.ee/rQzJS3i",
  defaultLogo: "pics/logo/default-logo.svg"
};

const FALLBACK_SHOPS = [
  {id:"shop001",name:"竹力小島咖啡",category:"美食餐飲",area:"竹南",offer:"憑福利卡享 95 折",description:"適合咖啡、甜點與朋友小聚。",address:"苗栗縣竹南鎮",map_url:"https://www.google.com/maps/search/?api=1&query=竹力小島咖啡",is_featured:true,is_active:true},
  {id:"shop002",name:"日常雜貨所",category:"生活雜貨",area:"頭份",offer:"憑福利卡享 9 折",description:"選物雜貨、家飾與生活小物。",address:"苗栗縣頭份市",map_url:"https://www.google.com/maps/search/?api=1&query=日常雜貨所",is_featured:true,is_active:true},
  {id:"shop003",name:"漫坪綠園",category:"休閒娛樂",area:"頭份",offer:"憑福利卡享 9 折",description:"放鬆散步、聚會與小型活動空間。",address:"苗栗縣頭份市",map_url:"https://www.google.com/maps/search/?api=1&query=漫坪綠園",is_featured:true,is_active:true},
  {id:"shop004",name:"風城草木生活館",category:"住宿旅遊",area:"新竹",offer:"憑福利卡享 9 折",description:"空間體驗、旅宿與選物複合店。",address:"新竹市",map_url:"https://www.google.com/maps/search/?api=1&query=風城草木生活館",is_featured:true,is_active:true}
];

let shops = [];
const $ = id => document.getElementById(id);

function normalizeShop(r){
  return {
    id:r.id||r.shop_id||"",
    name:r.name||r.shop_name||"",
    category:r.category||"其他",
    area:r.area||"未分類",
    offer:r.offer||r.discount||"請依店家現場公告為準。",
    description:r.description||r.desc||"",
    address:r.address||"",
    phone:r.phone||"",
    map_url:r.map_url||r.mapUrl||"",
    website_url:r.website_url||r.websiteUrl||"",
    facebook_url:r.facebook_url||r.facebookUrl||"",
    instagram_url:r.instagram_url||r.instagramUrl||"",
    logo:r.logo||SHOP_CONFIG.defaultLogo,
    is_featured:Boolean(r.is_featured),
    is_active:r.is_active!==false
  };
}

async function loadShops(){
  try{
    const res = await fetch(SHOP_CONFIG.dataUrl,{cache:'no-store'});
    if(!res.ok) throw new Error('load failed');
    const data = await res.json();
    shops = (Array.isArray(data)?data:(data.shops||[])).map(normalizeShop).filter(s=>s.is_active);
  }catch(e){
    shops = FALLBACK_SHOPS.map(normalizeShop);
  }
  if($('shopGrid')) initShopDirectory();
  if($('featuredShopGrid')) renderFeaturedShops();
}

function uniqueValues(k){
  return [...new Set(shops.map(s=>s[k]).filter(Boolean))].sort();
}

function initShopDirectory(){
  const cs = uniqueValues('category');
  const as = uniqueValues('area');
  $('categorySelect').innerHTML = '<option value="">全部分類</option>' + cs.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
  $('areaSelect').innerHTML = '<option value="">全部地區</option>' + as.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
  $('categoryChips').innerHTML = `<button class="chip active" type="button" data-category="">全部</button>` + cs.map(v=>`<button class="chip" type="button" data-category="${esc(v)}">${esc(v)}</button>`).join('');
  document.querySelectorAll('.chip').forEach(c=>c.addEventListener('click',()=>{
    const cat = c.dataset.category || '';
    $('categorySelect').value = cat;
    document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
    c.classList.add('active');
    renderShops();
  }));
  $('searchInput').addEventListener('input',renderShops);
  $('categorySelect').addEventListener('change',()=>{
    const v = $('categorySelect').value;
    document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active',(c.dataset.category||'')===v));
    renderShops();
  });
  $('areaSelect').addEventListener('change',renderShops);
  $('resetBtn').addEventListener('click',()=>{
    $('searchInput').value='';
    $('categorySelect').value='';
    $('areaSelect').value='';
    document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active',!c.dataset.category));
    renderShops();
  });
  renderShops();
}

function getFiltered(){
  const q = $('searchInput').value.trim().toLowerCase();
  const cat = $('categorySelect').value;
  const area = $('areaSelect').value;
  return shops.filter(s=>{
    const t = [s.name,s.category,s.area,s.offer,s.description,s.address].join(' ').toLowerCase();
    return (!q||t.includes(q)) && (!cat||s.category===cat) && (!area||s.area===area);
  });
}

function featuredCard(s){
  return `<article class="feature-card">
    <div class="feature-photo"></div>
    <div class="feature-content">
      <div class="feature-title">${esc(s.name)}</div>
      <div class="feature-meta">${esc(s.area)}</div>
      <div class="feature-tag-row">
        <span class="feature-tag">${esc(s.category)}</span>
        <span class="feature-tag">${esc(s.area)}</span>
      </div>
      <div class="feature-offer">${esc(s.offer)}</div>
    </div>
  </article>`;
}

function renderFeaturedShops(){
  const g = $('featuredShopGrid');
  if(!g) return;
  const list = shops.filter(s=>s.is_featured).slice(0,4);
  const useList = list.length ? list : shops.slice(0,4);
  g.innerHTML = useList.map(featuredCard).join('');
}

function renderShops(){
  const list = getFiltered(), g = $('shopGrid'), e = $('emptyState');
  if(!list.length){ g.innerHTML=''; e.style.display='block'; return; }
  e.style.display='none';
  g.innerHTML = list.map(shopCard).join('');
}

function shopCard(s){
  return `<article class="shop-card">
    <div class="shop-photo"></div>
    <div class="shop-content">
      <div class="shop-head">
        <div><h3>${esc(s.name)}</h3></div>
        <button class="mini-btn" type="button" onclick="shareShop('${js(s.id)}')">分享</button>
      </div>
      <div class="tags"><span class="tag">${esc(s.category)}</span><span class="tag area">${esc(s.area)}</span></div>
      <div class="offer">${esc(s.offer)}</div>
      <p class="shop-desc">${esc(s.description||'更多資訊請依店家公告為準。')}</p>
      <div class="shop-actions">
        <button class="mini-btn primary" type="button" onclick="openShop('${js(s.id)}')">看詳情</button>
        <a class="mini-btn" href="${attr(s.map_url||mapUrl(s.name))}" target="_blank" rel="noopener">導航</a>
      </div>
    </div>
  </article>`;
}

function openShop(id){
  const s=shops.find(x=>x.id===id);
  if(!s) return;
  $('modalTitle').textContent=s.name;
  $('modalMeta').textContent=`${s.area}｜${s.category}`;
  const links = [
    s.website_url?`<a class="btn btn-outline" href="${attr(s.website_url)}" target="_blank" rel="noopener">店家網站</a>`:'',
    s.facebook_url?`<a class="btn btn-outline" href="${attr(s.facebook_url)}" target="_blank" rel="noopener">Facebook</a>`:'',
    s.instagram_url?`<a class="btn btn-outline" href="${attr(s.instagram_url)}" target="_blank" rel="noopener">Instagram</a>`:''
  ].join('');
  $('modalBody').innerHTML = `<div class="offer">${esc(s.offer)}</div>
    <p>${esc(s.description||'更多資訊請依店家公告為準。')}</p>
    <p><b>地址：</b>${esc(s.address||'尚未提供')}</p>
    <p><b>電話：</b>${esc(s.phone||'尚未提供')}</p>
    <div class="shop-actions">
      <a class="btn btn-primary" href="${attr(s.map_url||mapUrl(s.name))}" target="_blank" rel="noopener">Google 地圖導航</a>
      ${links}
      <a class="btn btn-line" href="${SHOP_CONFIG.lineCardUrl}" target="_blank" rel="noopener">免費領福利卡</a>
    </div>
    <div class="notice">優惠內容、優惠期限與使用條件，請以店家現場公告或頭竹苗福利社最新公告為準。</div>`;
  $('shopModal').classList.add('open');
  $('shopModal').setAttribute('aria-hidden','false');
}

async function shareShop(id){
  const s=shops.find(x=>x.id===id);
  if(!s) return;
  const text=`我在頭竹苗福利社看到「${s.name}」優惠：${s.offer}`;
  const url=location.origin+location.pathname.replace(/[^/]*$/,'shops.html');
  if(navigator.share){
    try{ await navigator.share({title:s.name,text,url}); }catch(e){}
  }else{
    await navigator.clipboard.writeText(`${text}\n${url}`);
    alert('已複製分享文字');
  }
}
function mapUrl(k){return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(k)}`}
function esc(s){return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
function attr(s){return esc(s).replaceAll('`','&#096;')}
function js(s){return String(s||'').replaceAll('\\','\\\\').replaceAll("'","\\'")}

document.addEventListener('DOMContentLoaded',()=>{
  const c=$('modalClose'),m=$('shopModal');
  if(c&&m){
    c.addEventListener('click',()=>{m.classList.remove('open');m.setAttribute('aria-hidden','true')});
    m.addEventListener('click',e=>{ if(e.target===m){ m.classList.remove('open'); m.setAttribute('aria-hidden','true'); }});
  }
  loadShops();
});
