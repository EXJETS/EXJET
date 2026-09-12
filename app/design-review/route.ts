import routes from "@/data/reviewRoutes.json";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 });
  const search = new URL(request.url).searchParams;
  const requestedWidth = Number(search.get("width"));
  const width = [320, 390, 768].includes(requestedWidth) ? requestedWidth : 390;
  const path = routes.some((route) => route.path === search.get("page")) ? search.get("page")! : "/";
  return new Response(`<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>EXJET design review</title><style>html,body{margin:0;background:#e8e8ed}body{display:flex;justify-content:center}iframe{display:block;width:${width}px;height:844px;flex:none;border:0;background:white}aside{position:fixed;left:16px;top:16px;display:grid;gap:8px;width:140px;font:13px system-ui}button{min-height:44px;border:0;border-radius:10px;background:white;color:#16181a;cursor:pointer}@media(max-width:900px){aside{display:none}}</style></head><body><aside aria-label="Page capture controls"><button id="top">Page top</button><button id="next">Next section</button><output id="position"></output></aside><iframe title="EXJET responsive preview" src="${path}"></iframe><script>
const frame=document.querySelector('iframe');
async function settle(){
 document.body.dataset.ready='false';
 const doc=frame.contentDocument;
 await doc.fonts.ready;
 await Promise.all([...doc.images].filter(img=>{const r=img.getBoundingClientRect();return r.bottom>0&&r.top<844}).map(img=>img.decode().catch(()=>{})));
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 document.body.dataset.offset=String(doc.documentElement.scrollTop);
 document.body.dataset.height=String(doc.documentElement.scrollHeight);
 document.body.dataset.page=doc.querySelector('h1')?.textContent||'';
 document.querySelector('#position').textContent=document.body.dataset.offset+' / '+document.body.dataset.height;
 document.body.dataset.ready='true';
}
frame.addEventListener('load',settle);
document.querySelector('#top').addEventListener('click',()=>{frame.contentWindow.scrollTo({top:0,behavior:'instant'});settle()});
document.querySelector('#next').addEventListener('click',()=>{frame.contentWindow.scrollBy({top:760,behavior:'instant'});settle()});
</script></body></html>`, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}
