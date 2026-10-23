"""Offline SEO release checks. Run: python tools/check-seo.py"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
NEW = ('montage-shorts-youtube.html', 'podcast-en-clips.html',
       'clips-stream-twitch.html', 'choisir-extrait-video-courte.html')
BASE = 'https://guizcut.fr/'


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.links, self.meta, self.ids, self.headings, self.schemas = [], {}, [], [], []
        self.canonical, self.title, self.text, self.ld = [], '', [], None
        self.in_title = False
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids.append(a['id'])
        if tag in ('h1', 'h2', 'h3'):
            self.headings.append(tag)
        if tag == 'title':
            self.in_title = True
        if tag == 'meta':
            self.meta[a.get('name', a.get('property'))] = a.get('content', '')
        if tag == 'link' and a.get('rel') == 'canonical':
            self.canonical.append(a['href'])
        if tag in ('a', 'link') and a.get('href'):
            self.links.append(a['href'])
        if tag in ('img', 'script') and a.get('src'):
            self.links.append(a['src'])
        if tag == 'script' and a.get('type') == 'application/ld+json':
            self.ld = ''

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.ld is not None:
            self.ld += data
        self.text.append(data)

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        if tag == 'script' and self.ld is not None:
            self.schemas.append(json.loads(self.ld))
            self.ld = None


def check():
    pages = {p.relative_to(ROOT).as_posix(): Page(p.read_text('utf-8'))
             for p in ROOT.rglob('*.html') if '.git' not in p.parts}
    count = 0

    def require(condition, message):
        nonlocal count
        count += 1
        if not condition:
            raise AssertionError(message)

    for name in NEW:
        page = pages[name]
        require(page.headings.count('h1') == 1, f'{name}: exactly one H1')
        require(len(page.ids) == len(set(page.ids)), f'{name}: duplicate ID')
        require(page.canonical == [BASE + name], f'{name}: canonical')
        require(bool(page.meta.get('description')), f'{name}: description')
        require(page.meta.get('og:title') == page.title, f'{name}: OG title')
        require(page.meta.get('og:url') == BASE + name, f'{name}: OG URL')
        require(page.meta.get('twitter:description') == page.meta['description'], f'{name}: social description')
        require('noindex' not in page.meta.get('robots', ''), f'{name}: indexable')
        require(sum(p.title == page.title for p in pages.values()) == 1, f'{name}: unique title')
        require(bool(page.schemas), f'{name}: structured data')
        require('29 € HT' in ''.join(page.text), f'{name}: current pilot price')
        require(not re.search(r'49\s*€|test gratuit|garanti.{0,8}viral', ''.join(page.text), re.I), f'{name}: obsolete or misleading offer')
        require('45 minutes' in ''.join(page.text), f'{name}: source limit')
        graph = page.schemas[0]['@graph']
        require(graph[0]['@type'] == 'BreadcrumbList', f'{name}: breadcrumb')
        require(graph[0]['itemListElement'][-1]['item'] == BASE + name, f'{name}: breadcrumb URL')
        if graph[1]['@type'] == 'Service':
            offer = graph[1]['offers']
            require(offer['price'] == '29.00' and offer['priceCurrency'] == 'EUR', f'{name}: structured price')
            require(offer['priceSpecification']['valueAddedTaxIncluded'] is False, f'{name}: price excludes VAT')
        for link in page.links:
            u = urlsplit(link)
            if u.scheme or u.netloc:
                continue
            target = ROOT / unquote(u.path or name)
            require(target.exists(), f'{name}: missing {link}')
            if u.fragment and target.suffix == '.html':
                dest = pages[target.relative_to(ROOT).as_posix()]
                require(unquote(u.fragment) in dest.ids, f'{name}: missing anchor {link}')
        require(any(name in p.links for k,p in pages.items() if k not in NEW), f'{name}: reachable from existing pages')
    for name in ('index.html', 'portfolio.html', 'tarifs.html', 'fonctionnement.html', 'qui-sommes-nous.html'):
        require(all(new in pages[name].links for new in NEW), f'{name}: links to all new pages')
    ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    sitemap = ET.parse(ROOT / 'sitemap.xml')
    locs = [x.text for x in sitemap.findall('.//s:loc', ns)]
    require(len(locs) == len(set(locs)), 'sitemap: duplicate URL')
    for name in NEW:
        require(BASE + name in locs, f'{name}: sitemap entry')
    for url in locs:
        path = urlsplit(url).path.lstrip('/') or 'index.html'
        if path.endswith('/'):
            path += 'index.html'
        require((ROOT / path).exists(), f'sitemap: missing page {url}')
    print(f'{count} checks passed; {len(NEW)} new pages; {len(locs)} sitemap URLs.')


if __name__ == '__main__':
    check()
