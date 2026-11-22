// Harfaa Fix V4 - Optimized: Cache + Countdown + Bundle + Free Shipping
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

  var bannersHidden = false;
  function hideOldBanners(){
    if(bannersHidden) return; bannersHidden = true;
    document.querySelectorAll('div,section,header').forEach(function(el){
      var t=(el.textContent||'');
      if(el.children.length<3 && (t.includes('HARFAA10') || t.includes('WINTER DROP') || t.includes('عرض اشتري 2'))){
        if(el.id!=='bannerBar') el.style.display='none';
      }
    });
  }

  // ===== العداد الحي - يشتغل مرة واحدة بس =====
  function startCountdownTimer(){
    if(window._harfaaCountdownStarted) return;
    window._harfaaCountdownStarted = true;
    setInterval(function(){
      var el = document.getElementById('countdown-timer') || document.querySelector('.countdown-timer');
      if(!el || !window.HARFAA_COUNTDOWN_END) return;
      var end = new Date(window.HARFAA_COUNTDOWN_END).getTime();
      if(isNaN(end)) return;
      var diff = end - Date.now();
      if(diff <= 0){ el.textContent = "00 : 00 : 00 : 00"; return; }
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      el.textContent = String(d).padStart(2,'0') + ' : ' + String(h).padStart(2,'0') + ' : ' + String(m).padStart(2,'0') + ' : ' + String(s).padStart(2,'0');
    }, 1000);
  }

  var lastSettingsJson = '';
  function apply(S){
    if(!S) return;
    var json = JSON.stringify(S);
    if(json === lastSettingsJson) return;
    lastSettingsJson = json;
    window.HARFAA_SITE=S;
    hideOldBanners();
    startCountdownTimer();

    // --- البانر العلوي (القديم - سيبه زي ما هو) ---
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

    // ===== 1. العداد - جديد =====
    // بيقبل countdown_enabled او countdown_show
    var cdEnabled = (S.countdown_enabled !== undefined) ? S.countdown_enabled : S.countdown_show;
    var cdBox = document.getElementById('countdown-box') || document.querySelector('.countdown-box');
    if(cdBox){
      if(cdEnabled === false) cdBox.style.display = 'none';
      else cdBox.style.display = 'block';
    }
    if(S.countdown_text){
      var ct = document.getElementById('countdown-text') || document.querySelector('.countdown-text');
      if(ct) ct.textContent = S.countdown_text;
    }
    if(S.countdown_end){
      window.HARFAA_COUNTDOWN_END = S.countdown_end;
    }

    // ===== 2. البندل - جديد =====
    var bundleEnabled = (S.bundle_enabled !== undefined) ? S.bundle_enabled : S.bundle_show;
    var bundleEl = document.getElementById('bundle-banner') || document.querySelector('.bundle-banner');
    if(bundleEl){
      if(bundleEnabled === false) bundleEl.style.display = 'none';
      else {
        bundleEl.style.display = 'block';
        if(S.bundle_text) bundleEl.textContent = S.bundle_text;
      }
    }
    if(S.bundle_type) window.HARFAA_BUNDLE_TYPE = S.bundle_type;
    if(S.bundle_min_items) window.HARFAA_BUNDLE_MIN = S.bundle_min_items;

    // ===== 3. الشحن المجاني - جديد =====
    var freeShip = S.free_shipping || S.freeShippingLimit || S.freeShipping;
    if(freeShip){
      document.querySelectorAll('.free-shipping-limit').forEach(function(el){ el.textContent = freeShip; });
      var bar = document.getElementById('free-shipping-bar') || document.getElementById('free-shipping-text');
      if(bar){
        var cartTotal = window.cartTotal || 0;
        var rem = Number(freeShip) - Number(cartTotal);
        if(rem > 0) bar.textContent = 'فاضلك ' + rem + 'ج وتاخد شحن مجاني';
        else bar.textContent = 'مبروك! خدت شحن مجاني';
      }
      window.HARFAA_FREE_SHIPPING = Number(freeShip);
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

  // ===== حساب خصم البندل في السلة - استدعيها من كود السلة بتاعك =====
  window.applyBundleDiscount = function(cartItems){
    var S = window.HARFAA_SITE || {};
    var enabled = (S.bundle_enabled !== undefined) ? S.bundle_enabled : S.bundle_show;
    if(enabled === false) return 0;
    if(!cartItems || cartItems.length < 3) return 0;
    var cheapest = Math.min.apply(null, cartItems.map(function(i){ return Number(i.price||0); }));
    if(S.bundle_type === 'third_free') return cheapest;
    if(S.bundle_type === 'third_30') return cheapest * 0.3;
    return cheapest * 0.5; // الافتراضي: التالت بنص الثمن
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
  setInterval(function(){
    if(document.hidden) return;
    fetchSettings();
  },60000);
})();
