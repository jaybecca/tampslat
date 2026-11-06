import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.3';
const supabase=createClient('https://qqfmsvepxxagszzhhjap.supabase.co','sb_publishable_zxfcbavvt1HnL1mPiO_zzA_4l9YoG56',{auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
const title=document.querySelector('.card h1'),message=document.querySelector('.card p:not(.primary)'),button=document.querySelector('.card .primary');
const params=new URLSearchParams(location.search),hash=new URLSearchParams(location.hash.replace(/^#/,''));
const nextCandidate=sessionStorage.getItem('tampslat_google_oauth_next')||'tools.html';
const allowed=/^(tools\.html|index\.html|studios\.html|template-library\.html|font-studio\.html|presentation-studio\.html|3d-web-studio\.html|document-converter\.html|ebook-studio\.html|ai-studio\.html|batch-studio\.html|business-operations-studio\.html|design-studio\.html|document-studio\.html|file-studio\.html|pdf-studio\.html|spreadsheet-studio\.html|vault-studio\.html|zip-studio\.html|vault\.html|sheets\.html)(#.*)?$/.test(nextCandidate)?nextCandidate:'tools.html';
const showError=error=>{title.textContent='Sign-in could not be completed';message.textContent=error?.message||'Please return to sign in and try again.';button.textContent='Return to sign in';button.href='login.html';};
async function finishGoogle(){
 title.textContent='Completing Google sign-in…';message.textContent='Please wait while we securely open your TAMPslat workspace.';
 const code=params.get('code');if(!code)throw new Error(params.get('error_description')||'Google did not return a valid sign-in code.');
 const {data,error}=await supabase.auth.exchangeCodeForSession(code);if(error)throw error;
 const accessToken=data?.session?.access_token;if(!accessToken)throw new Error('Google sign-in completed without a valid session.');
 await window.TAMPSLAT_API.oauthSession(accessToken);
 await supabase.auth.signOut({scope:'local'}).catch(()=>{});
 sessionStorage.removeItem('tampslat_google_oauth_pending');sessionStorage.removeItem('tampslat_google_oauth_next');
 location.replace(allowed);
}
async function finishEmailLink(){
 const accessToken=hash.get('access_token');if(!accessToken)return false;
 title.textContent='Confirming your email…';message.textContent='Please wait while we securely finish setting up your TAMPslat workspace.';
 await window.TAMPSLAT_API.emailLinkSession(accessToken);
 history.replaceState(null,'',location.pathname);
 location.replace('tools.html');return true;
}
(async()=>{
 try{
  if(params.has('code')||params.has('error_description')||sessionStorage.getItem('tampslat_google_oauth_pending')==='1'&&params.has('error')){await finishGoogle();return;}
  if(await finishEmailLink())return;
  if(hash.get('error_description'))throw new Error(hash.get('error_description'));
 }catch(error){showError(error);}
})();
