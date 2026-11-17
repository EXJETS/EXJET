// The hosted Web App uses its public embed configuration, independently of REST API credentials.
const headers = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Robots-Tag": "noindex, nofollow",
  "Content-Security-Policy": "default-src 'none'; script-src 'unsafe-inline' https://apps.avinode.com; style-src 'unsafe-inline'; frame-src https://apps.avinode.com; frame-ancestors 'self' https://chatgpt.com; base-uri 'none'",
};

export function widgetResponse(request: Request, configuredUrl: string) {
  if (!["GET", "HEAD"].includes(request.method)) return new Response(null, { status: 405, headers: { ...headers, Allow: "GET, HEAD" } });
  let bootstrap: URL | undefined;
  try { bootstrap = new URL(configuredUrl); } catch { /* An invalid configuration returns an explicit error below. */ }
  if (!bootstrap || bootstrap.origin !== "https://apps.avinode.com" || bootstrap.pathname !== "/webapp/rest/bootstrap" || !bootstrap.searchParams.get("Avinode-WEB-APP") || bootstrap.username || bootstrap.password || bootstrap.hash) {
    const error = '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EXJET aircraft search</title><p>Aircraft search is unavailable. Please contact EXJET.</p><script>if(parent!==window)parent.postMessage({type:"exjet-avinode-widget",status:"error"},location.origin);</script></html>';
    return new Response(request.method === "HEAD" ? null : error, { status: 503, headers });
  }
  const scriptUrl = JSON.stringify(bootstrap.href).replaceAll("<", "\\u003c");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EXJET aircraft search</title><style>html,body{margin:0;padding:0;width:100%;min-height:100vh;overflow:clip;background:#f2f2f2;font-family:Arial,sans-serif}#avinodeApp{position:relative;min-height:100px;width:100%}iframe{max-width:100%;display:block}#fallback{padding:20px;color:#526278;font-size:14px}a{color:inherit}</style></head><body><div id="avinodeApp"></div><p id="fallback" hidden>Aircraft search could not load. <a href="mailto:zakaria@exjet.com">Contact EXJET</a></p><script>
const root=document.getElementById('avinodeApp');let lastHeight=0,ready=false;
const send=data=>{if(parent!==window)parent.postMessage({type:'exjet-avinode-widget',...data},location.origin);};
function resize(){let height=Math.max(100,root.getBoundingClientRect().height);for(const frame of root.querySelectorAll('iframe')){const rect=frame.getBoundingClientRect();if(rect.right>0&&rect.left<innerWidth)height=Math.max(height,rect.bottom);}height=Math.ceil(height+12);if(height!==lastHeight){lastHeight=height;send({height});}}
function inspect(){const labels={avinodeSearchForm:'EXJET aircraft search',avinodeAirportPicker:'Choose an airport',avinodeDatePicker:'Choose a flight date'};for(const [id,title] of Object.entries(labels)){const item=document.getElementById(id);if(item&&item.title!==title)item.title=title;}const frame=document.getElementById('avinodeSearchForm');if(frame&&!frame.dataset.exjetObserved){frame.dataset.exjetObserved='true';frame.addEventListener('load',()=>{ready=true;send({status:'loaded'});resize();});}resize();}
new MutationObserver(inspect).observe(root,{childList:true,subtree:true,attributes:true});new ResizeObserver(resize).observe(root);addEventListener('resize',resize);
function failed(){document.getElementById('fallback').hidden=false;send({status:'error'});}
const script=document.createElement('script');script.src=${scriptUrl};script.async=true;script.onerror=failed;document.body.appendChild(script);
setTimeout(()=>{if(!ready)send({status:'slow'});},20000);
</script></body></html>`;
  return new Response(request.method === "HEAD" ? null : html, { headers });
}
