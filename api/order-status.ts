import type { IncomingMessage, ServerResponse } from 'node:http';
type Request = IncomingMessage & { body?: unknown };
export default async function handler(req: Request, res: ServerResponse) {
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  if (req.method !== 'POST') { res.statusCode=405; return res.end(JSON.stringify({error:'METHOD_NOT_ALLOWED'})); }
  const origin=req.headers.origin;
  if (origin && new URL(origin).host !== req.headers.host) { res.statusCode=403; return res.end(JSON.stringify({error:'ORIGIN_NOT_ALLOWED'})); }
  const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) { res.statusCode=503; return res.end(JSON.stringify({error:'NOT_CONFIGURED'})); }
  try {
    let data: any=req.body;
    if (!data || typeof data!=='object') {
      let text='';for await(const c of req){text+=String(c);if(text.length>2000)throw Error('TOO_LARGE');}
      data=JSON.parse(text);
    }
    if (!/^[A-Z0-9-]{8,40}$/.test(data.orderId||'') || !/^[A-Za-z0-9_-]{32,160}$/.test(data.lookupToken||'')) {
      res.statusCode=400;return res.end(JSON.stringify({error:'INVALID_TRACKING'}));
    }
    const r=await fetch(`${url.replace(/\/$/,'')}/rest/v1/rpc/fabrician_track`, {
      method:'POST', headers:{ apikey:key, Authorization:`Bearer ${key}`, 'Content-Type':'application/json'},
      body:JSON.stringify({p_order_id:data.orderId,p_lookup_token:data.lookupToken}),signal:AbortSignal.timeout(10000)
    });
    if(!r.ok){res.statusCode=503;return res.end(JSON.stringify({error:'TRACKING_UNAVAILABLE'}));}
    const result=await r.json();
    if(!result){res.statusCode=404;return res.end(JSON.stringify({error:'ORDER_NOT_FOUND'}));}
    res.statusCode=200;return res.end(JSON.stringify(result));
  } catch {res.statusCode=503;return res.end(JSON.stringify({error:'TRACKING_UNAVAILABLE'}));}
}
