// Harfaa Fix - Banner + Video + Hero Color from image
(function(){
  function rgbToHex(r,g,b){return '#'+[r,g,b].map(n=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0')).join('');}
  function isLight(hex){let h=(hex||'#111').replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');let r=parseInt(h.substring(0,2),16),g=parseInt(h.substring(2,4),16),b=parseInt(h.substring(4,6),16);return (0.299*r+0.587*g+0.114*b)/255>0.6;}
  function getColor(url, fallback, cb){
    if(!url) return cb(fallback);
    var img=new Image(); img.crossOrigin='Anonymous'; img.src=url;
    img.onload=function(){ try{
      var c=document.createElement('canvas'); c.width=60; c.height=60;
      var x=c.getContext('2d'); x.drawImage(img,0,0,60,60);
      var d=x.getImageData(0,0,60,60).data; var r=0,g=0,b=0,n=0;
      for(var i=0;i<d.length;i+=16){var pr=d[i],pg=d[i+1],pb=d[i+2],pa=d[i+3]; if(pa<200)continue; if(pr>245&&pg>245&&pb>245)continue; if(pr<8&&pg<8&&pb<8)continue; r+=pr;g+=pg;b+=pb;n++;}
      if(!n) return cb(fallback);
      cb(rgbToHex(r/n,g/n,b/n));
    }catch(e){ cb(fallback); } };
    img.onerror=function(){ cb(fallback); };
    setTimeout(function(){ cb(fallback); },2500);
  }
  function applyHero(imgUrl){
    getColor(imgUrl,'#111111',function(bg){
      var light=isLight(bg);
      document.documentElement.style.setProperty('--heroBg',bg);
      document.documentElement.style.setProperty('--heroText',light?'#000':'#fff');
      document.documentElement.style.setProperty('--heroBtn',light?'#000':'#fff');
      document.documentElement.style.setProperty('--heroBtnText',light?'#fff':'#000');
    });
  }
  function applyBannerVideo(){
    var S=window.HARFAA_SITE||{};
    var header=document.querySelector('header');
    var banner=document.getElementById('bannerBar');
    if(!banner && header){
      banner=document.createElement('div'); banner.id='bannerBar'; banner.className='topBanner';
      banner.style.cssText='background:linear-gradient(135deg,#ff3b30,#ff7a00);color:#fff;padding:10px 14px;display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;font-size:14px;font-weight:800;text-align:center';
      header.after(banner);
    }
    if(banner){
      if(S.banner_show===false){ banner.style.display='none'; }
      else if(S.banner){ banner.style.display='flex'; banner.innerHTML=''; var sp=document.createElement('span'); sp.textContent=S.banner; banner.appendChild(sp); if(S.banner_btn){var a=document.createElement('a'); a.href=S.banner_link||'#'; a.target='_blank'; a.textContent=S.banner_btn; a.style.cssText='background:#fff;color:#000;padding:6px 14px;border-radius:999px;text-decoration:none;font-weight:900'; banner.appendChild(a);} }
      else { banner.style.display='none'; }
    }
    var videoBox=document.querySelector('.videoBox');
    if(videoBox){
      if(S.video_show===false || (S.video_url!==undefined && !S.video_url)){ videoBox.style.display='none'; }
      else if(S.video_url){
        videoBox.style.display='block';
        if(videoBox.getAttribute('data-fixed')!==S.video_url){
          videoBox.setAttribute('data-fixed',S.video_url);
          var src=S.video_url; var media='';
          if(src.includes('youtube.com/watch')||src.includes('youtu.be/')||src.includes('/embed/')){
            var id=src.includes('v=')?src.split('v=')[1].split('&')[0]:src.split('/').pop().split('?')[0];
            if(src.includes('/embed/')) id=src.split('/embed/')[1].split('?')[0];
            media='<iframe src="https://www.youtube.com/embed/'+id+'" style="width:100%;height:220px;border:0" allowfullscreen></iframe>';
          } else { media='<video controls playsinline loop muted style="width:100%;display:block"><source src="'+src+'" type="video/mp4"></video>'; }
          videoBox.innerHTML=media+'<div style="padding:14px"><b></b></div>';
          videoBox.querySelector('b').textContent=S.video_title||'🎬 شوف التيشيرت على الطبيعة';
        }
      }
    }
  }
  var lastHero='';
  setInterval(function(){
    applyBannerVideo();
    var heroImg=document.getElementById('heroImg');
    if(heroImg && heroImg.src && heroImg.src!==lastHero){ lastHero=heroImg.src; applyHero(heroImg.src); }
  },2000);
})();
