import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.3';
const supabase = createClient('https://qqfmsvepxxagszzhhjap.supabase.co','sb_publishable_zxfcbavvt1HnL1mPiO_zzA_4l9YoG56',{auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
document.querySelectorAll('[data-google-signin]').forEach(button=>{
 button.addEventListener('click',async()=>{
  const status=document.getElementById('googleAuthError');if(status){status.textContent='';status.style.display='none';}
  button.disabled=true;
  const candidate=new URLSearchParams(location.search).get('next')||'tools.html';
  const next=/^(tools\.html|index\.html|studios\.html|template-library\.html|font-studio\.html|presentation-studio\.html|3d-web-studio\.html|document-converter\.html|ebook-studio\.html|ai-studio\.html|batch-studio\.html|business-operations-studio\.html|design-studio\.html|document-studio\.html|file-studio\.html|pdf-studio\.html|spreadsheet-studio\.html|vault-studio\.html|zip-studio\.html|vault\.html|sheets\.html)(#.*)?$/.test(candidate)?candidate:'tools.html';
  try{
   const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+'/auth-google-callback.html?next='+encodeURIComponent(next),queryParams:{prompt:'select_account'}}});
   if(error)throw error;
  }catch(error){if(status){status.textContent=error?.message||'Google sign-in could not be started. Please try again.';status.style.display='block';}button.disabled=false;}
 });
});
