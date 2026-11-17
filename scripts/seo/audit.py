"""Inspect rendered Next.js pages without fetching APIs or changing production."""
import argparse, csv, json
import xml.etree.ElementTree as ET
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.title=''; self.description=''; self.robots=''; self.canonical=''; self.h1=[]; self.headings=[]; self.text=[]; self.links=[]; self.ids=set(); self.images=[]; self.schemas=[]; self.main=False; self.capture=None; self.heading=None; self.script=None; self.jsonld=False; self.og_url=''; self.og_image=''; self.googlebot=''
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.add(a['id'])
        if tag=='main': self.main=True
        if tag=='title': self.capture='title'
        if tag=='meta' and a.get('property')=='og:url':self.og_url=a.get('content','')
        if tag=='meta' and a.get('property')=='og:image':self.og_image=a.get('content','')
        if tag=='meta' and a.get('name') in ('description','robots','googlebot'): setattr(self,a['name'],a.get('content',''))
        if tag=='link' and a.get('rel')=='canonical': self.canonical=a.get('href','')
        if tag=='a' and a.get('href'): self.links.append(a['href'])
        if tag in ('h1','h2','h3'): self.heading=[tag,'']
        if tag=='img': self.images.append(a)
        if tag=='script': self.script=''; self.jsonld=a.get('type')=='application/ld+json'
    def handle_data(self,data):
        if self.script is not None: self.script+=data;return
        if self.capture=='title': self.title+=data
        if self.heading: self.heading[1]+=data
        if self.main:self.text.append(data)
    def handle_endtag(self,tag):
        if tag=='main':self.main=False
        if tag=='title':self.capture=None
        if self.heading and tag==self.heading[0]:
            self.headings.append(self.heading)
            if tag=='h1':self.h1.append(self.heading[1].strip())
            self.heading=None
        if tag=='script':
            if self.jsonld:
                try:self.schemas.append(json.loads(self.script))
                except (ValueError,TypeError):self.schemas.append({'invalid':True})
            self.script=None;self.jsonld=False

def normalize(path):
    path=unquote(urlsplit(path).path)
    return path.rstrip('/')+'/' if path!='/' else '/'

def audit(root):
    pages=[]
    for file in sorted(root.rglob('*.html')):
        path='/'+str(file.relative_to(root)).removesuffix('.html')
        path='/' if path=='/index' else path+'/'
        if path.startswith('/_'):continue
        p=Page();p.feed(file.read_text()); d={k:v for k,v in vars(p).items() if k in ('title','description','robots','canonical','h1','headings','links','images','schemas','og_url','og_image','googlebot')}
        d.update(path=path,words=len(' '.join(p.text).split()),ids=sorted(p.ids),issues=[]);pages.append(d)
    known={p['path'] for p in pages};redirects={'/citation-latitude/','/airports/kpbi/'}
    for p in pages:
        indexed='noindex' not in p['robots']
        if not p['title']:p['issues'].append('missing title')
        if not p['description']:p['issues'].append('missing description')
        if indexed and len(p['h1'])!=1:p['issues'].append('expected one h1')
        if indexed and p['canonical']!='https://www.exjet.com'+p['path']:p['issues'].append('canonical mismatch')
        if indexed and p['og_url']!=p['canonical']:p['issues'].append('Open Graph URL mismatch')
        if indexed and 'noindex' in p['googlebot']:p['issues'].append('Googlebot noindex conflict')
        if not p['og_image'].startswith('https://www.exjet.com/'):p['issues'].append('social image host mismatch')
        if '.vercel.app' in json.dumps(p['schemas']):p['issues'].append('preview URL in structured data')
        if any('alt' not in im for im in p['images']):p['issues'].append('image missing alt')
        if any(s.get('invalid') for s in p['schemas']):p['issues'].append('invalid JSON-LD')
        broken=set()
        for link in p['links']:
            u=urlsplit(link)
            if not link.startswith('/') or link.startswith('//') or u.path.startswith(('/api/','/brand/','/images/')):continue
            target=normalize(u.path)
            if target not in known and target not in redirects and not target.startswith('/app/'):broken.add(target)
        if broken:p['issues'].append('broken internal targets: '+', '.join(sorted(broken)))
    for field in ('title','description'):
        counts=Counter(p[field] for p in pages if 'noindex' not in p['robots'])
        for p in pages:
            if 'noindex' not in p['robots'] and counts[p[field]]>1:p['issues'].append('duplicate '+field)
    # Reachability uses real rendered anchors from the homepage, not sitemap presence.
    by_path={p['path']:p for p in pages};seen=set();pending=['/']
    while pending:
        path=pending.pop()
        if path in seen or path not in by_path:continue
        seen.add(path)
        pending.extend(normalize(link) for link in by_path[path]['links'] if link.startswith('/') and not link.startswith('//'))
    for p in pages:
        if 'noindex' not in p['robots'] and p['path'] not in seen:p['issues'].append('not reachable from homepage')
    return pages

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--root',default='.next/server/app')
    parser.add_argument('--output',default='/tmp/exjet-seo-audit.json')
    parser.add_argument('--csv')
    parser.add_argument('--list',action='store_true')
    parser.add_argument('--production',action='store_true')
    args=parser.parse_args(); root=Path(args.root); rows=audit(root); errors=[]
    if not rows:errors.append('No rendered HTML found; run a production build first.')
    if args.production:
        indexed={'https://www.exjet.com'+r['path'] for r in rows if 'noindex' not in r['robots']}
        if not indexed:errors.append('Production build has no indexable pages.')
        sitemap=root/'sitemap.xml.body'
        if not sitemap.exists():errors.append('Missing rendered sitemap.')
        else:
            urls=[n.text for n in ET.fromstring(sitemap.read_text()).iter() if n.tag.endswith('}loc')]
            if len(urls)!=len(set(urls)):errors.append('Duplicate sitemap URLs.')
            if set(urls)!=indexed:errors.append('Sitemap and indexable pages differ: '+str(sorted(set(urls)^indexed)))
        robots=root/'robots.txt.body'
        if not robots.exists() or 'Disallow: /' in robots.read_text():errors.append('Production robots.txt blocks crawling or is missing.')
        for path in ('/account/','/search/','/membership/'):
            if 'https://www.exjet.com'+path in indexed:errors.append('Utility page is indexable: '+path)
    Path(args.output).write_text(json.dumps(rows,indent=2))
    if args.csv:
        with open(args.csv,'w',newline='') as f:
            writer=csv.writer(f,lineterminator="\n");writer.writerow(['Path','Indexable','Title','Meta description','H1','Main content words','Canonical','Checks'])
            for r in rows:writer.writerow([r['path'],'noindex' not in r['robots'],r['title'],r['description'],' / '.join(r['h1']),r['words'],r['canonical'],'; '.join(r['issues']) or 'Pass'])
    print(json.dumps({'pages':len(rows),'indexable':sum('noindex' not in r['robots'] for r in rows),'pages_with_issues':sum(bool(r['issues']) for r in rows),'build_errors':errors},indent=2))
    for r in rows:
        if args.list or r['issues']:print(f"{r['path']} | {r['title']} | {r['words']} words | {'; '.join(r['issues'])}")
    raise SystemExit(1 if errors or any(r['issues'] for r in rows) else 0)
