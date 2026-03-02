
(function(){
  document.documentElement.classList.add('js');

  // AUTO_REVEAL: animate most elements across the site
  
  // Split hero title into spans for per-letter reveal (HOME only)
  function splitTextHero(){
    const h = document.querySelector('.heroCenter h1');
    if(!h || h.dataset.split === "1") return;
    const text = h.textContent.trim();
    h.textContent = "";
    const wrap = document.createElement('span');
    wrap.className = "letters";
    for(const ch of text){
      const s = document.createElement('span');
      s.className = "letter";
      s.textContent = ch === " " ? "\u00A0" : ch;
      wrap.appendChild(s);
    }
    h.appendChild(wrap);
    h.dataset.split = "1";
    // stagger delay
    Array.from(h.querySelectorAll('.letter')).forEach((el,i)=>{
      el.style.setProperty('--d', `${90 + i*18}ms`);
      el.classList.add('reveal');
    });
  }

  
  function kickstartAboveFold(){
    const els = Array.from(document.querySelectorAll('.reveal')).slice(0, 40);
    requestAnimationFrame(()=>{
      els.forEach(el=>{
        const r = el.getBoundingClientRect();
        if(r.top < window.innerHeight * 0.92){
          el.classList.add('in');
        }
      });
    });
  }

  function autoReveal(){
    const sel = [
      'h1','h2','h3','p','.kicker','.heroSub','.heroLine','.heroLogoWrap',
      'main > section', 'main > .section', '.hero', '.heroMini', '.streamsHero', '.statement',
      '.streamsDeck .streamTile', '.clientsGrid .person', '.teamGrid .person',
      '.grid > *', '.cards > *', '.panel', 'footer'
    ].join(',');

    const nodes = Array.from(document.querySelectorAll(sel));
    nodes.forEach((el,i)=>{
      if(!el.classList.contains('reveal')) el.classList.add('reveal');
    });

    // stagger within containers
    document.querySelectorAll('.streamsDeck, .streamsGrid, .grid, .clientsGrid, .teamGrid').forEach(container=>{
      Array.from(container.children).forEach((child,i)=>{
        child.style.setProperty('--d', `${i*60}ms`);
        if(!child.classList.contains('reveal')) child.classList.add('reveal');
      });
    });
  }
  autoReveal();
  splitTextHero();
  kickstartAboveFold();


  let wipe = document.getElementById('wipe');
  if(!wipe){
    wipe = document.createElement('div');
    wipe.id = 'wipe';
    wipe.innerHTML = '<div class="panel"></div>';
    document.body.prepend(wipe);
  }
  let locked = false;

  function activateNav(){
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.links a').forEach(a=>{
      const href = (a.getAttribute('href')||'').toLowerCase();
      if(href === path) a.classList.add('active');
      else a.classList.remove('active');
    });
  }

  // Scroll reveal
  const io = new IntersectionObserver((entries)=>{
    entries.forEach((e)=>{
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, {threshold: 0.10, rootMargin: "0px 0px -22% 0px"});

  function hookReveals(){
    const els = Array.from(document.querySelectorAll('.reveal'));
    els.forEach((el, i)=>{
      el.style.setProperty('--d', (i*35) + 'ms');
      io.observe(el);
    });
  }

  // Showreel: duplicate track for seamless loop
  function setupShowreel(){
    const track = document.querySelector('.track');
    if(!track) return;
    // clone once for seamless loop
    if(track.dataset.dup === "1") return;
    const clones = Array.from(track.children).map(n=>n.cloneNode(true));
    clones.forEach(n=>track.appendChild(n));
    track.dataset.dup = "1";
  }


  // Page transitions
  function transitionTo(url){
    if(locked) return;
    locked = true;
    wipe.classList.remove('off');
    wipe.classList.add('on');
    document.documentElement.style.background = '#000';
    document.body.style.background = '#000';
    // navigate near end of wipe-in
    setTimeout(()=>{ location.href = url; }, 90);
  }

  function hookNavTransitions(){
    document.addEventListener('click', (ev)=>{
      const a = ev.target.closest('a');
      if(!a) return;
      const href = a.getAttribute('href');
      if(!href) return;
      // allow external links/new tab/mailto/hash
      const isExternal = /^https?:\/\//i.test(href) || href.startsWith('mailto:');
      if(isExternal || href.startsWith('#') || a.target === '_blank' || ev.metaKey || ev.ctrlKey) return;
      // same-page
      const current = (location.pathname.split('/').pop() || 'index.html');
      if(href === current) return;

      ev.preventDefault();
      transitionTo(href);
    }, true);

    // BFCache restore
    window.addEventListener('pageshow', ()=>{
      locked = false;
      wipe.classList.remove('on');
      wipe.classList.add('off');
      setTimeout(()=>wipe.classList.remove('off'), 140);
      document.addEventListener('DOMContentLoaded',()=>{document.getElementById('wipe')?.classList.remove('on');});

document.addEventListener('DOMContentLoaded',()=>{document.getElementById('wipe')?.classList.remove('on');});
  activateNav();
      hookReveals();
      setupShowreel();
      // re-apply reel duration on BFCache/refresh
      const t = document.querySelector('.track');
      if(t){ t.style.setProperty('--reelDur','32s'); t.style.animationDuration='32s'; }
    });
  }

  // init
  document.addEventListener('DOMContentLoaded',()=>{document.getElementById('wipe')?.classList.remove('on');});

document.addEventListener('DOMContentLoaded',()=>{document.getElementById('wipe')?.classList.remove('on');});
  activateNav();
  hookReveals();
  setupShowreel();
  hookNavTransitions();
}
  // Twitch embeds (Streams page)
  const TWITCH_PARENT = 'acendintl.org';
  function mountTwitchEmbeds(){
    document.querySelectorAll('.streamFrame[data-channel], .tileFrame[data-channel]').forEach(holder=>{
      if(holder.dataset.mounted === "1") return;
      const ch = holder.dataset.channel;
      const src = `https://player.twitch.tv/?channel=${encodeURIComponent(ch)}&parent=${encodeURIComponent(TWITCH_PARENT)}&muted=true`;
      const iframe = document.createElement('iframe');
      iframe.allowFullscreen = true;
      iframe.loading = "lazy";
      iframe.src = src;
      iframe.title = `Twitch Stream - ${ch}`;
      iframe.addEventListener('load', ()=>{ const sk = holder.querySelector('.tileSkeleton'); if(sk) sk.remove(); });
      holder.appendChild(iframe);
      holder.dataset.mounted = "1";
    });
  }
  mountTwitchEmbeds();
  autoReveal();
  splitTextHero();
  kickstartAboveFold();
  window.addEventListener('pageshow', ()=>{ mountTwitchEmbeds(); splitTextHero();
  kickstartAboveFold(); autoReveal(); kickstartAboveFold(); });
})();
