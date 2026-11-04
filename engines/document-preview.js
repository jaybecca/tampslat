/* Shared, local-first file preview and document navigation for TAMPslat studios. */
(()=>{
  const style=document.createElement('style');
  style.textContent=`
  .tampslat-shared-preview{margin:24px 0;padding:18px;border:1px solid #dfe3ee;border-radius:16px;background:#fff;color:#20263b}
  .tampslat-preview-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
  .tampslat-preview-head h3{margin:0;font-size:18px}
  .tampslat-preview-nav{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .tampslat-preview-nav button,.tampslat-preview-file{border:1px solid #dfe3ee;background:#f8f9fc;color:#30384f;border-radius:9px;padding:8px 11px;font:inherit;font-size:13px;cursor:pointer}
  .tampslat-preview-nav button:disabled{opacity:.4;cursor:not-allowed}
  .tampslat-preview-list{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 12px}
  .tampslat-preview-file[aria-current=true]{border-color:#6544e8;background:#f0edff;color:#4328ad;font-weight:800}
  .tampslat-preview-stage{min-height:150px;max-height:680px;overflow:auto;border:1px solid #e7eaf2;border-radius:12px;background:#fbfcff;padding:14px}
  .tampslat-preview-stage iframe{width:100%;height:620px;border:0;background:#fff}
  .tampslat-preview-stage img,.tampslat-preview-stage video{display:block;max-width:100%;max-height:600px;margin:auto}
  .tampslat-preview-stage pre{white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.65 ui-monospace,monospace}
  .tampslat-preview-meta{color:#69738b;font-size:12px;margin:8px 0 0}
  .tampslat-preview-empty{color:#69738b;padding:30px 10px;text-align:center}
  `;
  document.head.appendChild(style);
  function mount(root){
    if(!root)return null;
    const input=root.querySelector('input[type="file"]');
    if(!input)return null;
    const panel=document.createElement('section');
    panel.className='tampslat-shared-preview';
    panel.innerHTML='<div class="tampslat-preview-head"><div><h3>Document preview</h3><div class="tampslat-preview-meta" data-preview-meta>Select a file to preview it locally in your browser.</div></div><div class="tampslat-preview-nav"><button type="button" data-preview-prev disabled>Previous</button><span data-preview-count>0 / 0</span><button type="button" data-preview-next disabled>Next</button></div></div><div class="tampslat-preview-list" data-preview-list></div><div class="tampslat-preview-stage" data-preview-stage><div class="tampslat-preview-empty">Your selected files will appear here. Choose a file above to open its preview.</div></div>';
    const existing=root.querySelector('#preview');
    const stage=panel.querySelector('[data-preview-stage]');
    if(existing){existing.remove();stage.appendChild(existing);existing.classList.add('tampslat-preview-content');}
    root.appendChild(panel);
    const list=panel.querySelector('[data-preview-list]');
    const meta=panel.querySelector('[data-preview-meta]');
    const count=panel.querySelector('[data-preview-count]');
    const prev=panel.querySelector('[data-preview-prev]');
    const next=panel.querySelector('[data-preview-next]');
    let files=[],index=0,objectUrl=null,sequence=0;
    const revoke=()=>{if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null}};
    const setMessage=(message)=>{stage.replaceChildren();const p=document.createElement('div');p.className='tampslat-preview-empty';p.textContent=message;stage.appendChild(p)};
    const safeHtml=(html)=>{
      if(!window.DOMPurify||typeof window.DOMPurify.sanitize!=='function')return null;
      return window.DOMPurify.sanitize(String(html||''),{USE_PROFILES:{html:true},FORBID_TAGS:['script','style','iframe','object','embed','form','svg','math'],FORBID_ATTR:['srcdoc']});
    };
    const updateNav=()=>{
      count.textContent=files.length?String(index+1)+' / '+files.length:'0 / 0';
      prev.disabled=!files.length||index===0;next.disabled=!files.length||index>=files.length-1;
      [...list.children].forEach((button,i)=>button.setAttribute('aria-current',String(i===index)));
    };
    async function renderFile(file,name,token){
      revoke();stage.replaceChildren();
      const type=(file.type||'').toLowerCase(),ext=(name.split('.').pop()||'').toLowerCase();
      meta.textContent=name+' · '+(file.size/1024).toFixed(1)+' KB · Preview stays in this browser unless you choose a server-backed feature.';
      if(file.size>50*1024*1024){setMessage('This file is larger than the 50 MB preview limit. You can still use the studio actions where supported.');return}
      if(type==='application/pdf'||ext==='pdf'){
        objectUrl=URL.createObjectURL(file);const frame=document.createElement('iframe');frame.title='PDF preview: '+name;frame.src=objectUrl;stage.appendChild(frame);return;
      }
      if(type.startsWith('image/')){
        objectUrl=URL.createObjectURL(file);const image=document.createElement('img');image.alt=name;image.src=objectUrl;stage.appendChild(image);return;
      }
      if(type.startsWith('audio/')||type.startsWith('video/')){
        objectUrl=URL.createObjectURL(file);const media=document.createElement(type.startsWith('audio/')?'audio':'video');media.controls=true;media.src=objectUrl;if(media.tagName==='VIDEO')media.playsInline=true;stage.appendChild(media);return;
      }
      if(ext==='docx'&&window.mammoth){
        try{const result=await window.mammoth.convertToHtml({arrayBuffer:await file.arrayBuffer()});if(token!==sequence)return;const html=safeHtml(result.value);if(html!==null)stage.innerHTML=html;else{const p=document.createElement('pre');p.textContent='A secure DOCX preview requires the HTML sanitizer. The file is still available for the studio actions.';stage.appendChild(p)}return}catch(e){setMessage('This DOCX could not be previewed. You can still use the available conversion actions.');return}
      }
      if(['xlsx','xls','csv'].includes(ext)&&window.XLSX){
        try{const bytes=await file.arrayBuffer();if(token!==sequence)return;const book=ext==='csv'?window.XLSX.read(await file.text(),{type:'string'}):window.XLSX.read(bytes,{type:'array'});const sheet=book.Sheets[book.SheetNames[0]];const html=window.XLSX.utils.sheet_to_html(sheet);const safe=safeHtml(html);if(safe!==null)stage.innerHTML=safe;else{const pre=document.createElement('pre');pre.textContent=window.XLSX.utils.sheet_to_csv(sheet);stage.appendChild(pre)}return}catch(e){setMessage('This spreadsheet could not be previewed. Check the file format and try again.');return}
      }
      if(['txt','md','json','xml','html','htm','csv'].includes(ext)||type.startsWith('text/')){
        try{const text=await file.text();if(token!==sequence)return;if(['html','htm'].includes(ext)){const html=safeHtml(text);if(html!==null){stage.innerHTML=html;return}}const pre=document.createElement('pre');pre.textContent=text.slice(0,500000);stage.appendChild(pre);return}catch(e){setMessage('The text preview could not be loaded.');return}
      }
      const details=document.createElement('div');details.className='tampslat-preview-empty';details.textContent='Preview is not available for this format yet. File name, type and size are shown above; the selected studio may still support processing or export.';stage.appendChild(details);
    }
    async function open(indexToOpen){
      if(!files.length)return;
      index=Math.max(0,Math.min(files.length-1,indexToOpen));updateNav();
      const token=++sequence;await renderFile(files[index],files[index].name,token);
    }
    function refresh(){
      files=[...(input.files||[])];index=0;list.replaceChildren();revoke();
      files.forEach((file,i)=>{const button=document.createElement('button');button.type='button';button.className='tampslat-preview-file';button.textContent=file.name;button.addEventListener('click',()=>open(i));list.appendChild(button)});
      if(files.length)open(0);else{meta.textContent='Select a file to preview it locally in your browser.';setMessage('Your selected files will appear here. Choose a file above to open its preview.');updateNav()}
    }
    const onPrev=()=>open(index-1),onNext=()=>open(index+1);
    input.addEventListener('change',refresh);prev.addEventListener('click',onPrev);next.addEventListener('click',onNext);
    refresh();
    return ()=>{sequence++;revoke();input.removeEventListener('change',refresh);prev.removeEventListener('click',onPrev);next.removeEventListener('click',onNext);panel.remove()};
  }
  window.TAMPSLATDocumentPreview={mount};
})();