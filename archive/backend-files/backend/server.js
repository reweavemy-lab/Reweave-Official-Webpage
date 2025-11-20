// Simple backend for Reweave – leads and checkout skeleton
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS: allow local site
app.use(cors({ origin: ['http://localhost:8000'], credentials: false }));
app.use(express.json());

// Data storage (JSON file for simplicity)
const dataDir = path.resolve('backend/data');
const leadsFile = path.join(dataDir, 'leads.json');

function ensureStorage() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(leadsFile)) fs.writeFileSync(leadsFile, '[]');
}

function readLeads() {
  try { return JSON.parse(fs.readFileSync(leadsFile, 'utf-8')); } catch { return []; }
}

function writeLeads(leads) {
  fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));
}

ensureStorage();

// Health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'reweave-backend', time: new Date().toISOString() });
});

// Products (mirror front-end SKUs)
app.get('/api/products', (req, res) => {
  res.json({
    products: [
      { id: 'pickle-tote', name: 'Reweave Pickleball Tote', price: 149 },
      { id: 'luxe-mini', name: 'Reweave Luxe Mini', prices: { Songket: 129, 'Batik/Cotton': 119 } },
      { id: 'luxe-petite', name: 'Reweave Luxe Petite', prices: { Songket: 129, 'Batik/Cotton': 119 } },
    ]
  });
});

// Leads
app.post('/api/leads', (req, res) => {
  const { name = '', phone = '', interest = 'All', source = 'onepage' } = req.body || {};
  if (!phone) return res.status(400).json({ ok: false, error: 'phone_required' });
  const leads = readLeads();
  const lead = { id: `lead_${Date.now()}`, name, phone, interest, source, ts: Date.now() };
  leads.push(lead);
  writeLeads(leads);
  res.json({ ok: true, lead });
});

app.get('/api/leads', (req, res) => {
  const leads = readLeads();
  res.json({ ok: true, count: leads.length, leads });
});

// Checkout placeholders
app.post('/api/checkout', (req, res) => {
  const { items = [], total = 0 } = req.body || {};
  const orderId = `order_${Date.now()}`;
  res.json({ ok: true, orderId, total });
});

// FPX initiate (placeholder – provider TBD)
app.post('/api/fpx/initiate', (req, res) => {
  const { orderId, amount, name } = req.body || {};
  const redirectUrl = `/pages/checkout/fpx.html?name=${encodeURIComponent(name || '')}&price=${encodeURIComponent(amount || 0)}&id=${encodeURIComponent(orderId || '')}`;
  res.json({ ok: true, redirectUrl });
});

// FPX webhook (stub)
app.post('/api/fpx/webhook', (req, res) => {
  console.log('FPX webhook payload:', req.body);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`[reweave-backend] listening on http://localhost:${PORT}`);
});