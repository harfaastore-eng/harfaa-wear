// Harfaa Admin Fix V4 - Banner + Video + Countdown + Bundle + Free Shipping
(function(){
  function init(){
    if(document.getElementById('harfaa-admin-extra')) return;
    var box=document.createElement('div');
    box.id='harfaa-admin-extra';
    box.style.cssText='background:#111;border:2px solid #ff3b30;border-radius:16px;padding:16px;margin:16px;color:#fff';
    box.innerHTML=
      '<h3 style="margin:0 0 12px">🔥 إعدادات البانر والفيديو - Harfaa</h3>'+
      '<label>نص البانر</label><textarea id="hf-banner" rows="2" style="width:100%;padding:10px;border-radius:10px;margin:6px 0 10px;color:#000"></textarea>'+
      '<label>زرار البانر</label><input id="hf-banner-btn" style="width:100%;padding:10px;border-radius:10px;margin:6px 0 10px;color:#000" />'+
      '<label>لينك زرار البانر</label><input id="hf-banner-link" placeholder="https://..." style="width:100%;padding:10px;border-radius:10px;margin:6px 0 10px;color:#000" />'+
      '<label>لينك الفيديو (يوتيوب أو mp4)</label><input id="hf-video-url" placeholder="https://youtube.com/..." style="width:100%;padding:10px;border-radius:10px;margin:6px 0 10px;color:#000" />'+
      '<label>أو اختار فيديو من تليفونك 📱</label><input type="file" id="hf-video-file" accept="video/*" style="width:100%;padding:10px;background:#fff;border-radius:10px;margin:6px 0 10px;color:#000" />'+
      '<div id="hf-upload-msg" style="font-size:13px;color:#FFD700;margin-bottom:10px"></div>'+
      '<label>عنوان الفيديو</label><input id="hf-video-title" style="width:100%;padding:10px;border-radius:10px;margin:6px 0 10px;color:#000" />'+
      '<label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="hf-banner-show" checked> إظهار البانر</label>'+
      '<label style="display:flex;gap:8px;align-items:center;margin:6px 0 12px"><input type="checkbox" id="hf-video-show" checked> إظهار الفيديو</label>'+
      '<hr style="border:1px solid #333;margin:16px 0">'+
      '<h3 style="margin:0 0 12px">⏰ العداد - Countdown</h3>'+
      '<label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="hf-countdown-enabled" checked> تشغيل العداد</label>'+
      '<label>نص العداد</label><input id="hf-countdown-text" placeholder="عرض الشتاء بيخلص بعد" style="width:100%;padding:10px;border-radius:10px;margin:6px 0 10px;color:#000" />'+
      '<label>تاريخ انتهاء العداد</label><input type="datetime-local" id="hf-countdown-end" style="width:100%;padding:10px;border-radius:10px;margin:6px 0 10px;color:#000" />'+
      '<hr style="border:1px solid #333;margin:16px 0">'+
      '<h3 style="margin:0 0 12px">🎁 عرض البندل - Bundle</h3>'+
      '<label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="hf-bundle-enabled" checked> تشغيل عرض البندل</label>'+
      '<label>نص عرض البندل</label><input id="hf-bundle-text" placeholder="اشتري 2 وخد التالت بنص الثمن!" style="width:100%;padding:10px;border-radius:10px;margin:6px 0 10px;color:#000" />'+
      '<label>نوع العرض</label><select id="hf-bundle-type" style="width:100%;padding:10px;border-radius:10px;margin:6px 0 10px;color:#000"><option value="third_half">التالت بنص الثمن</option><option value="third_free">التالت مجاني</option><option value="third_30">خصم 30% على التالت</option></select>'+
      '<hr style="border:1px solid #333;margin:16px 0">'+
      '<h3 style="margin:0 0 12px">🚚 الشحن المجاني</h3>'+
      '<label>سعر الشحن المجاني (جنيه)</label><input id="hf-free-shipping" type="number" placeholder="2000" style="width:100%;padding:10px;border-radius:10px;margin:6px 0 10px;color:#000" />'+
      '<button id="hf-save" style="background:#ff3b30;color:#fff;border:0;padding:12px 20px;border-radius:999px;font-weight:900;width:100%">💾 حفظ كل الاعدادات</button>'+
      '<div id="hf-msg" style="margin-top:10px;font-size:13px;color:#7CFC00"></div>';
    document.body.prepend(box);

    function getClient(){
      return window.sb || window.supabaseClient || null;
    }
    async function waitForClient(){
      for(var i=0;i<10;i++){
        var c = getClient();
        if(c) return c;
        await new Promise(r=>setTimeout(r,500));
      }
      return null;
    }

    document.getElementById('hf-video-file').addEventListener('change', async function(e){
      var file=e.target.files[0]; if(!file) return;
      var umsg=document.getElementById('hf-upload-msg'); umsg.textContent='جاري رفع الفيديو... استنى متقفلهاش';
      try{
        var client=await waitForClient(); if(!client) throw new Error('مفيش اتصال Supabase - اعمل Refresh');
        if(file.size > 50*1024*1024) throw new Error('الفيديو اكبر من 50 ميجا، صغره الاول');
        var name=Date.now()+'-'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
        var up=await client.storage.from('videos').upload(name, file, {cacheControl:'3600', upsert:true});
        if(up.error) throw up.error;
        var pub=client.storage.from('videos').getPublicUrl(name);
        document.getElementById('hf-video-url').value=pub.data.publicUrl;
        umsg.textContent='✅ اترفع! دوس حفظ كل الاعدادات عشان يظهر في الموقع';
      }catch(err){ umsg.textContent='❌ مش عارف ارفع: '+(err.message||err)+' - اتأكد انك عملت bucket اسمه videos و Public'; }
    });

    var cachedRow = null;
    async function load(){
      try{
        var client=await waitForClient(); if(!client) return;
        document.getElementById('hf-msg').textContent='جاري تحميل الإعدادات...';
        var res=await client.from('store_settings').select('*').limit(1).maybeSingle();
        if(res.error) throw res.error;
        var row=res&&res.data?res.data:null; if(!row){ document.getElementById('hf-msg').textContent='مفيش صف إعدادات'; return; }
        cachedRow = row;
        var S=row; for(var k in row){ if(row[k]&&typeof row[k]==='object'&&row[k].banner!==undefined) S=row[k]; if(typeof row[k]==='string'&&row[k].trim().startsWith('{')){ try{ var o=JSON.parse(row[k]); if(o.banner!==undefined) S=o; }catch(e){} } }
        window._hfRowKey=null; for(var k2 in row){ if(typeof row[k2]==='string'&&row[k2].trim().startsWith('{')) window._hfRowKey=k2; if(row[k2]&&typeof row[k2]==='object') window._hfRowKey=k2; }
        // البانر والفيديو - القديم
        document.getElementById('hf-banner').value=S.banner||'';
        document.getElementById('hf-banner-btn').value=S.banner_btn||'';
        document.getElementById('hf-banner-link').value=S.banner_link||'';
        document.getElementById('hf-video-url').value=S.video_url||'';
        document.getElementById('hf-video-title').value=S.video_title||'';
        document.getElementById('hf-banner-show').checked=S.banner_show!==false;
        document.getElementById('hf-video-show').checked=S.video_show!==false;
        // العداد والبندل والشحن - الجديد
        // بيقبل countdown_enabled او countdown_show
        var cdEn = (S.countdown_enabled !== undefined) ? S.countdown_enabled : S.countdown_show;
        document.getElementById('hf-countdown-enabled').checked = cdEn !== false;
        document.getElementById('hf-countdown-text').value = S.countdown_text || 'عرض الشتاء بيخلص بعد';
        // حول التاريخ لصيغة datetime-local
        if(S.countdown_end){
          try{ document.getElementById('hf-countdown-end').value = new Date(S.countdown_end).toISOString().slice(0,16); }catch(e){ document.getElementById('hf-countdown-end').value = S.countdown_end; }
        }
        var bEn = (S.bundle_enabled !== undefined) ? S.bundle_enabled : S.bundle_show;
        document.getElementById('hf-bundle-enabled').checked = bEn !== false;
        document.getElementById('hf-bundle-text').value = S.bundle_text || 'عرض البندل: اشتري 2 وخد التالت بنص الثمن!';
        document.getElementById('hf-bundle-type').value = S.bundle_type || 'third_half';
        document.getElementById('hf-free-shipping').value = S.free_shipping || S.freeShippingLimit || S.freeShipping || '2000';
        document.getElementById('hf-msg').textContent='';
      }catch(e){ document.getElementById('hf-msg').textContent='خطأ تحميل: '+(e.message||e); }
    }
    load();
    document.getElementById('hf-save').onclick=async function(){
      var msg=document.getElementById('hf-msg'); msg.textContent='جاري الحفظ...';
      try{
        var client=await waitForClient(); if(!client){ msg.textContent='مش لاقي اتصال Supabase - اعمل Refresh'; return; }
        var row = cachedRow;
        if(!row){
          var res=await client.from('store_settings').select('*').limit(1).maybeSingle();
          if(res.error) throw res.error;
          row=res&&res.data?res.data:null;
        }
        if(!row){ msg.textContent='مفيش صف إعدادات'; return; }
        var S={}; for(var k in row){ if(row[k]&&typeof row[k]==='object') S=row[k]; if(typeof row[k]==='string'&&row[k].trim().startsWith('{')){ try{S=JSON.parse(row[k]);}catch(e){} } }
        // البانر والفيديو
        S.banner=document.getElementById('hf-banner').value;
        S.banner_btn=document.getElementById('hf-banner-btn').value;
        S.banner_link=document.getElementById('hf-banner-link').value;
        S.video_url=document.getElementById('hf-video-url').value;
        S.video_title=document.getElementById('hf-video-title').value;
        S.banner_show=document.getElementById('hf-banner-show').checked;
        S.video_show=document.getElementById('hf-video-show').checked;
        // العداد والبندل والشحن - الجديد - بنفس الـ S عشان الموقع يقراهم
        S.countdown_enabled=document.getElementById('hf-countdown-enabled').checked;
        S.countdown_show=document.getElementById('hf-countdown-enabled').checked;
        S.countdown_text=document.getElementById('hf-countdown-text').value;
        S.countdown_end=document.getElementById('hf-countdown-end').value;
        S.bundle_enabled=document.getElementById('hf-bundle-enabled').checked;
        S.bundle_show=document.getElementById('hf-bundle-enabled').checked;
        S.bundle_text=document.getElementById('hf-bundle-text').value;
        S.bundle_type=document.getElementById('hf-bundle-type').value;
        S.free_shipping=document.getElementById('hf-free-shipping').value;
        S.freeShippingLimit=document.getElementById('hf-free-shipping').value;
        var key=window._hfRowKey; var payload={}; if(key) payload[key]=JSON.stringify(S); else payload=S;
        var upd=await client.from('store_settings').update(payload).eq('id',row.id);
        if(upd.error) throw upd.error;
        msg.textContent='✅ اتحفظ! افتح الموقع واعمل Refresh';
      }catch(e){ msg.textContent='خطأ: '+(e.message||e); }
    };
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
