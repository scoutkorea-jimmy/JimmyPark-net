#!/usr/bin/env python3
"""Check the portfolio layout contract. No packages, network, browser or KV access.
Run: python3 .checks/design.py
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parent.parent
PAGES = ('index.html', 'work.html', 'scouting.html', 'contact.html')
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
SPACING = re.compile(r'^(?:padding|margin)(?:-.+)?$|^(?:gap|row-gap|column-gap|border-radius)$')

class Node:
    def __init__(self, tag='', attrs=(), parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs), parent, []
    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.walk()
    def elements(self):
        return [child for child in self.children if isinstance(child, Node)]
    def classes(self):
        return self.attrs.get('class', '').split()
    def style(self):
        return dict((key.strip(), value.strip()) for declaration in self.attrs.get('style','').split(';') if ':' in declaration for key, value in [declaration.split(':',1)])
    def signature(self):
        # Formatting whitespace is irrelevant; class/attribute semantics are not.
        children = [child.signature() if isinstance(child, Node) else ' '.join(child.split()) for child in self.children]
        return [self.tag, sorted(self.attrs.items()), [child for child in children if child]]

class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]
    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.stack[-1])
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)
    def handle_endtag(self, tag):
        assert len(self.stack) > 1 and self.stack[-1].tag == tag, f'Unbalanced </{tag}>'
        self.stack.pop()
    def handle_data(self, text):
        self.stack[-1].children.append(text)

def parse(html):
    parser = Parser()
    parser.feed(html)
    assert len(parser.stack) == 1, 'Unclosed HTML element'
    return parser.root

def check():
    css = (ROOT / 'assets/site.css').read_text()
    defined = set(re.findall(r'(--[a-z0-9-]+)\s*:', css))
    rendered = json.loads(subprocess.check_output(['node', str(ROOT / '.checks/render-collections.cjs')], cwd=ROOT))
    trees = {}
    shells = {}
    for file in PAGES:
        source = (ROOT / file).read_text()
        tree = trees[file] = parse(source)
        nodes = list(tree.walk())
        body = next(n for n in nodes if n.tag == 'body')
        assert 'portfolio' in body.classes(), f'{file}: missing portfolio scope'
        assert len([n for n in nodes if n.tag == 'h1']) == 1, f'{file}: exactly one H1 required'
        assert len([n for n in nodes if n.tag == 'main']) == 1, f'{file}: exactly one main required'
        ids = [n.attrs['id'] for n in nodes if 'id' in n.attrs]
        assert len(ids) == len(set(ids)), f'{file}: duplicate anchor ID'
        sections = [n for n in nodes if 'data-section' in n.attrs]
        assert [n.attrs['data-section'] for n in sections] == rendered[file]['order'], f'{file}: static/CMS order mismatch'
        for section in sections:
            label = f'{file}#{section.attrs["data-section"]}'
            assert section.tag == 'section' and section.parent.tag == 'main', f'{label}: sections must be direct main children'
            assert 'site-section' in section.classes(), f'{label}: missing shared section spacing'
            assert not any(SPACING.match(p) or p in ('width','max-width') for p in section.style()), f'{label}: inline layout override'
            children = section.elements()
            assert len(children) == 1 and 'site-container' in children[0].classes(), f'{label}: one shared container required'
            assert not any(p.startswith(('padding','margin')) or p in ('width','max-width') for p in children[0].style()), f'{label}: container gutter override'
            if section.attrs['data-section'] == 'cta':
                assert 'site-section--cta' in section.classes(), f'{label}: missing independent CTA spacing'
                assert 'cta-panel' in children[0].elements()[0].classes(), f'{label}: missing shared CTA panel'
        for node in nodes:
            for prop, value in node.style().items():
                if SPACING.match(prop):
                    assert not re.search(r'\d(?:px|rem|em|vw|vh)\b|clamp\(', value), f'{file}: use a spacing token for {prop}: {value}'
            if node.tag in ('h1','h2','h3'):
                assert not {'font-size','line-height'} & node.style().keys(), f'{file}: heading scale must come from shared CSS'
            if 'data-travel-count' in node.attrs:
                assert ''.join(c for c in node.children if isinstance(c,str)).strip() == str(rendered['travelCount']), f'{file}: static travel count must match destinations'
            if node.tag == 'img':
                assert 'alt' in node.attrs, f'{file}: image needs alt text'
            container_classes = {'pills': 'tag-list', 'intlTags': 'tag-list', 'photoDeliverables': 'deliverable-list'}
            expected_class = container_classes.get(node.attrs.get('data-template'))
            if expected_class:
                assert expected_class in node.classes(), f'{file}: missing collection spacing class {expected_class}'
            if 'data-collection' in node.attrs:
                expected = parse(rendered[file]['collections'][node.attrs['data-collection']])
                actual = Node()
                actual.children = node.children
                assert actual.signature() == expected.signature(), f'{file}: static/runtime drift in {node.attrs["data-collection"]}'
            for attr in ('src','href'):
                url = urlsplit(node.attrs.get(attr, ''))
                if url.path.startswith('/assets/'):
                    assert (ROOT / unquote(url.path[1:])).is_file(), f'{file}: missing asset {url.path}'
        used = set(re.findall(r'var\((--[a-z0-9-]+)', source))
        assert used <= defined, f'{file}: undefined tokens {used - defined}'
        for tag in ('header','footer'):
            shell = next(n for n in nodes if n.tag == tag).signature()
            if tag in shells:
                assert shell == shells[tag], f'{file}: shared {tag} drift'
            shells[tag] = shell
    for file, tree in trees.items():
        for node in tree.walk():
            if node.tag != 'a' or 'href' not in node.attrs:
                continue
            url = urlsplit(node.attrs['href'])
            if url.scheme or url.netloc:
                continue
            target = file if not url.path else 'index.html' if url.path == '/' else url.path.strip('/') + ('' if url.path.endswith('.html') else '.html')
            assert target in trees or target == 'insights.html', f'{file}: unknown route {url.path}'
            if url.fragment:
                assert any(n.attrs.get('id') == url.fragment for n in trees[target].walk()), f'{file}: missing anchor {node.attrs["href"]}'
    used = set(re.findall(r'var\((--[a-z0-9-]+)', css))
    assert used <= defined, f'CSS: undefined tokens {used - defined}'
    print('PASS: 4 pages — section/CTA spacing, container alignment, tokens, heading scale, shared shell, static/CMS collection parity, routes and assets.')

if __name__ == '__main__':
    check()
