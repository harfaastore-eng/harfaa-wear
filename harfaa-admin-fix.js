// Harfaa Admin Fix - Add Banner & Video fields
(function(){
  function init(){
    if(document.getElementById('harfaa-admin-extra')) return;
    var box=document.createElement('div');
    box.id='harfaa-admin-extra';
    box.style.cssText='background:#111;border:2px solid #ff3b30;border-radius:16px;padding:16px;margin:16px;color:#fff;font-family:inherit';
    box.innerHTML=
      '<h3 style="margin:0 0 12px">🔥 إعدادات البانر والفيديو - Harfaa</h3>'+
      '<label>نص البانر</label><textarea id="hf-banner" rows="2" style="width:100%;padding:10px;border-radius:10px;margin:6px 0 10px;color:#000"></textarea>'+
      '<label>زرار البانر (مثال: اطلب دلوقتي)</label><input id="hf-banner-btn" style="width:100%;padding:10px;border-radius:10px;margin:6px 0 10px;color:#000" />'+
      '<label>لينك زرار البانر</label><input id="hf-banner-link" placeholder="https://..." style="width:100%;padding:10px;border-radius:10px;margin:6px 0 10px;color:#000" />'+
      '<label>لينك الفيديو (يوتيوب أو mp4)</label><input id="hf-video-url" placeholder="https://youtube.com/..." style="width:100%;padding:10px;border-radius:10px;margin:6px 0 10px;color:#000" />'+
      '<label>عنوان الفيديو</label><input id="hf-video-title" style="width:100%;padding:10px;border-radius:10px;margin:6px 0 10px;color:#000" />'+
      '<label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="hf-banner-show" checked> إظهار البانر</label>'+
      '<label style="display:flex;gap:8px;align-items:center;margin:6px 0 12px"><input type="checkbox" id="hf-video-show" checked> إظهار الفيديو</label>'+
      '<button id="hf-save" style="background:#ff3b30;color:#fff;border:0;padding:12px 20px;border-radius:999px;font-weight:900;width:100%">💾 حفظ البانر والفيديو</button>'+
      '<div id="hf-msg" style="margin-top:10px;font-size:13px;color:#7CFC00"></div>';
    document.body.prepend(box);

    async function load(){
      try{
        var client=window.sb; if(!client) return;
        var res=await client.from('store_settings').select('*').limit(1).maybeSingle();
        var row=res&&res.data?res.data:null;
        if(!row) return;
        var S=row; for(var k in row){ if(row[k]&&typeof row[k]==='object'&&row[k].banner!==undefined) S=row[k]; if(typeof row[k]==='string'&&row[k].trim().startsWith('{')){ try{ var o=JSON.parse(row[k]); if(o.banner!==undefined) S=o; }catch(e){} } }
        window._hfRowId=row.id;
        window._hfRowKey=null;
        for(var k2 in row){ if(typeof row[k2]==='string'&&row[k2].trim().startsWith('{')) window._hfRowKey=k2; if(row[k2]&&typeof row[k2]==='object') window._hfRowKey=k2; }
        document.getElementById('hf-banner').value=S.banner||'';
        document.getElementById('hf-banner-btn').value=S.banner_btn||'';
        document.getElementById('hf-banner-link').value=S.banner_link||'';
        document.getElementById('hf-video-url').value=S.video_url||'';
        document.getElementById('hf-video-title').value=S.video_title||'';
        document.getElementById('hf-banner-show').checked=S.banner_show!==false;
        document.getElementById('hf-video-show').checked=S.video_show!==false;
      }catch(e){}
    }
    load();
    document.getElementById('hf-save').onclick=async function(){
      var msg=document.getElementById('hf-msg'); msg.textContent='جاري الحفظ...';
      try{
        var client=window.sb; if(!client){ msg.textContent='مش لاقي اتصال Supabase، اعمل Refresh'; return; }
        var res=await client.from('store_settings').select('*').limit(1).maybeSingle();
        var row=res&&res.data?res.data:null; if(!row){ msg.textContent='مفيش صف إعدادات في store_settings'; return; }
        var S={}; for(var k in row){ if(row[k]&&typeof row[k]==='object') S=row[k]; if(typeof row[k]==='string'&&row[k].trim().startsWith('{')){ try{S=JSON.parse(row[k]);}catch(e){} } }
        S.banner=document.getElementById('hf-banner').value;
        S.banner_btn=document.getElementById('hf-banner-btn').value;
        S.banner_link=document.getElementById('hf-banner-link').value;
        S.video_url=document.getElementById('hf-video-url').value;
        S.video_title=document.getElementById('hf-video-title').value;
        S.banner_show=document.getElementById('hf-banner-show').checked;
        S.video_show=document.getElementById('hf-video-show').checked;
        var key=window._hfRowKey;
        var payload={}; if(key) payload[key]=JSON.stringify(S); else payload=S;
        var upd=await client.from('store_settings').update(payload).eq('id',row.id);
        if(upd.error) throw upd.error;
        msg.textContent='✅ اتحفظ! افتح الموقع واعمل Refresh وهتلاقي البانر والفيديو اتغيروا';
      }catch(e){ msg.textContent='خطأ: '+(e.message||e); }
    };
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
