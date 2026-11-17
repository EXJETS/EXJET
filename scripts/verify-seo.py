#!/usr/bin/env python3
"""Check built HTML, crawler directives, page preservation and internal links.

Usage: python3 scripts/verify-seo.py production [--base-url http://localhost:3000]
       python3 scripts/verify-seo.py preview
No third-party dependencies required. Run after the corresponding Next build.
"""
import argparse
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.error import HTTPError
from urllib.parse import urlsplit
from urllib.request import urlopen
import xml.etree.ElementTree as ET

class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.meta={}; self.canonical=[]; self.links=[]; self.ids=set()
        self.title=''; self.h1=[]; self.jsonld=[]; self.images=[]
        self.in_title=False; self.in_h1=False; self.in_schema=False
        self.schema=''; self.feed(html)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.add(a['id'])
        if tag=='meta': self.meta[a.get('name',a.get('property',''))]=a.get('content','')
        if tag=='link' and a.get('rel')=='canonical': self.canonical.append(a.get('href'))
        if tag=='a' and a.get('href'): self.links.append(a['href'])
        if tag=='img': self.images.append(a)
        if tag=='title': self.in_title=True
        if tag=='h1': self.in_h1=True; self.h1.append('')
        if tag=='script' and a.get('type')=='application/ld+json': self.in_schema=True; self.schema=''
    def handle_endtag(self, tag):
        if tag=='title': self.in_title=False
        if tag=='h1': self.in_h1=False
        if tag=='script' and self.in_schema:
            self.jsonld.append(json.loads(self.schema)); self.in_schema=False
    def handle_data(self, data):
        if self.in_title:self.title+=data
        if self.in_h1:self.h1[-1]+=data
        if self.in_schema:self.schema+=data

def route(path):
    if path in ('','/','/index'):return '/'
    return path.rstrip('/')+'/'

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('mode',choices=['production','preview'])
parser.add_argument('--base-url')
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
build=root/'.next/server/app'
origin='https://www.exjet.com'
# App pages render at request time and intentionally have no static HTML file.
# Accept only concrete routes that exist in Next's compiled page manifest.
manifest=json.loads((root/'.next/server/app-paths-manifest.json').read_text())
runtime_pages={route(name.removesuffix('/page')) for name,file in manifest.items()
               if name.endswith('/page') and '[' not in name and not name.startswith('/_')
               and (root/'.next/server'/file).is_file()}
linked_runtime=set()
errors=[]; pages={}; titles=defaultdict(list); descriptions=defaultdict(list)
for file in build.rglob('*.html'):
    relative='/'+file.relative_to(build).as_posix()[:-5]
    if relative.startswith('/_'):continue
    path=route(relative)
    try:page=Page(file.read_text())
    except Exception as e:errors.append(f'{path}: HTML/schema parse: {e}');continue
    pages[path]=page
    if page.canonical!=[origin+path]:errors.append(f'{path}: canonical {page.canonical}')
    if len(page.h1)!=1:errors.append(f'{path}: expected one H1, got {len(page.h1)}')
    if not page.title:errors.append(f'{path}: missing title')
    if not page.meta.get('description'):errors.append(f'{path}: missing description')
    if page.meta.get('og:url')!=origin+path:errors.append(f'{path}: wrong og:url')
    for key in ['og:image','twitter:image']:
        if urlsplit(page.meta.get(key,'')).netloc!='www.exjet.com':errors.append(f'{path}: wrong {key}')
    robots=page.meta.get('robots',''); googlebot=page.meta.get('googlebot','')
    if args.mode=='preview' and ('noindex' not in robots or 'nofollow' not in robots or 'noindex' not in googlebot):
        errors.append(f'{path}: preview is not fully excluded')
    if args.mode=='production' and (('noindex' in robots)!=('noindex' in googlebot)):
        errors.append(f'{path}: robot/googlebot disagreement')
    for image in page.images:
        if 'alt' not in image:errors.append(f'{path}: missing image alt')
    for schema in page.jsonld:
        if 'vercel.app' in json.dumps(schema):errors.append(f'{path}: preview URL in JSON-LD')
    titles[page.title].append(path);descriptions[page.meta.get('description')].append(path)
for label,values in [('title',titles),('description',descriptions)]:
    for value,paths in values.items():
        if len(paths)>1:errors.append(f'duplicate {label}: {paths}')
