import os
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

import google.generativeai as genai

API_KEY = os.getenv('GOOGLE_API_KEY') or os.getenv('GEMINI_API_KEY')
if API_KEY:
    genai.configure(api_key=API_KEY)

MODEL_NAME = os.getenv('REWEAVE_GEMINI_MODEL', 'gemini-1.5-flash')

def build_product_summary(products):
    lines = []
    for p in products[:50]:
        colors = []
        for v in (p.get('variants') or []):
            opt = v.get('options') or {}
            c = opt.get('Color') or opt.get('color')
            if c:
                colors.append(str(c))
        lines.append(f"- id:{p.get('id')} name:{p.get('name')} price:RM {p.get('price')} categories:{(p.get('categories') or [])} colors:{colors}")
    return "\n".join(lines)

def build_prompt(mode, payload, products):
    product_summary = build_product_summary(products)
    if mode == 'mirror':
        colors = payload.get('colors') or []
        return (
            "You are a luxury fashion client advisor. Given wardrobe color cues: \n"
            f"colors={colors}\n"
            "and the following product catalog list: \n"
            f"{product_summary}\n"
            "Select up to 6 products that harmonize with the wardrobe palette and everyday utility. "
            "Return STRICT JSON: {\"suggestions\": [{\"id\": string, \"justification\": string}]}. "
            "Justifications must be confident luxury tone, grounding on palette/silhouette/craft and price."
        )
    else:
        occ = payload.get('occasion')
        pal = payload.get('palette')
        budget = payload.get('budget')
        return (
            "You are a luxury fashion client advisor. Build a curated shortlist.\n"
            f"occasion={occ} palette={pal} budget=RM {budget}\n"
            "Catalog: \n"
            f"{product_summary}\n"
            "Select up to 6 products aligned to the occasion, palette and budget. "
            "Return STRICT JSON: {\"suggestions\": [{\"id\": string, \"justification\": string}]}. "
            "Justifications must be confident luxury tone, grounding on palette/silhouette/craft and price."
        )

def fallback_select(mode, payload, products):
    def min_price(p):
        variants = p.get('variants') or []
        mp = p.get('price') or 0
        for v in variants:
            try:
                mp = min(mp if mp else float('inf'), float(v.get('price') or 0))
            except Exception:
                pass
        return float(mp or 0)
    picks = []
    if mode == 'mirror':
        colors = [str(c).lower() for c in (payload.get('colors') or [])]
        scored = []
        for p in products:
            variant_colors = []
            for v in (p.get('variants') or []):
                opt = v.get('options') or {}
                c = opt.get('Color') or opt.get('color')
                if c:
                    variant_colors.append(str(c).lower())
            score = 0
            for c in colors:
                if c in variant_colors:
                    score += 2
            if 'Bags' in (p.get('categories') or []):
                score += 1
            scored.append((score, p))
        scored.sort(key=lambda x: x[0], reverse=True)
        for _, p in scored[:6]:
            picks.append({'id': p.get('id'), 'justification': f"Palette harmony and refined utility. RM {min_price(p):.2f}."})
    else:
        occ = (payload.get('occasion') or '').lower()
        pal = (payload.get('palette') or '').lower()
        budget = float(payload.get('budget') or 1e9)
        filtered = []
        for p in products:
            cats = p.get('categories') or []
            ok = True
            if occ == 'work':
                ok = ('Tote' in cats) or ('Sling' in cats)
            elif occ == 'casual':
                ok = ('Pouch' in cats) or ('Sling' in cats)
            elif occ == 'evening':
                ok = ('Sling' in cats)
            if ok and (min_price(p) <= budget):
                filtered.append(p)
        filtered.sort(key=min_price)
        for p in filtered[:6]:
            picks.append({'id': p.get('id'), 'justification': f"Occasion-ready silhouette with palette alignment. RM {min_price(p):.2f}."})
    return {'suggestions': picks}

class Handler(BaseHTTPRequestHandler):
    def _set_headers(self, code=200):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/health':
            self._set_headers(200)
            self.wfile.write(json.dumps({'ok': True}).encode('utf-8'))
            return
        if parsed.path == '/suggest':
            # Informational message for GET on suggest
            self._set_headers(501)
            self.wfile.write(json.dumps({'error': 'use POST /suggest'}).encode('utf-8'))
            return
        self._set_headers(200)
        self.wfile.write(json.dumps({'service': 'reweave-suggest', 'endpoints': ['/suggest (POST)', '/health (GET)']}).encode('utf-8'))

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != '/suggest':
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'not_found'}).encode('utf-8'))
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
            body = self.rfile.read(length)
            payload = json.loads(body.decode('utf-8'))
        except Exception:
            self._set_headers(400)
            self.wfile.write(json.dumps({'error': 'bad_request'}).encode('utf-8'))
            return
        mode = payload.get('mode') or 'copilot'
        products = payload.get('products') or []
        if not products:
            self._set_headers(400)
            self.wfile.write(json.dumps({'error': 'products_required'}).encode('utf-8'))
            return
        # Try GenAI selection with simple cache
        suggestions = None
        cache_key = json.dumps({'mode': mode, 'payload': payload, 'count': len(products)})
        global _CACHE
        if cache_key in _CACHE:
            suggestions = _CACHE[cache_key]
        try:
            if API_KEY:
                model = genai.GenerativeModel(MODEL_NAME)
                prompt = build_prompt(mode, payload, products)
                resp = model.generate_content(prompt)
                txt = (resp.text or '').strip()
                data = json.loads(txt)
                suggestions = data
        except Exception:
            suggestions = None
        if not suggestions:
            suggestions = fallback_select(mode, payload, products)
        _CACHE[cache_key] = suggestions
        self._set_headers(200)
        self.wfile.write(json.dumps(suggestions).encode('utf-8'))

def run(host='127.0.0.1', port=3002):
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"Suggest server listening on http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    server.server_close()

if __name__ == '__main__':
    run()

# Simple in-memory cache
_CACHE = {}
