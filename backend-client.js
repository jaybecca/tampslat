/* TAMPslat browser-to-Worker client. Set TAMPSLAT_API_BASE only if API is hosted separately. */
(() => {
  const base = String(window.TAMPSLAT_API_BASE || '').replace(/\/$/, '');
  async function request(path, options={}) {
    const response = await fetch(`${base}/api${path}`, { credentials:'include', ...options, headers:{ ...(options.body instanceof FormData ? {} : {'Content-Type':'application/json'}), ...(options.headers||{}) } });
    let data={}; try { data=await response.json(); } catch {}
    if(!response.ok) { let message=data.error||`Request failed (${response.status})`; if(response.status===405) message='The API endpoint returned 405. Deploy the TAMPslat Worker and set TAMPSLAT_API_BASE to its workers.dev URL in backend-client.js (or route /api to the Worker).'; if(response.status===404) message='The TAMPslat API was not found. Deploy backend/worker.js and configure TAMPSLAT_API_BASE.'; const e=new Error(message); e.status=response.status; throw e; }
    return data;
  }
  window.TAMPSLAT_API = {
    request,
    health:()=>request('/health',{headers:{}}),
    signup:(email,password)=>request('/auth/signup',{method:'POST',body:JSON.stringify({email,password})}),
    recover:(email)=>request('/auth/recover',{method:'POST',body:JSON.stringify({email})}),
    updatePassword:(accessToken,password)=>request('/auth/update-password',{method:'POST',body:JSON.stringify({accessToken,password})}),
    login:(email,password)=>request('/auth/login',{method:'POST',body:JSON.stringify({email,password})}),
    logout:()=>request('/auth/logout',{method:'POST',body:'{}'}),
    me:()=>request('/auth/me',{headers:{}}),
    generate:(task,prompt,context='')=>request('/ai/generate',{method:'POST',body:JSON.stringify({task,prompt,context})}),
    analyzeCsv:(csv,filename)=>request('/tools/csv/analyze',{method:'POST',body:JSON.stringify({csv,filename})}),
    ocr:(file)=>{const body=new FormData();body.append('file',file);return request('/tools/ocr',{method:'POST',body});},
    listWork:()=>request('/work',{headers:{}}),
    getWork:(id)=>request('/work/'+encodeURIComponent(id),{headers:{}}),
    saveWork:(kind,title,content)=>request('/work',{method:'POST',body:JSON.stringify({kind,title,content})}),
    deleteWork:(id)=>request('/work/'+encodeURIComponent(id),{method:'DELETE'}),
    billing:()=>request('/billing/summary',{headers:{}}),
    usage:()=>request('/usage/summary',{headers:{}}),
    adminOverview:()=>request('/admin/overview',{headers:{}})
  };
})();
