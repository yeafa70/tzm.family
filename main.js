
(function(){
  const trackGaEvent = (eventName, params = {}) => {
    if (typeof window.gtag !== 'function') return;
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );
    window.gtag('event', eventName, {
      page_path: window.location.pathname,
      ...cleanParams
    });
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
    const target = event.target.closest('[data-ga-event]');
    if (!target) return;
    const text = (target.dataset.gaCta || target.textContent || target.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 80);
    trackGaEvent(target.dataset.gaEvent, {
      cta_text: text,
      link_url: target.href || target.getAttribute('href') || undefined,
      section: target.dataset.gaSection || undefined
    });
  });
})();