expected=json.loads((root/'tests/seo-original-paths.json').read_text())
for path in expected:
    if path not in pages:errors.append(f'Original URL missing: {path}')
for path,page in pages.items():
    for href in page.links:
        url=urlsplit(href)
        if url.scheme in ('mailto','tel') or url.netloc and url.netloc!='www.exjet.com':continue
        if not url.path:target=path
        elif not url.path.startswith('/'):continue
        else:target=route(url.path)
        if target not in pages and target in runtime_pages:
            linked_runtime.add(target)
        elif target not in pages:
            if not (root/'public'/url.path.lstrip('/')).is_file():errors.append(f'{path}: broken internal link {href}')
        elif url.fragment and url.fragment not in pages[target].ids:
            errors.append(f'{path}: broken anchor {href}')
reachable=set(); queue=['/']
while queue:
    path=queue.pop()
    if path in reachable or path not in pages:continue
    reachable.add(path)
    for href in pages[path].links:
        u=urlsplit(href)
        if not u.netloc and u.path.startswith('/') or u.netloc=='www.exjet.com':queue.append(route(u.path))
for path in pages:
    if path not in reachable:errors.append(f'Page unreachable from homepage links: {path}')
sitemap_text=(build/'sitemap.xml.body').read_text()
locs=[node.text for node in ET.fromstring(sitemap_text).iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
if len(set(locs))!=len(locs):errors.append('duplicate sitemap URLs')
for loc in locs:
    if urlsplit(loc).netloc!='www.exjet.com':errors.append(f'wrong sitemap origin: {loc}')
    if urlsplit(loc).path not in pages:errors.append(f'sitemap URL missing: {loc}')
indexable=[p for p,d in pages.items() if 'noindex' not in d.meta.get('robots','')]
noindex=[p for p,d in pages.items() if 'noindex' in d.meta.get('robots','')]
if args.mode=='production' and set(locs)!={origin+p for p in indexable}:
    errors.append('sitemap does not exactly match indexable pages')
for path in ['/account/','/search/']:
    if path not in noindex:errors.append(f'utility page indexable: {path}')
robots=(build/'robots.txt.body').read_text()
if f'Sitemap: {origin}/sitemap.xml' not in robots:errors.append('wrong robots sitemap')
if 'Host:' in robots:errors.append('unsupported robots Host directive')
if args.mode=='production' and ('Disallow: /' in robots or 'Allow: /' not in robots):errors.append('production blocked in robots')
if args.mode=='preview' and 'Disallow: /' not in robots:errors.append('preview not blocked in robots')
http_status={}
if args.base_url:
    def fetch(path):
        try:
            with urlopen(args.base_url.rstrip('/')+path,timeout=30) as response:
                return path,response.status,response.headers.get('X-Robots-Tag','')
        except HTTPError as e:return path,e.code,e.headers.get('X-Robots-Tag','')
        except Exception as e:return path,str(e),''
    with ThreadPoolExecutor(max_workers=8) as pool:
        for path,status,xrobots in pool.map(fetch,list(pages)+sorted(linked_runtime)+['/this-page-must-not-exist-seo-check/']):
            http_status[path]=status
            if status!=(200 if path in pages or path in linked_runtime else 404):errors.append(f'{path}: HTTP {status}')
            if path.startswith('/app/') and 'noindex' not in xrobots.lower():errors.append(f'{path}: app route missing noindex HTTP header')
            if args.mode=='production' and path in indexable and 'noindex' in xrobots.lower():errors.append(f'{path}: noindex HTTP header')
report={'mode':args.mode,'status':'PASS' if not errors else 'FAIL','html_pages_checked':len(pages),'original_pages_preserved':len(expected),'indexable_count':len(indexable),'sitemap_urls':len(locs),'noindex_pages':sorted(noindex),'robots':robots,'http_status':http_status,'errors':sorted(set(errors)), 'metadata':[{'path':p,'title':d.title,'description':d.meta.get('description'),'h1':d.h1,'robots':d.meta.get('robots')} for p,d in sorted(pages.items())]}
report_dir=root/'verification';report_dir.mkdir(exist_ok=True)
(report_dir/f'seo-{args.mode}.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ('metadata','http_status','noindex_pages')},indent=2))
sys.exit(bool(errors))
