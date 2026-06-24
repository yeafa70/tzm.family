
(function(){
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
})();
