/* Authenticated, per-studio monthly usage guard. The counter is reserved before
   a marked operation and committed only after its handler resolves successfully. */
(()=>{'use strict';
 const seen=new WeakMap(),inFlight=new WeakSet();
 const failure=/\b(failed|failure|error:|error occurred|could not|couldn't|unable to|not supported|unavailable|invalid|choose a|select a|please choose|must be|expired|too large|not loaded|not found|no file|no model|not enough|no credits|quota|limit reached|sign in|authentication|cancelled|canceled)\b/i;
 const statusText=()=>[...document.querySelectorAll('[role="status"],[aria-live="polite"],[aria-live="assertive"],.status,.toast,#status,#message,#notice')].filter(x=>x.offsetParent!==null).map(x=>(x.innerText||x.textContent||'').trim()).join(' · ').slice(0,5000);
 const wait=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 function notify(message){let el=document.getElementById('tampslatToolUsageNotice');if(!el){el=document.createElement('div');el.id='tampslatToolUsageNotice';el.setAttribute('role','status');el.style.cssText='position:fixed;z-index:99999;right:18px;bottom:18px;max-width:min(420px,calc(100vw - 36px));padding:13px 16px;border-radius:12px;background:#202744;color:#fff;box-shadow:0 12px 35px #0003;font:600 13px/1.5 system-ui;display:none';document.body.appendChild(el)}el.textContent=message;el.style.display='block';clearTimeout(el._hide);el._hide=setTimeout(()=>el.style.display='none',5000)}
 async function invoke(target,event,handler){
  if(event&&seen.has(event))return seen.get(event);
  const key=target?.getAttribute?.('data-metered-tool');if(!key)return handler.call(target,event);
  if(inFlight.has(target)){event?.preventDefault?.();return;}
  inFlight.add(target);
  const promise=(async()=>{
   if(!window.TAMPSLAT_API?.reserveToolUse){notify('Usage tracking is unavailable. Reload the page and try again.');event?.preventDefault?.();return;}
   let reservation;
   try{reservation=await window.TAMPSLAT_API.reserveToolUse(key)}
   catch(error){event?.preventDefault?.();notify(error.status===401?'Sign in to use your monthly tool allowance.':error.message||'This tool is temporarily unavailable.');return;}
   const before=statusText();
   try{
    const result=await handler.call(target,event);
    if(result===false)throw new Error('The operation did not complete.');
    await wait();
    const after=statusText(),changed=after!==before;
    if(changed&&failure.test(after.slice(Math.max(0,before.length))))throw new Error('The operation did not complete successfully.');
    await window.TAMPSLAT_API.completeToolUse(reservation.reservationId);
    window.dispatchEvent(new CustomEvent('tampslat-tool-usage-updated',{detail:{toolKey:key,used:reservation.used,limit:reservation.limit}}));
    if(reservation.limit)notify(key.replace(/-/g,' ')+' · '+reservation.used+' of '+reservation.limit+' free uses this month.');
    return result;
   }catch(error){
    try{await window.TAMPSLAT_API.releaseToolUse(reservation.reservationId)}catch{}
    if(error?.message)notify(error.message);
    return;
   }finally{inFlight.delete(target)}
  })();
  if(event)seen.set(event,promise);
  return promise;
 }
 const proto=HTMLElement.prototype,descriptor=Object.getOwnPropertyDescriptor(proto,'onclick');
 if(descriptor?.get&&descriptor?.set)Object.defineProperty(proto,'onclick',{configurable:descriptor.configurable,enumerable:descriptor.enumerable,get:descriptor.get,set(handler){if(typeof handler!=='function'||!this.hasAttribute('data-metered-tool'))return descriptor.set.call(this,handler);const target=this;return descriptor.set.call(this,function(event){return invoke(target,event,handler)});}});
 const originalAdd=EventTarget.prototype.addEventListener;
 EventTarget.prototype.addEventListener=function(type,listener,options){
  if(type==='click'&&typeof listener==='function'&&this instanceof HTMLElement&&this.hasAttribute('data-metered-tool')){
   const target=this,wrapped=function(event){return invoke(target,event,listener)};
   return originalAdd.call(this,type,wrapped,options);
  }
  return originalAdd.call(this,type,listener,options);
 };
})();