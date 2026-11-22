// Harfaa Fix V5 - Final: Text-Based Hide - Works with hardcoded HTML
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
    var cacheKey = 'harfaa_color_' + url;
    try{
      var cached = sessionStorage.getItem(cacheKey);
      if(cached) return cb(cached);
    }catch(e){}
    var img=new Image(); img.crossOrigin='Anonymous'; img.src=url;
    var done=false;
    function finish(c){ if(done) return; done=true; try{ sessionStorage.setItem(cacheKey,c); }catch(e){} cb(c); }
    img.onload=function(){ try{
      var c=document.createElement('canvas'); c.width=40; c.height=40;
      var x=c.getContext('2d',{willReadFrequently:true}); x.drawImage(img,0,0,40,40);
      var d=x.getImageData(0,0,40,40).data; var r=0,g=0,b=0,n=0;
      for(var i=0;i<d.length;i+=32){var pr=d[i],pg=d[i+1],pb=d[i+2],pa=d[i+3]; if(pa<200)continue; if(pr>245&&pg>245&&pb>245)continue; if(pr<8&&pg<8&&pb<8)continue; r+=pr;g+=pg;b+=pb;n++;}
      if(!n) return finish(fallback); finish(rgbToHex(r/n,g/n,b/n));
    }catch(e){ finish(fallback); } };
    img.onerror=function(){ finish(fallback); };
    setTimeout(function(){ finish(fallback); },1500);
  }

  // ===== اهم دالة: لاقي بوكس بالنص واخفيه او اظهره =====
  // بتدور على اصغر عنصر فيه النص، وبعدين تطلع لفوق لحد ما تلاقي البوكس الكبير
  function findBoxByText(keywords){
    var all = document.querySelectorAll('div,section');
    var best = null;
    for(var i=0;i<all.length;i++){
      var el = all[i];
      var t = (el.textContent||'');
      var has = false;
      for(var k=0;k<keywords.length;k++){ if(t.includes(keywords[k])){ has=true; break; } }
      if(!has) continue;
      // خد اصغر عنصر فيه النص، مش الصفحة كلها
      if(!best || el.textContent.length < best.textContent.length){
        // اتاكد انه مش عنصر صغير اوي زي span
        if(el.textContent.length > 5 && el.textContent.length < 500) best = el;
      }
    }
    if(!best) return null;
    // اطلع لفوق لحد ما تلاقي البوكس اللي ليه خلفية او بوردر او بادينج كبير
    var box = best;
    for(var j=0;j<4;j++){
      var p = box.parentElement;
      if(!p || p === document.body) break;
      var cs = window.getComputedStyle(p);
      // لو الاب ليه خلفية مختلفة او بوردر، ده هو البوكس
      if(cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'rgb(17, 17, 17)'){
        box = p; break;
      }
      if(box.textContent.length < 200) box = p;
      else break;
    }
    return box;
  }

  function toggleBox(keywords, show){
    // 1. جرب بالـ ID الاول
    var byId = document.getElementById('countdown-box') || document.getElementById('bundle-banner');
    // 2. دور بالنص
    var box = findBoxByText(keywords);
    if(box){
      if(show === false){
        box.style.setProperty('display','none','important');
      } else {
        box.style.removeProperty('display');
      }
      return box;
    }
    return null;
  }

  // ===== العداد الحي =====
  function startCountdownTimer(){
    if(window._harfaaCountdownStarted) return;
    window._harfaaCountdownStarted = true;
    setInterval(function(){
      // دور على عنصر التايمر بالنص 00 : 00
      var els = document.querySelectorAll('div,span,p');
      for(var i=0;i<els.length;i++){
        var t = els[i].textContent||'';
        if(t.includes('00 : 00') || /^\d{2} : \d{2} : \d{2} : \d{2}$/.test(t.trim())){
          if(!window.HARFAA_COUNTDOWN_END) return;
          var end = new Date(window.HARFAA_COUNTDOWN_END).getTime();
          if(isNaN(end)) return;
          var diff = end - Date.now();
          if(diff <= 0){ els[i].textContent = "00 : 00 : 00 : 00"; return; }
          var d = Math.floor(diff / 86400000);
          var h = Math.floor((diff % 86400000) / 3600000);
          var m = Math.floor((diff % 3600000) / 60000);
          var s = Math.floor((diff % 60000) / 1000);
          els[i].textContent = String(d).padStart(2,'0') + ' : ' + String(h).padStart(2,'0') + ' : ' + String(m).padStart(2,'0') + ' : ' + String(s).padStart(2,'0');
          return;
        }
      }
    }, 1000);
  }

  var lastSettingsJson = '';
  var lastApplied = null;
  function apply(S){
    if(!S) return;
    lastApplied = S;
    var json = JSON.stringify(S);
    // لو نفس الاعدادات، بس حاول تطبق تاني لو العناصر لسه مكانتش موجودة
    if(json === lastSettingsJson){
      // حاول تاني بعد شوية لو البوكسات لسه متلقتش
      return;
    }
    lastSettingsJson = json;
    window.HARFAA_SITE=S;
    startCountdownTimer();
    doApply(S);
  }

  function doApply(S){
    // --- البانر العلوي ---
    var header=document.querySelector('header');
    var banner=document.getElementById('bannerBar');
    if(!banner && header){
      // البانر اللي في الصورة فوق - لو موجود اصلا في HTML، متعملش واحد جديد
      var existing = findBoxByText(['HARFAA10','WINTER DROP']);
      if(existing) banner = existing;
      else {
        banner=document.createElement('div'); banner.id='bannerBar';
        banner.style.cssText='background:linear-gradient(135deg,#ff3b30,#ff7a00);color:#fff;padding:10px 14px;display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;font-size:14px;font-weight:800;text-align:center;z-index:999;position:relative';
        header.after(banner);
      }
    }
    if(banner){
      if(S.banner_show===false){ banner.style.setProperty('display','none','important'); }
      else if(S.banner){ 
        // لو البانر موجود في HTML، غير نصه بس
        if(banner.id !== 'bannerBar'){
          // البانر الاصلي - سيبه، غير نصه لو فيه
          if(S.banner && banner.textContent.includes('HARFAA10')) banner.style.removeProperty('display');
        } else {
          banner.style.display='flex'; banner.innerHTML=''; var sp=document.createElement('span'); sp.textContent=S.banner; banner.appendChild(sp); if(S.banner_btn){var a=document.createElement('a'); a.href=S.banner_link||'#'; a.target='_blank'; a.textContent=S.banner_btn; a.style.cssText='background:#fff;color:#000;padding:6px 14px;border-radius:999px;text-decoration:none;font-weight:900'; banner.appendChild(a);} 
        }
      }
    }

    // ===== 1. العداد - بالنص اللي في الصورة =====
    var cdEnabled = (S.countdown_enabled !== undefined) ? S.countdown_enabled : S.countdown_show;
    // الكلمات اللي في بوكس العداد في الصورة
    var cdBox = toggleBox(['بيخلص بعد','عرض الشتاء بيخلص','Countdown'], cdEnabled !== false);
    if(S.countdown_text && cdBox){
      // غير نص العداد للنص الجديد
      var txtEls = cdBox.querySelectorAll('div,span,p');
      for(var i=0;i<txtEls.length;i++){
        if((txtEls[i].textContent||'').includes('بيخلص') || (txtEls[i].textContent||'').includes('عرض الشتاء')){
          txtEls[i].textContent = S.countdown_text;
          break;
        }
      }
    }
    if(S.countdown_end) window.HARFAA_COUNTDOWN_END = S.countdown_end;

    // ===== 2. البندل - بالنص اللي في الصورة =====
    var bundleEnabled = (S.bundle_enabled !== undefined) ? S.bundle_enabled : S.bundle_show;
    var bundleBox = toggleBox(['عرض البندل','اشتري 2 وخد التالت','خد التالت بنص'], bundleEnabled !== false);
    if(bundleEnabled !== false && S.bundle_text && bundleBox){
      bundleBox.textContent = '🎁 ' + S.bundle_text;
    }
    if(S.bundle_type) window.HARFAA_BUNDLE_TYPE = S.bundle_type;

    // ===== 3. الشحن المجاني - بالنص اللي في الصورة =====
    var freeShip = S.free_shipping || S.freeShippingLimit || S.freeShipping;
    if(freeShip){
      window.HARFAA_FREE_SHIPPING = Number(freeShip);
      // دور على بوكس الشحن المجاني وغير الرقم 2000 اللي فيه
      var shipBox = findBoxByText(['شحن مجاني','طلبات 2000','2000ج']);
      if(shipBox){
        // غير الرقم القديم بالجديد في كل النص
        var html = shipBox.innerHTML;
        html = html.replace(/2000/g, String(freeShip));
        html = html.replace(/\d{3,4}ج/g, String(freeShip)+'ج');
        shipBox.innerHTML = html;
      }
      // غير اي عنصر فيه 2000
      document.querySelectorAll('.free-shipping-limit').forEach(function(el){ el.textContent = freeShip; });
    }

    // ===== 4. اسم المتجر =====
    if(S.store_name || S.storeName){
      var sName = S.store_name || S.storeName;
      document.querySelectorAll('[data-setting="storeName"]').forEach(function(el){ el.textContent = sName; });
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
            media='<iframe loading="lazy" src="https://www.youtube.com/embed/'+id+'" style="width:100%;height:220px;border:0" allowfullscreen></iframe>';
          } else { media='<video controls playsinline loop muted preload="none" style="width:100%;display:block"><source src="'+src+'" type="video/mp4"></video>'; }
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

  window.applyBundleDiscount = function(cartItems){
    var S = window.HARFAA_SITE || {};
    var enabled = (S.bundle_enabled !== undefined) ? S.bundle_enabled : S.bundle_show;
    if(enabled === false) return 0;
    if(!cartItems || cartItems.length < 3) return 0;
    var cheapest = Math.min.apply(null, cartItems.map(function(i){ return Number(i.price||0); }));
    if(S.bundle_type === 'third_free') return cheapest;
    if(S.bundle_type === 'third_30') return cheapest * 0.3;
    return cheapest * 0.5;
  };

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

  fetchSettings();
  // حاول تاني بعد ما الصفحة تتحمل كلها، لان العداد والبندل ممكن يكونوا لسه متحملوش
  setTimeout(function(){ if(lastApplied) doApply(lastApplied); }, 1500);
  setTimeout(function(){ if(lastApplied) doApply(lastApplied); }, 3500);
  setInterval(function(){
    if(document.hidden) return;
    fetchSettings();
  },60000);
})();
