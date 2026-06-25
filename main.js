
(function(){
  const track = (eventName, params = {}) => {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, {
      page_path: window.location.pathname,
      ...params
    });
  };

  const classifyLink = url => {
    if (!url) return 'button';
    if (url.includes('lin.ee')) return 'line';
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('google.com/maps') || url.includes('maps.app.goo.gl')) return 'map';
    if (url.startsWith('mailto:')) return 'email';
    if (url.startsWith('tel:')) return 'phone';
    if (/^https?:\/\//i.test(url) && !url.includes(location.hostname)) return 'external';
    return 'internal';
  };

  const b=document.getElementById('menuBtn');
  const n=document.getElementById('navLinks');
  if(b&&n){
    b.addEventListener('click',()=>n.classList.toggle('open'));
    n.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>n.classList.remove('open')));
  }
  const y=document.getElementById('year');
  if(y) y.textContent=new Date().getFullYear();
  document.querySelectorAll('[data-backtop]').forEach(btn=>{
    btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  });
  document.addEventListener('click', event => {
    const target = event.target.closest('a, button');
    if (!target) return;
    const href = target.getAttribute('href') || '';
    const text = (target.textContent || target.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 80);
    const linkType = classifyLink(href);
    const eventName = linkType === 'line' ? 'line_click' : linkType === 'map' ? 'map_click' : 'site_click';
    track(eventName, {
      link_text: text || target.id || target.className || 'unknown',
      link_url: href,
      link_type: linkType
    });
  });
})();
