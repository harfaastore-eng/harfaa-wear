// Harfaa Fix V10 - Inject Timer Inside Countdown Bar
(function(){
  var HARFAA_SB_URL = "https://uuxrjiytnnxsbhymkdfd.supabase.co";
  var HARFAA_SB_KEY = "sb_publishable_xDrhCsbKo4hMjERVkERgFQ_DtDjRKNI";

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
    try{ var cached = sessionStorage.getItem(cacheKey); if(cached) return cb(cached); }catch(e){}
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
  function findAllByText(keywords){
    var found = [];
    var all = document.querySelectorAll('*');
    for(var i=0;i<all.length;i++){
      var el = all[i];
      if(el.children.length > 2) continue;
      var t = (el.textContent||'').trim();
      if(t.length < 5 || t.length > 300) continue;
      for(var k=0;k<keywords.length;k++){ if(t.includes(keywords[k])){ found.push(el); break; } }
    }
    return found;
  }
  function hideByText(keywords){
    var els = findAllByText(keywords);
    els.forEach(function(el){
      el.style.setProperty('display','none','important');
      var p = el.parentElement;
      if(p && p.textContent.length < 500 && p.tagName !== 'BODY' && p.tagName !== 'HTML'){
        p.style.setProperty('display','none','important');
        var pp = p.parentElement;
        if(pp && pp.textContent.length < 600 && pp.tagName !== 'BODY') pp.style.setProperty('display','none','important');
      }
    });
    return els.length;
  }
  function unhideElAndParents(el){
    var cur = el;
    for(var i=0;i<5 && cur && cur.tagName !== 'BODY' && cur.tagName !== 'HTML'; i++){
      cur.style.removeProperty('display');
      cur = cur.parentElement;
    }
  }
  function showByText(keywords){
    document.querySelectorAll('*').forEach(function(el){
      var t = (el.textContent||'').trim();
      for(var k=0;k<keywords.length;k++){
        if(t.includes(keywords[k])) unhideElAndParents(el);
      }
    });
  }
  function getBundleText(type, customText){
    if(customText && !customText.includes('بنص') && !customText.includes('30%') && !customText.includes('مجانا') && !customText.includes('نص الثمن')) return customText;
    if(type === 'third_free') return 'عرض البندل: اشتري 2 وخد التالت مجانا!';
    if(type === 'third_30') return 'عرض البندل: اشتري 2 وخد التالت بخصم 30%!';
    if(type === 'third_half') return 'عرض البندل: اشتري 2 وخد التالت بنص الثمن!';
    return customText || 'عرض البندل: اشتري 2 وخد التالت بنص الثمن!';
  }
  function formatCountdown(end){
    var diff = new Date(end).getTime() - Date.now();
    if(isNaN(diff)) return null;
    if(diff <= 0) return "00 : 00 : 00 : 00";
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    return String(d).padStart(2,'0') + ' : ' + String(h).padStart(2,'0') + ' : ' + String(m).padStart(2,'0') + ' : ' + String(s).padStart(2,'0');
  }

  // ===== ازرع التايمر جوه بار العداد =====
  function ensureTimerInjected(){
    var existing = document.getElementById('harfaa-timer-injected');
    if(existing) return existing;
    // دور على اي عنصر فيه "بيخلص بعد" - حتى لو جواه عناصر تانية
    var all = document.querySelectorAll('*');
    var bar = null;
    for(var i=0;i<all.length;i++){
      var t = (all[i].textContent||'');
      if(t.includes('بيخلص بعد') && all[i].children.length <= 3 && t.length < 100){
        bar = all[i];
        break;
      }
    }
    if(!bar){
      // لو ملقيتش، دور على اي عنصر فيه "عرض الشتاء"
      for(var j=0;j<all.length;j++){
        var t2 = (all[j].textContent||'');
        if(t2.includes('عرض الشتاء بيخلص') && all[j].children.length <= 3 && t2.length < 100){ bar = all[j]; break; }
      }
    }
    if(!bar) return null;
    unhideElAndParents(bar);
    // خلي البار يعرض التايمر تحته
    var timer = document.createElement('div');
    timer.id = 'harfaa-timer-injected';
    timer.style.cssText = 'font-weight:900;font-size:22px;text-align:center;margin-top:6px;direction:ltr;letter-spacing:2px;color:#000';
    timer.textContent = '00 : 00 : 00 : 00';
    // لو البار نفسه هو النص، حط التايمر بعده، لو البار اب، حطه جواه
    if(bar.parentElement) bar.parentElement.appendChild(timer);
    else bar.appendChild(timer);
    return timer;
  }

  function startCountdownTimer(){
    if(window._harfaaCountdownStarted) return;
    window._harfaaCountdownStarted = true;
    setInterval(function(){
      var S = window.HARFAA_SITE || {};
      var cdEnabled = (S.countdown_enabled !== undefined) ? S.countdown_enabled : S.countdown_show;
      if(cdEnabled === false){
        var old = document.getElementById('harfaa-timer-injected');
        if(old) old.style.display = 'none';
        return;
      }
      if(!window.HARFAA_COUNTDOWN_END){
        // العداد متفعل بس التاريخ فاضي - وري بوكس اصفر
        var dbg = document.getElementById('harfaa-countdown-debug');
        if(!dbg){
          dbg = document.createElement('div');
          dbg.id = 'harfaa-countdown-debug';
          dbg.style.cssText = 'position:fixed;top:40px;left:0;right:0;background:#ffcc00;color:#000;font-size:13px;padding:10px;z-index:99999;text-align:center';
          dbg.textContent = 'DEBUG: العداد متفعل بس التاريخ فاضي في الادمن - افتح الادمن وحط تاريخ 30 ودوس حفظ';
          document.body.prepend(dbg);
        }
        return;
      } else {
        var dbg2 = document.getElementById('harfaa-countdown-debug');
        if(dbg2) dbg2.remove();
      }
      var txt = formatCountdown(window.HARFAA_COUNTDOWN_END);
      if(!txt) return;
      var el = ensureTimerInjected();
      if(el){
        el.style.display = 'block';
        el.textContent = txt;
        showByText(['بيخلص بعد','عرض الشتاء بيخلص']);
      }
    }, 1000);
  }

  var lastApplied = null;
  function apply(S, rawRow){
    if(!S) return;
    lastApplied = S;
    window.HARFAA_SITE = S;
    window.HARFAA_RAW = rawRow;
    startCountdownTimer();
    doApply(S);
    var dbg = document.getElementById('harfaa-debug'); if(dbg) dbg.remove();
  }
  function doApply(S){
    if(!S) return;
    if(S.banner_show === false){
      hideByText(['HARFAA10','WINTER DROP']);
      var bb = document.getElementById('bannerBar'); if(bb) bb.style.setProperty('display','none','important');
    } else {
      showByText(['HARFAA10','WINTER DROP']);
      var bb2 = document.getElementById('bannerBar'); if(bb2) bb2.style.removeProperty('display');
      if(S.banner){
        var bEls = findAllByText(['HARFAA10','WINTER DROP']);
        if(bEls.length) bEls[0].textContent = S.banner;
      }
    }
    var cdEnabled = (S.countdown_enabled !== undefined) ? S.countdown_enabled : S.countdown_show;
    if(cdEnabled === false){
      hideByText(['بيخلص بعد','عرض الشتاء بيخلص','00 : 00 : 00']);
      var inj = document.getElementById('harfaa-timer-injected');
      if(inj) inj.style.setProperty('display','none','important');
    } else {
      showByText(['بيخلص بعد','عرض الشتاء بيخلص']);
      var inj2 = document.getElementById('harfaa-timer-injected');
      if(inj2) inj2.style.removeProperty('display');
    }
    if(S.countdown_text){
      var ctEls = findAllByText(['بيخلص بعد','عرض الشتاء']);
      if(ctEls.length) ctEls[0].textContent = S.countdown_text;
    }
    if(S.countdown_end){
      window.HARFAA_COUNTDOWN_END = S.countdown_end;
      if(typeof S.countdown_end === 'string' && S.countdown_end.length === 10){
        window.HARFAA_COUNTDOWN_END = S.countdown_end + 'T23:59:59';
      }
      var txtNow = formatCountdown(window.HARFAA_COUNTDOWN_END);
      if(txtNow){
        var elNow = ensureTimerInjected();
        if(elNow){ elNow.style.display='block'; elNow.textContent = txtNow; }
      }
    } else {
      // لو التاريخ فاضي، شيله عشان يبان البوكس الاصفر
      window.HARFAA_COUNTDOWN_END = null;
    }
    var bundleEnabled = (S.bundle_enabled !== undefined) ? S.bundle_enabled : S.bundle_show;
    if(bundleEnabled === false){
      hideByText(['عرض البندل','اشتري 2 وخد التالت','خد التالت بنص']);
    } else {
      showByText(['عرض البندل','اشتري 2 وخد التالت','خد التالت بنص']);
      var finalBundleText = getBundleText(S.bundle_type, S.bundle_text);
      var bnd = findAllByText(['عرض البندل','اشتري 2 وخد']);
      if(bnd.length) bnd[0].textContent = '🎁 ' + finalBundleText;
      document.querySelectorAll('*').forEach(function(el){
        if(el.children.length === 0 && (el.textContent||'').includes('بنص الثمن') && S.bundle_type === 'third_30'){
          el.textContent = (el.textContent||'').replace('بنص الثمن','بخصم 30%').replace('نص الثمن','خصم 30%');
        }
        if(el.children.length === 0 && (el.textContent||'').includes('بخصم 30%') && S.bundle_type === 'third_half'){
          el.textContent = (el.textContent||'').replace('بخصم 30%','بنص الثمن');
        }
      });
    }
    if(S.bundle_type) window.HARFAA_BUNDLE_TYPE = S.bundle_type;
    var freeShip = S.free_shipping || S.freeShippingLimit || S.freeShipping;
    if(freeShip){
      window.HARFAA_FREE_SHIPPING = Number(freeShip);
      document.querySelectorAll('*').forEach(function(el){
        if(el.children.length === 0 && (el.textContent||'').includes('2000')){
          el.textContent = (el.textContent||'').replace(/2000/g, String(freeShip));
        }
      });
    }
    var vb=document.querySelector('.videoBox');
    if(vb){
      if(S.video_show===false || !S.video_url){ vb.style.setProperty('display','none','important'); }
      else{
        vb.style.removeProperty('display');
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
  var supabaseClient = null;
  function getClient(){
    if(supabaseClient) return supabaseClient;
    if(window.sb) return window.sb;
    if(window.supabaseClient) return window.supabaseClient;
    var url = window._sbUrl || HARFAA_SB_URL;
    var key = window._sbKey || HARFAA_SB_KEY;
    if(window.supabase && url && key){
      supabaseClient = window.supabase.createClient(url, key);
      return supabaseClient;
    }
    return null;
  }
  function loadSupabaseLib(cb){
    if(window.supabase){ cb(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.onload = cb;
    document.head.appendChild(s);
  }
  async function fetchSettings(){
    try{
      var client = getClient();
      if(!client) return;
      var res=await client.from('store_settings').select('*').limit(1).maybeSingle();
      if(res && res.data){ apply(parseSettings(res.data), res.data); return; }
      var res2=await client.from('harfaa_settings').select('*').limit(1).maybeSingle();
      if(res2 && res2.data) apply(parseSettings(res2.data), res2.data);
    }catch(e){}
  }
  loadSupabaseLib(function(){ fetchSettings(); setTimeout(fetchSettings, 2000); });
  setInterval(function(){ if(lastApplied) doApply(lastApplied); if(document.hidden) return; fetchSettings(); }, 5000);
})();
