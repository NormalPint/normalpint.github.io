(()=>{
  'use strict';
  document.documentElement.classList.add('js');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav=document.getElementById('nav');
  const burger=document.getElementById('burger');
  const sheet=document.getElementById('sheet');
  const remote=document.getElementById('remote');
  const hero=document.querySelector('.hero');
  let frame=0, hideTimer=0, menuOpen=false, pointerInRemote=false;
  const sections=[...document.querySelectorAll('#why,#structure,#dial,#focus,#hygiene,#compare,#routine,#price,#plan4w,#buy')];
  const tabs=[...document.querySelectorAll('.subnav a')];
  function menu(open){
    menuOpen=open;
    burger.setAttribute('aria-expanded',String(open));
    burger.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');
    sheet.classList.toggle('open',open);
    sheet.inert=!open;
    document.body.classList.toggle('sheet-open',open);
    if(open) sheet.querySelector('a')?.focus({preventScroll:true});
    else burger.focus({preventScroll:true});
  }
  burger.addEventListener('click',()=>menu(!menuOpen));
  sheet.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu(false)));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&menuOpen) menu(false);
    if(event.key==='Tab'&&menuOpen){
      const focusables=[burger,...sheet.querySelectorAll('a,button')];
      const first=focusables[0],last=focusables.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  function showRemote(delay=1100){
    clearTimeout(hideTimer);remote.classList.remove('hide');
    hideTimer=setTimeout(()=>{
      if(!pointerInRemote&&!remote.contains(document.activeElement)) remote.classList.add('hide');
    },delay);
  }
  remote.addEventListener('pointerenter',()=>{pointerInRemote=true;clearTimeout(hideTimer);remote.classList.remove('hide');});
  remote.addEventListener('pointerleave',()=>{pointerInRemote=false;showRemote();});
  remote.addEventListener('focusin',()=>remote.classList.remove('hide'));
  remote.addEventListener('focusout',()=>showRemote());
  const xpand=document.getElementById('xpand');
  const xpandFrame=xpand.querySelector('figure');
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function sync(){
    frame=0;
    const heroInView=hero.getBoundingClientRect().bottom>0;
    remote.classList.toggle('hero-guard',heroInView);
    remote.inert=heroInView;
    nav.classList.toggle('solid',scrollY>8);
    const toneNode=document.elementFromPoint(innerWidth/2,Math.min(100,innerHeight-1));
    nav.dataset.tone=toneNode?.closest('[data-theme]')?.dataset.theme||'light';
    let active=sections[0];
    for(const section of sections) if(section.getBoundingClientRect().top<=180) active=section;
    tabs.forEach(a=>{
      const current=a.hash==='#'+active.id;
      a.classList.toggle('on',current);
      if(current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
    });

  }
  addEventListener('scroll',()=>{showRemote();if(!frame)frame=requestAnimationFrame(sync);},{passive:true});
  addEventListener('resize',()=>{if(innerWidth>1020&&menuOpen)menu(false);if(!frame)frame=requestAnimationFrame(sync);},{passive:true});
  hero.querySelectorAll('.hero-pillars li').forEach((el,i)=>el.style.setProperty('--i',i));
  hero.addEventListener('pointermove',event=>{
    if(reduced)return;
    const r=hero.getBoundingClientRect();
    hero.style.setProperty('--px',((event.clientX-r.left)/r.width*100).toFixed(1)+'%');
    hero.style.setProperty('--py',((event.clientY-r.top)/r.height*100).toFixed(1)+'%');
  },{passive:true});
  const breathPath=document.getElementById('breathPath');
  if(!reduced){
    const begun=performance.now();
    function breathe(now){
      const progress=clamp((now-begun)/5500,0,1);
      const points=[];
      for(let x=0;x<=1440;x+=12){
        const rhythm=Math.sin(x/90)*48;
        const irregular=Math.sin(x/28)*37+Math.sin(x/11)*19+Math.sin(x/69)*43;
        const y=250+irregular*(1-progress)+rhythm*progress;
        points.push((x?'L':'M')+x+' '+y.toFixed(2));
      }
      breathPath.setAttribute('d',points.join(' '));
      if(progress<1)requestAnimationFrame(breathe);
      else hero.classList.add('settled');
    }
    requestAnimationFrame(breathe);
  }else hero.classList.add('settled');
  if('IntersectionObserver' in window){
    const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-in');reveal.unobserve(entry.target);}
    }),{threshold:.08});
    document.querySelectorAll('.rv').forEach(el=>reduced?el.classList.add('is-in'):reveal.observe(el));
  }else{
    document.querySelectorAll('.rv').forEach(el=>el.classList.add('is-in'));
  }
  const dialButtons=[...document.querySelectorAll('[data-dial]')];
  dialButtons.forEach(button=>button.addEventListener('click',()=>{
    const which=button.dataset.dial;
    dialButtons.forEach(b=>b.setAttribute('aria-selected',String(b===button)));
    document.querySelectorAll('#dial video').forEach(video=>{
      const selected=video.id==='video-'+which;
      video.hidden=!selected;
      if(!selected)video.pause();
      else if(!reduced){const play=video.play();if(play)play.catch(()=>{});}
    });
  }));
  if(!reduced && 'IntersectionObserver' in window){
    const playback=new IntersectionObserver(entries=>entries.forEach(entry=>{
      const video=entry.target;
      if(entry.isIntersecting&&!video.hidden){const play=video.play();if(play)play.catch(()=>{});}
      else video.pause();
    }),{threshold:.25});
    document.querySelectorAll('#dial video').forEach(video=>playback.observe(video));
  }
  sync();showRemote(3000);
})();

for (const selector of ['#compare tbody tr']) {
  document.querySelectorAll(selector).forEach((element, index) => {
    element.style.setProperty('--r8-order', index);
  });
}

(() => {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const section = document.querySelector('#focus');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.intersectionRatio < .6) continue;
      entry.target.classList.add('r9-entered');
      observer.unobserve(entry.target);
    }
  }, {threshold: .6, rootMargin: '-70px 0px -' + Math.round(innerHeight * .18) + 'px 0px'});
  section.classList.add('r9-motion');
  section.querySelectorAll('[data-m]').forEach(element => observer.observe(element));
})();
