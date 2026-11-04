const enc = new TextEncoder();
const json = (data, status=200) => new Response(JSON.stringify(data), {status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const fail = (message,status=400) => json({error:message},status);
const id = () => crypto.randomUUID();
const AFRICAN = new Set('NG GH KE ZA UG TZ RW ZM MW SN CI CM ET EG MA DZ TN AO MZ BW NA LS SZ GM SL LR BJ TG BF NE ML GN GW CD CG GA GQ CF TD SD SS SO DJ ER BI KM'.split(' '));
const PLANS = {
  starter:{NGN:2000,USD:2,GBP:2,EUR:2,CAD:3},
  pro:{NGN:5000,USD:5,GBP:5,EUR:5,CAD:7},
  business:{NGN:10000,USD:10,GBP:10,EUR:9,CAD:14}
};
const CREDIT_RATE = {NGN:4,USD:0.5,GBP:0.37,EUR:0.35,CAD:0.68};
function paymentMode(env){return String(env.PAYMENT_MODE||'sandbox').toLowerCase()==='live'?'live':'sandbox'}
function flutterwaveKey(env){return paymentMode(env)==='live'?env.flutterwave_secret_key:env.flutterwave_secret_key_sandbox}
function flutterwaveHash(env){return paymentMode(env)==='live'?env.flutterwave_webhook_secret_hash:env.flutterwave_webhook_secret_hash_sandbox}
function paddleKey(env){return paymentMode(env)==='live'?env.paddle_api_key:env.paddle_api_key_sandbox}
function paddleWebhookKey(env){return paymentMode(env)==='live'?env.paddle_webhook_secret:env.paddle_webhook_secret_sandbox}
function originFor(env){return String(env.APP_ORIGIN||'https://tampslat.tampconsulting.space').split(',')[0].trim().replace(/\/$/,'')}
async function readJson(req,max=12000){const raw=await req.text();if(raw.length>max)throw new Error('Request is too large.');try{return JSON.parse(raw||'{}')}catch{return null}}
function safeEqual(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0}
function hex(bytes){return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function hmacHex(secret,message){const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,enc.encode(message)))}
async function hashText(value){return hex(await crypto.subtle.digest('SHA-256',enc.encode(value)))}
function countryOf(req){return String(req.cf?.country||req.headers.get('CF-IPCountry')||'').toUpperCase()}
function priceFor(kind,plan,currency,quantity){
  if(kind==='plan'){if(!PLANS[plan]||!PLANS[plan][currency])return null;return PLANS[plan][currency]}
  if(kind==='credits'){if(!CREDIT_RATE[currency])return null;return Math.round(CREDIT_RATE[currency]*quantity*100)/100}
  return null;
}
async function applyPaidOrder(env,order,{eventId,paymentRef,periodEndsAt=null,subscriptionId=null,payloadHash=null}){
  const provider=order.provider,providerRef=String(paymentRef||order.provider_transaction_id||order.provider_ref||order.id);
  const ledgerRef=provider+':'+providerRef;
  const expiry=periodEndsAt&&Number.isFinite(Date.parse(periodEndsAt))?new Date(periodEndsAt).toISOString():null;
  const eventKey=String(eventId).slice(0,180);
  const statements=[
    env.DB.prepare('INSERT OR IGNORE INTO billing_webhook_events(provider,event_id,payload_hash) VALUES(?,?,?)').bind(provider,eventKey,payloadHash),
  ];
  if(order.kind==='credits'){
    statements.push(env.DB.prepare(`UPDATE users SET credits_balance=credits_balance+? WHERE id=? AND EXISTS(SELECT 1 FROM billing_orders WHERE id=? AND kind='credits' AND entitlement_applied=0) AND EXISTS(SELECT 1 FROM billing_webhook_events WHERE provider=? AND event_id=? AND processed_at IS NULL)`).bind(order.quantity,order.user_id,order.id,provider,eventKey));
    statements.push(env.DB.prepare(`INSERT OR IGNORE INTO credit_ledger(id,user_id,amount,event_type,description,provider_ref) SELECT ?,user_id,?,'purchase',?,? FROM billing_orders WHERE id=? AND entitlement_applied=0 AND EXISTS(SELECT 1 FROM billing_webhook_events WHERE provider=? AND event_id=? AND processed_at IS NULL)`).bind(id(),order.quantity,'TAMPslat AI credit purchase',ledgerRef,order.id,provider,eventKey));
  } else if(order.kind==='plan'){
    const paddleRenewal=provider==='paddle';
    statements.push(env.DB.prepare(`UPDATE users SET plan=?,plan_expires_at=COALESCE(?,datetime('now','+30 days')),billing_provider=?,billing_subscription_id=COALESCE(?,billing_subscription_id),updated_at=CURRENT_TIMESTAMP WHERE id=? AND EXISTS(SELECT 1 FROM billing_orders WHERE id=? AND kind='plan' AND (entitlement_applied=0 OR ?=1)) AND EXISTS(SELECT 1 FROM billing_webhook_events WHERE provider=? AND event_id=? AND processed_at IS NULL)`).bind(order.plan,expiry,provider,subscriptionId,order.user_id,order.id,paddleRenewal?1:0,provider,eventKey));
  }
  statements.push(env.DB.prepare(`UPDATE billing_orders SET status='paid',entitlement_applied=1,paid_at=COALESCE(paid_at,CURRENT_TIMESTAMP),provider_transaction_id=COALESCE(?,provider_transaction_id),updated_at=CURRENT_TIMESTAMP WHERE id=? AND EXISTS(SELECT 1 FROM billing_webhook_events WHERE provider=? AND event_id=? AND processed_at IS NULL)`).bind(providerRef,order.id,provider,eventKey));
  statements.push(env.DB.prepare('UPDATE billing_webhook_events SET processed_at=CURRENT_TIMESTAMP WHERE provider=? AND event_id=? AND processed_at IS NULL').bind(provider,eventKey));
  await env.DB.batch(statements);
}
async function checkoutRateLimit(env,userId){const now=Math.floor(Date.now()/1000),bucket='checkout:'+userId+':'+Math.floor(now/600);await env.DB.prepare('INSERT INTO rate_limits(bucket,count,window_start) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1').bind(bucket,now).run();const row=await env.DB.prepare('SELECT count FROM rate_limits WHERE bucket=?').bind(bucket).first();return (row?.count||0)<=8}
async function createCheckout(req,env,user){
  try{await env.DB.prepare('SELECT id FROM billing_orders LIMIT 1').first()}catch{return fail('Billing database is not ready. Apply migration 0002_billing.sql before enabling checkout.',503)}
  const data=await readJson(req);if(!data)return fail('Invalid checkout request.');
  const kind=String(data.kind||'plan').toLowerCase(),plan=String(data.plan||'').toLowerCase();
  const quantity=Math.max(1,Math.min(10000,Math.floor(Number(data.quantity)||1)));
  if(kind==='plan'&&(!PLANS[plan]||plan==='free'))return fail('Choose a valid paid plan.');
  if(kind!=='plan'&&kind!=='credits')return fail('Unsupported purchase type.');
  const country=countryOf(req),africa=AFRICAN.has(country),provider=africa?'flutterwave':'paddle';
  const currency=africa?(country==='NG'?'NGN':(String(data.currency||'USD').toUpperCase()==='USD'?'USD':'USD')):String(data.currency||'USD').toUpperCase();
  if(!['NGN','USD','GBP','EUR','CAD'].includes(currency))return fail('This currency is not supported for checkout.');
  const amount=priceFor(kind,plan,currency,quantity);if(!Number.isFinite(amount)||amount<=0)return fail('This price is not available in your selected currency.',400);
  if(!await checkoutRateLimit(env,user.id))return fail('Too many checkout attempts. Please wait a few minutes and try again.',429);
  const orderId=id(),amountMinor=Math.round(amount*100),origin=originFor(env);
  const order={id:orderId,user_id:user.id,provider,kind,plan:kind==='plan'?plan:null,quantity,currency,amount_minor:amountMinor};
  await env.DB.prepare('INSERT INTO billing_orders(id,user_id,provider,kind,plan,quantity,currency,amount_minor,status) VALUES(?,?,?,?,?,?,?,?,\'pending\')').bind(order.id,order.user_id,order.provider,order.kind,order.plan,order.quantity,order.currency,order.amount_minor).run();
  try{
    if(provider==='flutterwave'){
      const key=flutterwaveKey(env);if(!key)throw Object.assign(new Error('Flutterwave sandbox credentials are not configured. Add flutterwave_secret_key_sandbox before testing checkout.'),{status:503});
      const txRef='tampslat_'+orderId.replace(/-/g,'');
      const paymentOptions=country==='NG'&&currency==='NGN'?'card,banktransfer,ussd':'card';
      const response=await fetch('https://api.flutterwave.com/v3/payments',{method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/json',accept:'application/json'},body:JSON.stringify({
        tx_ref:txRef,amount,currency,redirect_url:origin+'/pricing.html?payment=flutterwave',
        customer:{email:user.email},payment_options:paymentOptions,
        customizations:{title:'TAMPslat',description:kind==='credits'?'AI credit top-up':'TAMPslat '+plan+' monthly access'},
        meta:{order_id:orderId,user_id:user.id,kind,plan:order.plan,quantity}
      })});
      const result=await response.json().catch(()=>({}));
      if(!response.ok||result.status!=='success'||!result.data?.link)throw new Error('Flutterwave could not create a secure checkout session.');
      await env.DB.prepare('UPDATE billing_orders SET provider_ref=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(txRef,orderId).run();
      return json({checkoutUrl:result.data.link,provider,orderId,renewal:'manual-monthly'});
    }
    const key=paddleKey(env);if(!key)throw Object.assign(new Error('Paddle sandbox credentials are not configured. Add paddle_api_key_sandbox before testing checkout.'),{status:503});
    const base=paymentMode(env)==='live'?'https://api.paddle.com':'https://sandbox-api.paddle.com';
    const productName=kind==='credits'?'TAMPslat AI credits':'TAMPslat '+plan[0].toUpperCase()+plan.slice(1);
    const price={description:kind==='credits'?'One-time AI credit pack':'Monthly TAMPslat software subscription',name:kind==='credits'?'One-time':'Monthly',billing_cycle:kind==='credits'?null:{interval:'month',frequency:1},unit_price:{amount:String(amountMinor),currency_code:currency},product:{name:productName,description:kind==='credits'?'AI assistance credit top-up for TAMPslat.':'Subscription access to the TAMPslat business productivity workspace.',tax_category:'saas'}};
    const response=await fetch(base+'/transactions',{method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/json'},body:JSON.stringify({
      items:[{quantity:1,price}],collection_mode:'automatic',
      custom_data:{order_id:orderId,user_id:user.id,kind,plan:order.plan,quantity},
      checkout:{url:origin+'/pricing.html?payment=paddle&order_id='+encodeURIComponent(orderId)}
    })});
    const result=await response.json().catch(()=>({}));
    const txn=result.data;if(!response.ok||!txn?.id||!txn?.checkout?.url)throw new Error('Paddle could not create a secure checkout session.');
    await env.DB.prepare('UPDATE billing_orders SET provider_ref=?,provider_transaction_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(txn.id,txn.id,orderId).run();
    return json({checkoutUrl:txn.checkout.url,provider,orderId,renewal:kind==='plan'?'automatic-monthly':'one-time'});
  }catch(error){
    await env.DB.prepare("UPDATE billing_orders SET status='failed',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='pending'").bind(orderId).run();
    return fail(error.status===503?error.message:'Secure checkout could not be started. No payment was taken.',error.status||502);
  }
}
async function verifyFlutterwave(env,transactionId){
  const key=flutterwaveKey(env);if(!key)throw new Error('Flutterwave verification is not configured.');
  const response=await fetch('https://api.flutterwave.com/v3/transactions/'+encodeURIComponent(String(transactionId))+'/verify',{headers:{authorization:'Bearer '+key,accept:'application/json'}});
  const result=await response.json().catch(()=>({}));
  if(!response.ok||result.status!=='success'||!result.data)throw new Error('Flutterwave could not verify this payment.');
  return result.data;
}
async function verifyReturn(req,env,user){
  const url=new URL(req.url),transactionId=url.searchParams.get('transaction_id'),txRef=url.searchParams.get('tx_ref');
  if(!transactionId||!txRef)return fail('Missing payment verification reference.');
  const order=await env.DB.prepare("SELECT * FROM billing_orders WHERE provider='flutterwave' AND provider_ref=? AND user_id=?").bind(txRef,user.id).first();
  if(!order)return fail('Payment reference was not found for this account.',404);
  const tx=await verifyFlutterwave(env,transactionId);
  if(tx.status!=='successful'||String(tx.tx_ref)!==order.provider_ref||String(tx.currency).toUpperCase()!==order.currency||Math.round(Number(tx.amount)*100)<order.amount_minor)return fail('Payment could not be verified against this order.',402);
  await applyPaidOrder(env,order,{eventId:'verify:'+String(tx.id),paymentRef:String(tx.id),payloadHash:await hashText(JSON.stringify(tx))});
  return json({ok:true,status:'paid',kind:order.kind,plan:order.plan,creditsAdded:order.kind==='credits'?order.quantity:0});
}
async function flutterwaveWebhook(req,env){
  const secret=flutterwaveHash(env),signature=req.headers.get('verif-hash')||'';
  if(!secret||!safeEqual(secret,signature))return fail('Invalid webhook signature.',401);
  const raw=await req.text();let payload;try{payload=JSON.parse(raw)}catch{return fail('Invalid webhook payload.')}
  const data=payload.data||{},txId=data.id,txRef=data.tx_ref;
  if(!txId||!txRef)return json({received:true});
  const order=await env.DB.prepare("SELECT * FROM billing_orders WHERE provider='flutterwave' AND provider_ref=?").bind(String(txRef)).first();
  if(!order)return json({received:true,ignored:true});
  const tx=await verifyFlutterwave(env,txId);
  if(tx.status!=='successful'||String(tx.tx_ref)!==order.provider_ref||String(tx.currency).toUpperCase()!==order.currency||Math.round(Number(tx.amount)*100)<order.amount_minor)return fail('Payment verification did not match the pending order.',409);
  const eventId='charge:'+String(tx.id)+':'+String(tx.status);
  await applyPaidOrder(env,order,{eventId,paymentRef:String(tx.id),payloadHash:await hashText(raw)});
  return json({received:true});
}
async function paddleWebhook(req,env){
  const secret=paddleWebhookKey(env);if(!secret)return fail('Paddle webhook verification is not configured.',503);
  const raw=await req.text(),header=req.headers.get('Paddle-Signature')||'';
  const fields=header.split(';').map(x=>x.trim().split('='));
  const ts=Number(fields.find(x=>x[0]==='ts')?.[1]),signatures=fields.filter(x=>x[0]==='h1').map(x=>x[1]);
  if(!Number.isFinite(ts)||!signatures.length||Math.abs(Date.now()/1000-ts)>300)return fail('Invalid or expired Paddle signature.',401);
  const expected=await hmacHex(secret,ts+':'+raw);if(!signatures.some(signature=>safeEqual(expected,signature)))return fail('Invalid Paddle signature.',401);
  let event;try{event=JSON.parse(raw)}catch{return fail('Invalid webhook payload.')}
  const data=event.data||{},eventId=String(event.event_id||'');
  if(!eventId)return fail('Missing Paddle event ID.');
  if(event.event_type==='transaction.completed'){
    const orderId=data.custom_data?.order_id;
    let order=orderId?await env.DB.prepare("SELECT * FROM billing_orders WHERE id=? AND provider='paddle'").bind(String(orderId)).first():null;
    if(!order&&data.subscription_id){order=await env.DB.prepare("SELECT * FROM billing_orders WHERE provider='paddle' AND kind='plan' AND user_id=(SELECT id FROM users WHERE billing_subscription_id=?) ORDER BY paid_at DESC LIMIT 1").bind(String(data.subscription_id)).first();}
    if(!order)return json({received:true,ignored:true});
    const subtotal=Number(data.details?.totals?.subtotal);
    if(data.status!=='completed'||String(data.currency_code).toUpperCase()!==order.currency||!Number.isFinite(subtotal)||subtotal!==order.amount_minor)return fail('Paddle transaction did not match the expected order.',409);
    await applyPaidOrder(env,order,{eventId,paymentRef:String(data.id||order.provider_ref),periodEndsAt:data.billing_period?.ends_at||null,subscriptionId:data.subscription_id||null,payloadHash:await hashText(raw)});
  }else if(['subscription.updated','subscription.canceled','subscription.past_due'].includes(event.event_type)){
    const subscriptionId=String(data.id||'');if(!subscriptionId)return json({received:true});
    const ends=data.current_billing_period?.ends_at||null,status=String(data.status||'');
    const insert=await env.DB.prepare('INSERT OR IGNORE INTO billing_webhook_events(provider,event_id,payload_hash) VALUES(?,?,?)').bind('paddle',eventId,await hashText(raw)).run();
    if(insert.meta?.changes){
      await env.DB.prepare(`UPDATE users SET plan_expires_at=COALESCE(?,plan_expires_at),plan=CASE WHEN ?='canceled' AND datetime(?)<=datetime('now') THEN 'free' ELSE plan END,updated_at=CURRENT_TIMESTAMP WHERE billing_subscription_id=?`).bind(ends, status, ends||'9999-12-31T00:00:00Z',subscriptionId).run();
      await env.DB.prepare('UPDATE billing_webhook_events SET processed_at=CURRENT_TIMESTAMP WHERE provider=? AND event_id=?').bind('paddle',eventId).run();
    }
  }
  return json({received:true});
}
export async function handleBilling(req,env,user,path){
  if(path==='/api/webhooks/flutterwave'&&req.method==='POST')return flutterwaveWebhook(req,env);
  if(path==='/api/webhooks/paddle'&&req.method==='POST')return paddleWebhook(req,env);
  if(path==='/api/billing/checkout'&&req.method==='POST')return createCheckout(req,env,user);
  if(path==='/api/billing/verify'&&req.method==='GET')return verifyReturn(req,env,user);
  return null;
}
