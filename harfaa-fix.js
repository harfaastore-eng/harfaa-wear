// Harfaa Fix V2 - Fetch directly from Supabase + Hide old hardcoded banner
(function(){
  function parseSettings(row){
    if(!row) return null;
    for(var k in row){
      var v=row[k];
      if(v && typeof v==='object' && v.banner!==undefined) return v;
      if(typeof v==='string' && v.trim().startsWith('{')){
        try{ var o=JSON.parse(v); if(o && o.banner!==undefined) return o; }catch(e){}
      }
    }
    return row;
  }
  function rgbToHex(r,g,b){return '#'+[r,g,b].map(n=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0')).join('');}
  function isLight(hex){let h=(hex||'#111').replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');let r=parseInt(h.substring(0,2),16),g=parseInt(h.substring(2,4),16),b=parseInt(h.substring(4,6),16);return (0.299*r+0.587*g+0.114*b)/255>0.6;}
  function getColor(url,fallback,cb){
    if(!url) return cb(fallback);
    var img=new Image(); img.crossOrigin='Anonymous'; img.src=url;
    img.onload=function(){ try{
      var c=document.createElement('canvas'); c.width=60; c.height=60;
      var x=c.getContext('2d'); x.drawImage(img,0,0,60,60);
      var d=x.getImageData(0,0,60,60).data; var r=0,g=0,b=0,n=0;
      for(var i=0;i<d.length;i+=16){var pr=d[i],pg=d[i+1],pb=d[i+2],pa=d[i+3]; if(pa<200)continue; if(pr>245&&pg>245&&pb>245)continue; if(pr<8&&pg<8&&pb<8)continue; r+=pr;g+=pg;b+=pb;n++;}
      if(!n) return cb(fallback); cb(rgbToHex(r/n,g/n,b/n));
    }catch(e){ cb(fallback); } };
    img.onerror=function(){ cb(fallback); };
    setTimeout(function(){ cb(fallback); },2500);
  }
  function hideOldBanners(){
    document.querySelectorAll('div,section,header').forEach(function(el){
      var t=(el.textContent||'');
      if(el.children.length<3 && (t.includes('HARFAA10') || t.includes('WINTER DROP') || t.includes('عرض اشتري 2'))){
        if(el.id!=='bannerBar') el.style.display='none';
      }
    });
  }
  function apply(S){
    if(!S) return;
    window.HARFAA_SITE=S;
    hideOldBanners();
    var header=document.querySelector('header');
    var banner=document.getElementById('bannerBar');
    if(!banner && header){
      banner=document.createElement('div'); banner.id='bannerBar';
      banner.style.cssText='background:linear-gradient(135deg,#ff3b30,#ff7a00);color:#fff;padding:10px 14px;display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;font-size:14px;font-weight:800;text-align:center;z-index:999;position:relative';
      header.after(banner);
    }
    if(banner){
      if(S.banner_show===false){ banner.style.display='none'; }
      else if(S.banner){ banner.style.display='flex'; banner.innerHTML=''; var sp=document.createElement('span'); sp.textContent=S.banner; banner.appendChild(sp); if(S.banner_btn){var a=document.createElement('a'); a.href=S.banner_link||'#'; a.target='_blank'; a.textContent=S.banner_btn; a.style.cssText='background:#fff;color:#000;padding:6px 14px;border-radius:999px;text-decoration:none;font-weight:900'; banner.appendChild(a);} }
      else banner.style.display='none';
    }
    var vb=document.querySelector('.videoBox');
    if(vb){
      if(S.video_show===false || !S.video_url){ vb.style.display='none'; }
      else{
        vb.style.display='block';
        if(vb.getAttribute('data-fixed')!==S.video_url){
          vb.setAttribute('data-fixed',S.video_url);
          var src=S.video_url; var media='';
          if(src.includes('youtube.com')||src.includes('youtu.be')||src.includes('/embed/')){
            var id=src.includes('v=')?src.split('v=')[1].split('&')[0]:src.split('/').pop().split('?')[0];
            if(src.includes('/embed/')) id=src.split('/embed/')[1].split('?')[0];
            media='<iframe src="https://www.youtube.com/embed/'+id+'" style="width:100%;height:220px;border:0" allowfullscreen></iframe>';
          } else { media='<video controls playsinline loop muted style="width:100%;display:block"><source src="'+src+'" type="video/mp4"></video>'; }
          vb.innerHTML=media+'<div style="padding:14px"><b></b></div>';
          vb.querySelector('b').textContent=S.video_title||'🎬 شوف التيشيرت على الطبيعة';
        }
      }
    }
    var heroImg=document.getElementById('heroImg');
    if(heroImg && heroImg.src && heroImg.src!==window._lastHero){
      window._lastHero=heroImg.src;
      getColor(heroImg.src,'#111111',function(bg){
        var light=isLight(bg);
        document.documentElement.style.setProperty('--heroBg',bg);
        document.documentElement.style.setProperty('--heroText',light?'#000':'#fff');
        document.documentElement.style.setProperty('--heroBtn',light?'#000':'#fff');
        document.documentElement.style.setProperty('--heroBtnText',light?'#fff':'#000');
      });
    }
  }
  async function fetchSettings(){
    try{
      var client=window.sb || window.supabaseClient;
      if(!client && window.supabase && window._sbUrl) client=window.supabase.createClient(window._sbUrl, window._sbKey);
      if(!client) return;
      var res=await client.from('store_settings').select('*').limit(1).maybeSingle();
      if(res && res.data){ apply(parseSettings(res.data)); return; }
      var res2=await client.from('harfaa_settings').select('*').limit(1).maybeSingle();
      if(res2 && res2.data) apply(parseSettings(res2.data));
    }catch(e){}
  }
  setInterval(function(){ fetchSettings(); if(window.HARFAA_SITE) apply(window.HARFAA_SITE); },3000);
  fetchSettings();
})();
