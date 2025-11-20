#!/usr/bin/env python3
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
import hashlib
import secrets
import base64
import sqlite3
from urllib.parse import urlparse, parse_qs

PORT = int(os.environ.get('PORT', '3001'))
DATA_DIR = os.path.join('backend', 'data')
LEADS_FILE = os.path.join(DATA_DIR, 'leads.json')
EVENTS_FILE = os.path.join(DATA_DIR, 'events.json')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')
SESSIONS_FILE = os.path.join(DATA_DIR, 'sessions.json')
ORDERS_FILE = os.path.join(DATA_DIR, 'orders.json')
OTPS_FILE = os.path.join(DATA_DIR, 'otps.json')
PRODUCTS_FILE = os.path.join(DATA_DIR, 'products.json')
DB_PATH = os.path.join(DATA_DIR, 'reweave.db')

os.makedirs(DATA_DIR, exist_ok=True)
for f in (LEADS_FILE, EVENTS_FILE, USERS_FILE, SESSIONS_FILE, ORDERS_FILE, PRODUCTS_FILE, OTPS_FILE):
    if not os.path.exists(f):
        with open(f, 'w') as wf:
            json.dump([], wf)

def read_leads():
    try:
        with open(LEADS_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return []

def write_leads(leads):
    with open(LEADS_FILE, 'w') as f:
        json.dump(leads, f, indent=2)

def read_events():
    try:
        with open(EVENTS_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return []

def write_events(events):
    with open(EVENTS_FILE, 'w') as f:
        json.dump(events, f, indent=2)

def read_orders():
    try:
        with open(ORDERS_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return []

def write_orders(orders):
    with open(ORDERS_FILE, 'w') as f:
        json.dump(orders, f, indent=2)

def read_products_file():
    try:
        with open(PRODUCTS_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return []

def write_products(products):
    with open(PRODUCTS_FILE, 'w') as f:
        json.dump(products, f, indent=2)

# --- SQLite helpers and bootstrap ---
def db_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = db_conn()
    cur = conn.cursor()
    # Core tables (minimal now, expandable later)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            data_json TEXT NOT NULL
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS variants (
            sku TEXT PRIMARY KEY,
            product_id TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER DEFAULT 0,
            options_json TEXT,
            FOREIGN KEY(product_id) REFERENCES products(id)
        )
    """)
    # Skeleton tables for foundation (not fully wired yet)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT,
            name TEXT,
            phone TEXT,
            marketing_consent INTEGER DEFAULT 0
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            total REAL,
            currency TEXT,
            status TEXT,
            created_at INTEGER,
            updated_at INTEGER,
            items_json TEXT
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS payments (
            id TEXT PRIMARY KEY,
            order_id TEXT,
            provider TEXT,
            amount REAL,
            status TEXT,
            payload_json TEXT,
            created_at INTEGER
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS wishlist (
            user_id TEXT,
            product_id TEXT,
            PRIMARY KEY(user_id, product_id)
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id TEXT PRIMARY KEY,
            product_id TEXT,
            user_id TEXT,
            rating INTEGER,
            title TEXT,
            body TEXT,
            created_at INTEGER
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS preorders (
            id TEXT PRIMARY KEY,
            product_id TEXT,
            user_id TEXT,
            deposit REAL,
            release_start TEXT,
            release_end TEXT,
            status TEXT
        )
    """)
    conn.commit()
    conn.close()

def db_has_products():
    try:
        conn = db_conn()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(1) AS c FROM products")
        c = cur.fetchone()
        conn.close()
        return (c and int(c[0]) > 0)
    except Exception:
        return False

def seed_products_from_json_to_db():
    products = read_products_file()
    if not products:
        return
    conn = db_conn()
    cur = conn.cursor()
    for p in products:
        pid = p.get('id')
        if not pid:
            continue
        cur.execute("INSERT OR REPLACE INTO products (id, data_json) VALUES (?,?)", (pid, json.dumps(p)))
        for v in (p.get('variants') or []):
            sku = v.get('sku')
            if not sku:
                continue
            price = float(v.get('price') or 0)
            stock = int(v.get('stock') or 0)
            options_json = json.dumps(v.get('options') or {})
            cur.execute(
                "INSERT OR REPLACE INTO variants (sku, product_id, price, stock, options_json) VALUES (?,?,?,?,?)",
                (sku, pid, price, stock, options_json)
            )
    conn.commit()
    conn.close()

def get_products_from_db():
    try:
        conn = db_conn()
        cur = conn.cursor()
        cur.execute("SELECT id, data_json FROM products")
        rows = cur.fetchall()
        prod_map = {}
        for r in rows:
            data = json.loads(r['data_json'])
            prod_map[r['id']] = data
        # attach variants
        cur.execute("SELECT sku, product_id, price, stock, options_json FROM variants")
        for r in cur.fetchall():
            p = prod_map.get(r['product_id'])
            if not p:
                continue
            vs = p.get('variants') or []
            # Replace variants with DB values (ensuring sku uniqueness)
            # Build variant object similar to file schema
            variant = {
                'sku': r['sku'],
                'price': r['price'],
                'stock': r['stock'],
                'options': json.loads(r['options_json'] or '{}')
            }
            # Avoid duplicates if already present
            if not any((v.get('sku') == variant['sku']) for v in vs):
                vs.append(variant)
            p['variants'] = vs
        conn.close()
        return list(prod_map.values())
    except Exception:
        return []

def read_products():
    # Prefer DB, fallback to file
    if db_has_products():
        prods = get_products_from_db()
        if prods:
            return prods
    return read_products_file()

def read_users():
    try:
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return []

def read_otps():
    try:
        with open(OTPS_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return []

def write_otps(otps):
    try:
        with open(OTPS_FILE, 'w') as f:
            json.dump(otps, f)
    except Exception:
        pass

def write_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

def read_sessions():
    try:
        with open(SESSIONS_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return []

def write_sessions(sessions):
    with open(SESSIONS_FILE, 'w') as f:
        json.dump(sessions, f, indent=2)

def compute_analytics_metrics():
    # Aggregate business KPIs across orders, leads, events, users
    events = read_events()
    leads = read_leads()
    orders = read_orders()
    users = read_users()

    # Basic counts
    total_orders = len(orders)
    paid_orders = [o for o in orders if (o.get('status') or '') == 'paid']
    pending_orders = [o for o in orders if (o.get('status') or '') in ('pending_payment','payment_pending','payment_initiated')]
    failed_orders = [o for o in orders if (o.get('status') or '') == 'payment_failed']

    revenue_total = sum(float(o.get('total') or 0) for o in paid_orders)
    aov = (revenue_total / len(paid_orders)) if paid_orders else 0
    leads_count = len(leads)
    events_count = len(events)

    # Wishlist totals
    wishlist_items_total = 0
    wishlist_users = 0
    for u in users:
        wl = u.get('wishlist', []) or []
        wishlist_items_total += len(wl)
        if len(wl) > 0:
            wishlist_users += 1

    # Simple conversion estimate: paid orders / leads
    conversion_rate = (len(paid_orders) / leads_count) if leads_count > 0 else 0

    # Last 7 days revenue trend (UTC day buckets)
    try:
        dtmod = __import__('datetime')
        now = dtmod.datetime.utcnow()
        day_fmt = '%Y-%m-%d'
        last7 = [(now - dtmod.timedelta(days=i)).strftime(day_fmt) for i in range(6, -1, -1)]
    except Exception:
        last7 = []
    revenue_by_day = { d: 0 for d in last7 }
    orders_by_day = { d: 0 for d in last7 }
    for o in paid_orders:
        ts = o.get('created_at') or o.get('updated_at') or 0
        try:
            dt = __import__('datetime').datetime.utcfromtimestamp(int(ts)/1000)
            dkey = dt.strftime('%Y-%m-%d')
        except Exception:
            dkey = None
        if dkey in revenue_by_day:
            revenue_by_day[dkey] += float(o.get('total') or 0)
            orders_by_day[dkey] += 1

    # Top products by frequency in paid orders
    top_products = {}
    for o in paid_orders:
        for it in (o.get('items') or []):
            pid = it.get('id') or it.get('productId') or 'unknown'
            top_products[pid] = top_products.get(pid, 0) + 1
    # Sort top products
    top_products_sorted = sorted([{ 'productId': k, 'count': v } for k, v in top_products.items()], key=lambda x: x['count'], reverse=True)

    return {
        'orders': {
            'total': total_orders,
            'paid': len(paid_orders),
            'pending': len(pending_orders),
            'failed': len(failed_orders),
        },
        'revenue': {
            'total': revenue_total,
            'currency': 'MYR',
            'aov': aov,
            'last7days': revenue_by_day,
            'orders_last7days': orders_by_day,
        },
        'leads': {
            'total': leads_count
        },
        'events': {
            'total': events_count
        },
        'wishlist': {
            'items_total': wishlist_items_total,
            'users_with_wishlist': wishlist_users
        },
        'conversion': {
            'paid_over_leads': conversion_rate
        },
        'top_products': top_products_sorted
    }

ALLOWED_ORIGINS = {'http://localhost:8000', 'http://localhost:8080'}

def set_cors(handler):
    origin = handler.headers.get('Origin', '')
    allow_origin = origin if origin in ALLOWED_ORIGINS else 'http://localhost:8000'
    handler.send_header('Access-Control-Allow-Origin', allow_origin)
    handler.send_header('Access-Control-Allow-Credentials', 'true')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    handler.send_header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')

def json_response(handler, payload, status=200):
    handler.send_response(status)
    handler.send_header('Content-Type', 'application/json')
    set_cors(handler)
    handler.end_headers()
    handler.wfile.write(json.dumps(payload).encode('utf-8'))

def text_response(handler, payload_text, status=200, content_type='text/plain'):
    handler.send_response(status)
    handler.send_header('Content-Type', content_type)
    set_cors(handler)
    handler.end_headers()
    handler.wfile.write(payload_text.encode('utf-8'))

def hash_password(password: str) -> dict:
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100_000)
    return {
        'salt': base64.b64encode(salt).decode('utf-8'),
        'hash': base64.b64encode(dk).decode('utf-8')
    }

def verify_password(password: str, salt_b64: str, hash_b64: str) -> bool:
    try:
        salt = base64.b64decode(salt_b64.encode('utf-8'))
        expected = base64.b64decode(hash_b64.encode('utf-8'))
        dk = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100_000)
        return secrets.compare_digest(dk, expected)
    except Exception:
        return False

def create_session(user_id: str) -> dict:
    token = secrets.token_hex(32)
    sessions = read_sessions()
    sess = { 'id': f'sess_{int(__import__("time").time()*1000)}', 'token': token, 'user_id': user_id, 'created_at': int(__import__('time').time()*1000) }
    sessions.append(sess)
    write_sessions(sessions)
    return sess

def get_token_from_headers(handler) -> str:
    auth = handler.headers.get('Authorization', '')
    if auth.startswith('Bearer '):
        return auth.split(' ', 1)[1]
    # Fallback to cookie
    cookie = handler.headers.get('Cookie', '')
    for part in cookie.split(';'):
        name_val = part.strip().split('=', 1)
        if len(name_val) == 2 and name_val[0] == 'reweave_session':
            return name_val[1]
    return ''

def get_user_from_request(handler):
    token = get_token_from_headers(handler)
    if not token:
        return None
    sessions = read_sessions()
    users = read_users()
    sess = next((s for s in sessions if s.get('token') == token), None)
    if not sess:
        return None
    user = next((u for u in users if u.get('id') == sess.get('user_id')), None)
    return user

class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        set_cors(self)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        query = parse_qs(parsed.query or '')
        if parsed.path == '/api/health':
            return json_response(self, { 'ok': True, 'service': 'reweave-backend', 'time': __import__('datetime').datetime.utcnow().isoformat() })
        if parsed.path == '/api/products':
            prods = read_products()
            return json_response(self, { 'ok': True, 'products': prods })
        # Product detail by id
        if parsed.path.startswith('/api/products/'):
            product_id = parsed.path.split('/api/products/', 1)[1]
            if not product_id:
                return json_response(self, { 'ok': False, 'error': 'product_id_required' }, 400)
            # Try DB first
            if db_has_products():
                try:
                    conn = db_conn()
                    conn.row_factory = sqlite3.Row
                    cur = conn.cursor()
                    cur.execute("SELECT id, title, description, category, images_json FROM products WHERE id = ?", (product_id,))
                    row = cur.fetchone()
                    if row:
                        product = {
                            'id': row['id'],
                            'title': row['title'],
                            'description': row['description'],
                            'category': row['category'],
                            'images': json.loads(row['images_json'] or '[]'),
                        }
                        cur.execute("SELECT sku, price, stock, options_json FROM variants WHERE product_id = ?", (product_id,))
                        variants = []
                        for v in cur.fetchall():
                            variants.append({
                                'sku': v['sku'],
                                'price': v['price'],
                                'stock': v['stock'],
                                'options': json.loads(v['options_json'] or '{}')
                            })
                        product['variants'] = variants
                        conn.close()
                        return json_response(self, { 'ok': True, 'product': product })
                    # Not in DB, fall back to file
                    conn.close()
                except Exception:
                    try:
                        conn.close()
                    except Exception:
                        pass
            prods = read_products_file()
            prod = next((p for p in prods if (p.get('id') == product_id or p.get('productId') == product_id)), None)
            if not prod:
                return json_response(self, { 'ok': False, 'error': 'not_found' }, 404)
            return json_response(self, { 'ok': True, 'product': prod })
        if parsed.path == '/api/leads':
            leads = read_leads()
            return json_response(self, { 'ok': True, 'count': len(leads), 'leads': leads })
        if parsed.path == '/api/events':
            events = read_events()
            return json_response(self, { 'ok': True, 'count': len(events), 'events': events })

        if parsed.path == '/api/leads.csv':
            leads = read_leads()
            cols = ['id','name','phone','interest','source','ts']
            lines = [','.join(cols)]
            for l in leads:
                row = [
                    str(l.get('id','')),
                    str(l.get('name','')).replace(',', ';'),
                    str(l.get('phone','')).replace(',', ''),
                    str(l.get('interest','')).replace(',', ';'),
                    str(l.get('source','')).replace(',', ';'),
                    str(l.get('ts',''))
                ]
                lines.append(','.join(row))
            return text_response(self, '\n'.join(lines), 200, 'text/csv')

        if parsed.path == '/api/events.csv':
            events = read_events()
            cols = ['id','type','ts','ua','payload']
            lines = [','.join(cols)]
            for e in events:
                payload_str = json.dumps(e.get('payload', {})).replace(',', ';')
                row = [
                    str(e.get('id','')),
                    str(e.get('type','')).replace(',', ';'),
                    str(e.get('ts','')),
                    str(e.get('ua','')).replace(',', ';'),
                    payload_str
                ]
                lines.append(','.join(row))
            return text_response(self, '\n'.join(lines), 200, 'text/csv')
        # Inventory lookup by SKU
        if parsed.path.startswith('/api/inventory/'):
            sku = parsed.path.split('/api/inventory/', 1)[1]
            if not sku:
                return json_response(self, { 'ok': False, 'error': 'sku_required' }, 400)
            # Try DB first
            if db_has_products():
                try:
                    conn = db_conn()
                    conn.row_factory = sqlite3.Row
                    cur = conn.cursor()
                    cur.execute("SELECT sku, product_id, price, stock, options_json FROM variants WHERE sku = ?", (sku,))
                    v = cur.fetchone()
                    if v:
                        cur.execute("SELECT title FROM products WHERE id = ?", (v['product_id'],))
                        p = cur.fetchone()
                        payload = {
                            'sku': v['sku'],
                            'productId': v['product_id'],
                            'productTitle': (p['title'] if p else ''),
                            'price': v['price'],
                            'stock': v['stock'],
                            'options': json.loads(v['options_json'] or '{}')
                        }
                        conn.close()
                        return json_response(self, { 'ok': True, 'inventory': payload })
                    conn.close()
                except Exception:
                    try:
                        conn.close()
                    except Exception:
                        pass
            # Fallback to products.json
            prods = read_products_file()
            for p in prods:
                for v in (p.get('variants') or []):
                    if v.get('sku') == sku:
                        payload = {
                            'sku': sku,
                            'productId': p.get('id') or p.get('productId'),
                            'productTitle': p.get('title') or p.get('name') or '',
                            'price': v.get('price'),
                            'stock': v.get('stock'),
                            'options': v.get('options') or {}
                        }
                        return json_response(self, { 'ok': True, 'inventory': payload })
            return json_response(self, { 'ok': False, 'error': 'not_found' }, 404)
        if parsed.path == '/api/events/summary':
            events = read_events()
            summary = {}
            for e in events:
                t = e.get('type','unknown')
                summary[t] = summary.get(t, 0) + 1
            return json_response(self, { 'ok': True, 'summary': summary })
        if parsed.path == '/api/analytics/metrics':
            metrics = compute_analytics_metrics()
            return json_response(self, { 'ok': True, 'metrics': metrics })
        if parsed.path == '/api/auth/session':
            user = get_user_from_request(self)
            if not user:
                return json_response(self, { 'ok': False, 'authenticated': False }, 401)
            safe_user = { k: user.get(k) for k in ['id','email','name','phone','marketing_consent'] }
            return json_response(self, { 'ok': True, 'authenticated': True, 'user': safe_user })

        if parsed.path.startswith('/api/auth/magic-login'):
            qs = parse_qs(parsed.query or '')
            token = (qs.get('token', [''])[0] or '').strip()
            if not token:
                return json_response(self, { 'ok': False, 'error': 'token_required' }, 400)
            otps = read_otps()
            now_ms = int(__import__('time').time()*1000)
            match = next((o for o in otps if o.get('type') == 'magic' and o.get('token') == token and o.get('expires',0) > now_ms), None)
            if not match:
                return json_response(self, { 'ok': False, 'error': 'invalid_or_expired_token' }, 400)
            email = match.get('email')
            users = read_users()
            user = next((u for u in users if u.get('email') == email), None)
            if not user:
                return json_response(self, { 'ok': False, 'error': 'user_not_found' }, 404)
            # Clean up magic token
            otps = [o for o in otps if not (o.get('type') == 'magic' and o.get('token') == token)]
            write_otps(otps)
            sess = create_session(user['id'])
            self.send_response(200)
            set_cors(self)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Set-Cookie', f"reweave_session={sess['token']}; Path=/; HttpOnly; SameSite=Lax")
            self.end_headers()
            safe_user = { k: user.get(k) for k in ['id','email','name','phone','marketing_consent'] }
            self.wfile.write(json.dumps({ 'ok': True, 'token': sess['token'], 'user': safe_user }).encode('utf-8'))
            return

        if parsed.path == '/api/me':
            user = get_user_from_request(self)
            if not user:
                return json_response(self, { 'ok': False, 'error': 'unauthorized' }, 401)
            safe_user = { k: user.get(k) for k in ['id','email','name','phone','marketing_consent'] }
            safe_user['addresses'] = user.get('addresses', [])
            safe_user['wishlist'] = user.get('wishlist', [])
            safe_user['communication_prefs'] = user.get('communication_prefs', {})
            safe_user['payment_methods'] = user.get('payment_methods', [])
            safe_user['loyalty_points'] = user.get('loyalty_points', 0)
            return json_response(self, { 'ok': True, 'user': safe_user })

        if parsed.path == '/api/addresses':
            user = get_user_from_request(self)
            if not user:
                return json_response(self, { 'ok': False, 'error': 'unauthorized' }, 401)
            return json_response(self, { 'ok': True, 'addresses': user.get('addresses', []) })

        if parsed.path == '/api/wishlist':
            user = get_user_from_request(self)
            if not user:
                return json_response(self, { 'ok': False, 'error': 'unauthorized' }, 401)
            return json_response(self, { 'ok': True, 'items': user.get('wishlist', []) })

        if parsed.path == '/api/payment-methods':
            user = get_user_from_request(self)
            if not user:
                return json_response(self, { 'ok': False, 'error': 'unauthorized' }, 401)
            return json_response(self, { 'ok': True, 'payment_methods': user.get('payment_methods', []) })

        if parsed.path == '/api/me/loyalty':
            user = get_user_from_request(self)
            if not user:
                return json_response(self, { 'ok': False, 'error': 'unauthorized' }, 401)
            return json_response(self, { 'ok': True, 'points': user.get('loyalty_points', 0) })

        if parsed.path == '/api/orders':
            # If ?all=1 provide all orders (dev convenience), else auth user's orders
            if query.get('all', ['0'])[0] == '1':
                orders = read_orders()
                return json_response(self, { 'ok': True, 'orders': orders })
            user = get_user_from_request(self)
            if not user:
                return json_response(self, { 'ok': False, 'error': 'unauthorized' }, 401)
            orders = read_orders()
            my_orders = [o for o in orders if o.get('user_id') == user.get('id')]
            return json_response(self, { 'ok': True, 'orders': my_orders })

        if parsed.path.startswith('/api/orders/'):
            order_id = parsed.path.split('/api/orders/', 1)[1]
            orders = read_orders()
            order = next((o for o in orders if o.get('id') == order_id), None)
            if not order:
                return json_response(self, { 'ok': False, 'error': 'not_found' }, 404)
            user = get_user_from_request(self)
            if user and order.get('user_id') == user.get('id'):
                return json_response(self, { 'ok': True, 'order': order })
            # Dev convenience: allow reading without auth if ?all=1 (not for production)
            if query.get('all', ['0'])[0] == '1':
                return json_response(self, { 'ok': True, 'order': order })
            return json_response(self, { 'ok': False, 'error': 'unauthorized' }, 401)

        # Default 404
        json_response(self, { 'ok': False, 'error': 'not_found' }, 404)

    def do_POST(self):
        parsed = urlparse(self.path)
        length = int(self.headers.get('Content-Length', '0'))
        body = self.rfile.read(length).decode('utf-8') if length else ''
        try:
            data = json.loads(body) if body else {}
        except Exception:
            data = {}

        if parsed.path == '/api/leads':
            name = data.get('name', '')
            phone = data.get('phone', '')
            interest = data.get('interest', 'All')
            source = data.get('source', 'onepage')
            if not phone:
                return json_response(self, { 'ok': False, 'error': 'phone_required' }, 400)
            leads = read_leads()
            lead = { 'id': f'lead_{int(__import__("time").time()*1000)}', 'name': name, 'phone': phone, 'interest': interest, 'source': source, 'ts': int(__import__('time').time()*1000) }
            leads.append(lead)
            write_leads(leads)
            return json_response(self, { 'ok': True, 'lead': lead })

        if parsed.path == '/api/checkout':
            items = data.get('items', [])
            total = data.get('total', 0)
            currency = data.get('currency', 'MYR')
            user = get_user_from_request(self)
            orders = read_orders()
            order_id = f'order_{int(__import__("time").time()*1000)}'
            order = {
                'id': order_id,
                'user_id': user.get('id') if user else None,
                'items': items,
                'total': total,
                'currency': currency,
                'status': 'pending_payment',
                'created_at': int(__import__('time').time()*1000),
                'updated_at': int(__import__('time').time()*1000)
            }
            orders.append(order)
            write_orders(orders)
            return json_response(self, { 'ok': True, 'orderId': order_id, 'total': total })

        if parsed.path == '/api/fpx/initiate':
            order_id = data.get('orderId', '')
            amount = data.get('amount', 0)
            name = data.get('name', '')
            redirect_url = f'/pages/checkout/fpx.html?name={name}&price={amount}&id={order_id}'
            # Update order status to payment_initiated
            orders = read_orders()
            updated = False
            for o in orders:
                if o.get('id') == order_id:
                    o['status'] = 'payment_initiated'
                    o['updated_at'] = int(__import__('time').time()*1000)
                    o['payment'] = { 'provider': 'fpx', 'amount': amount, 'name': name }
                    updated = True
                    break
            if updated:
                write_orders(orders)
            return json_response(self, { 'ok': True, 'redirectUrl': redirect_url })

        if parsed.path == '/api/fpx/webhook':
            # Expect { orderId, status }
            order_id = data.get('orderId')
            status = (data.get('status') or '').lower()
            orders = read_orders()
            for o in orders:
                if o.get('id') == order_id:
                    if status in ('success','paid','settled'):
                        o['status'] = 'paid'
                    elif status in ('failed','error'):
                        o['status'] = 'payment_failed'
                    else:
                        o['status'] = 'payment_pending'
                    o['updated_at'] = int(__import__('time').time()*1000)
                    break
            write_orders(orders)
            print('FPX webhook:', data)
            return json_response(self, { 'ok': True })

        if parsed.path == '/api/events':
            ev_type = data.get('type')
            payload = data.get('payload', {})
            if not ev_type:
                return json_response(self, { 'ok': False, 'error': 'type_required' }, 400)
            events = read_events()
            event = {
                'id': f'evt_{int(__import__("time").time()*1000)}',
                'type': ev_type,
                'payload': payload,
                'ts': int(__import__('time').time()*1000),
                'ua': self.headers.get('User-Agent', '')
            }
            events.append(event)
            write_events(events)
            return json_response(self, { 'ok': True, 'event': event })

        if parsed.path == '/api/auth/signup':
            email = (data.get('email') or '').strip().lower()
            password = (data.get('password') or '')
            name = (data.get('name') or '').strip()
            phone = (data.get('phone') or '').strip()
            marketing_consent = bool(data.get('marketing_consent', False))
            if not email or not password:
                return json_response(self, { 'ok': False, 'error': 'email_and_password_required' }, 400)
            users = read_users()
            if any(u for u in users if u.get('email') == email):
                return json_response(self, { 'ok': False, 'error': 'email_exists' }, 409)
            pwd = hash_password(password)
            user = {
                'id': f'user_{int(__import__("time").time()*1000)}',
                'email': email,
                'name': name,
                'phone': phone,
                'marketing_consent': marketing_consent,
                'password_salt': pwd['salt'],
                'password_hash': pwd['hash'],
                'addresses': [],
                'created_at': int(__import__('time').time()*1000)
            }
            users.append(user)
            write_users(users)
            sess = create_session(user['id'])
            # Set cookie for convenience (optional; also return token)
            self.send_response(200)
            set_cors(self)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Set-Cookie', f"reweave_session={sess['token']}; Path=/; HttpOnly; SameSite=Lax")
            self.end_headers()
            safe_user = { k: user.get(k) for k in ['id','email','name','phone','marketing_consent'] }
            self.wfile.write(json.dumps({ 'ok': True, 'token': sess['token'], 'user': safe_user }).encode('utf-8'))
            return

        if parsed.path == '/api/auth/login':
            email = (data.get('email') or '').strip().lower()
            password = (data.get('password') or '')
            users = read_users()
            user = next((u for u in users if u.get('email') == email), None)
            if not user or not verify_password(password, user.get('password_salt',''), user.get('password_hash','')):
                return json_response(self, { 'ok': False, 'error': 'invalid_credentials' }, 401)
            sess = create_session(user['id'])
            self.send_response(200)
            set_cors(self)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Set-Cookie', f"reweave_session={sess['token']}; Path=/; HttpOnly; SameSite=Lax")
            self.end_headers()
            safe_user = { k: user.get(k) for k in ['id','email','name','phone','marketing_consent'] }
            self.wfile.write(json.dumps({ 'ok': True, 'token': sess['token'], 'user': safe_user }).encode('utf-8'))
            return

        if parsed.path == '/api/auth/request-otp':
            email = (data.get('email') or '').strip().lower()
            users = read_users()
            user = next((u for u in users if u.get('email') == email), None)
            if not user:
                return json_response(self, { 'ok': False, 'error': 'user_not_found' }, 404)
            code = f"{secrets.randbelow(1000000):06d}"
            otps = read_otps()
            now_ms = int(__import__('time').time()*1000)
            expiry = now_ms + 5*60*1000
            # Remove old OTPs for this email
            otps = [o for o in otps if not (o.get('type') == 'otp' and o.get('email') == email)]
            otps.append({ 'type': 'otp', 'email': email, 'code': code, 'expires': expiry })
            write_otps(otps)
            # In production, send via email/SMS. For dev, return code.
            return json_response(self, { 'ok': True, 'sent': True, 'dev_otp': code })

        if parsed.path == '/api/auth/login-otp':
            email = (data.get('email') or '').strip().lower()
            code = (data.get('code') or '').strip()
            otps = read_otps()
            now_ms = int(__import__('time').time()*1000)
            match = next((o for o in otps if o.get('type') == 'otp' and o.get('email') == email and o.get('code') == code and o.get('expires',0) > now_ms), None)
            if not match:
                return json_response(self, { 'ok': False, 'error': 'invalid_or_expired_otp' }, 401)
            # Clean up OTP
            otps = [o for o in otps if not (o.get('type') == 'otp' and o.get('email') == email)]
            write_otps(otps)
            users = read_users()
            user = next((u for u in users if u.get('email') == email), None)
            if not user:
                return json_response(self, { 'ok': False, 'error': 'user_not_found' }, 404)
            sess = create_session(user['id'])
            self.send_response(200)
            set_cors(self)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Set-Cookie', f"reweave_session={sess['token']}; Path=/; HttpOnly; SameSite=Lax")
            self.end_headers()
            safe_user = { k: user.get(k) for k in ['id','email','name','phone','marketing_consent'] }
            self.wfile.write(json.dumps({ 'ok': True, 'token': sess['token'], 'user': safe_user }).encode('utf-8'))
            return

        if parsed.path == '/api/auth/request-magic-link':
            email = (data.get('email') or '').strip().lower()
            users = read_users()
            user = next((u for u in users if u.get('email') == email), None)
            if not user:
                return json_response(self, { 'ok': False, 'error': 'user_not_found' }, 404)
            token = secrets.token_urlsafe(32)
            otps = read_otps()
            now_ms = int(__import__('time').time()*1000)
            expiry = now_ms + 15*60*1000
            otps = [o for o in otps if not (o.get('type') == 'magic' and o.get('email') == email)]
            otps.append({ 'type': 'magic', 'email': email, 'token': token, 'expires': expiry })
            write_otps(otps)
            link = f"http://localhost:{PORT}/api/auth/magic-login?token={token}"
            # In production, email this link. For dev, return it.
            return json_response(self, { 'ok': True, 'link': link })

        if parsed.path == '/api/auth/request-reset':
            email = (data.get('email') or '').strip().lower()
            users = read_users()
            user = next((u for u in users if u.get('email') == email), None)
            if not user:
                return json_response(self, { 'ok': False, 'error': 'user_not_found' }, 404)
            token = secrets.token_urlsafe(32)
            expiry = int(__import__('time').time()*1000) + 15*60*1000
            for u in users:
                if u.get('id') == user.get('id'):
                    u['reset_token'] = token
                    u['reset_expires'] = expiry
                    break
            write_users(users)
            return json_response(self, { 'ok': True, 'sent': True, 'dev_token': token })

        if parsed.path == '/api/auth/reset':
            token = (data.get('token') or '').strip()
            new_password = (data.get('password') or '')
            if not token or not new_password:
                return json_response(self, { 'ok': False, 'error': 'token_and_password_required' }, 400)
            users = read_users()
            now_ms = int(__import__('time').time()*1000)
            user = next((u for u in users if u.get('reset_token') == token and u.get('reset_expires',0) > now_ms), None)
            if not user:
                return json_response(self, { 'ok': False, 'error': 'invalid_or_expired_token' }, 400)
            pwd = hash_password(new_password)
            for u in users:
                if u.get('id') == user.get('id'):
                    u['password_salt'] = pwd['salt']
                    u['password_hash'] = pwd['hash']
                    u.pop('reset_token', None)
                    u.pop('reset_expires', None)
                    break
            write_users(users)
            return json_response(self, { 'ok': True })

        if parsed.path == '/api/auth/logout':
            token = get_token_from_headers(self)
            if token:
                sessions = read_sessions()
                sessions = [s for s in sessions if s.get('token') != token]
                write_sessions(sessions)
            # Clear cookie
            self.send_response(200)
            set_cors(self)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Set-Cookie', "reweave_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax")
            self.end_headers()
            self.wfile.write(json.dumps({ 'ok': True }).encode('utf-8'))
            return

        if parsed.path == '/api/addresses':
            user = get_user_from_request(self)
            if not user:
                return json_response(self, { 'ok': False, 'error': 'unauthorized' }, 401)
            addr = {
                'id': f'addr_{int(__import__("time").time()*1000)}',
                'line1': (data.get('line1') or '').strip(),
                'line2': (data.get('line2') or '').strip(),
                'city': (data.get('city') or '').strip(),
                'state': (data.get('state') or '').strip(),
                'postcode': (data.get('postcode') or '').strip(),
                'country': (data.get('country') or '').strip(),
                'is_default': bool(data.get('is_default', False))
            }
            users = read_users()
            for u in users:
                if u.get('id') == user.get('id'):
                    addrs = u.get('addresses', [])
                    if addr['is_default']:
                        for a in addrs:
                            a['is_default'] = False
                    addrs.append(addr)
                    u['addresses'] = addrs
                    break
            write_users(users)
            return json_response(self, { 'ok': True, 'address': addr })

        if parsed.path == '/api/wishlist':
            user = get_user_from_request(self)
            if not user:
                return json_response(self, { 'ok': False, 'error': 'unauthorized' }, 401)
            product_id = (data.get('productId') or '').strip()
            if not product_id:
                return json_response(self, { 'ok': False, 'error': 'productId_required' }, 400)
            users = read_users()
            for u in users:
                if u.get('id') == user.get('id'):
                    wl = u.get('wishlist', [])
                    if product_id not in wl:
                        wl.append(product_id)
                    u['wishlist'] = wl
                    break
            write_users(users)
            return json_response(self, { 'ok': True, 'items': u.get('wishlist', []) })

        if parsed.path.startswith('/api/wishlist/'):
            user = get_user_from_request(self)
            if not user:
                return json_response(self, { 'ok': False, 'error': 'unauthorized' }, 401)
            product_id = parsed.path.split('/api/wishlist/', 1)[1]
            users = read_users()
            for u in users:
                if u.get('id') == user.get('id'):
                    wl = [pid for pid in u.get('wishlist', []) if pid != product_id]
                    u['wishlist'] = wl
                    break
            write_users(users)
            return json_response(self, { 'ok': True })

        if parsed.path == '/api/me/preferences':
            user = get_user_from_request(self)
            if not user:
                return json_response(self, { 'ok': False, 'error': 'unauthorized' }, 401)
            users = read_users()
            for u in users:
                if u.get('id') == user.get('id'):
                    u['marketing_consent'] = bool(data.get('marketing_consent', u.get('marketing_consent', False)))
                    prefs = data.get('communication_prefs', {})
                    if isinstance(prefs, dict):
                        u['communication_prefs'] = prefs
                    break
            write_users(users)
            return json_response(self, { 'ok': True })

        if parsed.path == '/api/payment-methods':
            user = get_user_from_request(self)
            if not user:
                return json_response(self, { 'ok': False, 'error': 'unauthorized' }, 401)
            pm = {
                'id': f"pm_{int(__import__('time').time()*1000)}",
                'brand': (data.get('brand') or 'card'),
                'last4': (data.get('last4') or '0000'),
                'exp_month': int(data.get('exp_month', 1)),
                'exp_year': int(data.get('exp_year', 2030)),
                'created_at': int(__import__('time').time()*1000)
            }
            users = read_users()
            for u in users:
                if u.get('id') == user.get('id'):
                    methods = u.get('payment_methods', [])
                    methods.append(pm)
                    u['payment_methods'] = methods
                    break
            write_users(users)
            return json_response(self, { 'ok': True, 'payment_method': pm })

        if parsed.path.startswith('/api/payment-methods/'):
            user = get_user_from_request(self)
            if not user:
                return json_response(self, { 'ok': False, 'error': 'unauthorized' }, 401)
            pm_id = parsed.path.split('/api/payment-methods/', 1)[1]
            users = read_users()
            removed = False
            for u in users:
                if u.get('id') == user.get('id'):
                    methods = [m for m in u.get('payment_methods', []) if m.get('id') != pm_id]
                    removed = len(methods) != len(u.get('payment_methods', []))
                    u['payment_methods'] = methods
                    break
            write_users(users)
            if not removed:
                return json_response(self, { 'ok': False, 'error': 'not_found' }, 404)
            return json_response(self, { 'ok': True })

        json_response(self, { 'ok': False, 'error': 'not_found' }, 404)

def run():
    # Initialize DB and seed from products.json when empty
    try:
        init_db()
        if not db_has_products():
            seed_products_from_json_to_db()
    except Exception as e:
        print('[db-init] warning:', e)
    server = HTTPServer(('localhost', PORT), Handler)
    print(f"[reweave-backend-py] listening on http://localhost:{PORT}")
    server.serve_forever()

if __name__ == '__main__':
    run()