// Vercel serverless function – creates a Stripe Checkout Session.
// Prices live here (server-side) so they can't be changed from the browser.
const Stripe = require('stripe');

const PRODUCTS = {
  'bordeaux-classic': { name: 'Bordeaux Classic', cents: 8900 },
  'gold-devotion':    { name: 'Gold Devotion',    cents: 9500 },
  'peace-collection': { name: 'Peace Collection', cents: 7900 },
  'rose-garden':      { name: 'Rose Garden',      cents: 8500 },
  'midnight-vigil':   { name: 'Midnight Vigil',   cents: 9200 },
  'first-communion':  { name: 'First Communion',  cents: 6900 }
};

const COUNTRIES = (process.env.SHIP_COUNTRIES || 'DE,AT,CH,NL,BE,FR,IT,ES,PL,LU').split(',');
const SHIPPING_CENTS = parseInt(process.env.SHIPPING_CENTS || '490', 10);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Checkout is not configured yet.' });

  const { product, qty, name, email, gift, website, utm } = req.body || {};
  if (website) return res.status(200).json({ url: '/' }); // honeypot: silently drop bots

  const item = PRODUCTS[product];
  const quantity = Math.min(10, Math.max(1, parseInt(qty, 10) || 1));
  if (!item) return res.status(400).json({ error: 'Unknown rosary.' });
  if (!/^\S+@\S+\.\S+$/.test(email || '')) return res.status(400).json({ error: 'Invalid email.' });

  const site = process.env.SITE_URL || `https://${req.headers.host}`;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [{
        quantity,
        price_data: { currency: 'eur', unit_amount: item.cents, product_data: { name: item.name } }
      }],
      shipping_address_collection: { allowed_countries: COUNTRIES },
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: SHIPPING_CENTS, currency: 'eur' },
          display_name: 'Standard shipping'
        }
      }],
      phone_number_collection: { enabled: true },
      metadata: {
        customer_name: String(name || '').slice(0, 100),
        gift_note: String(gift || '').slice(0, 300),
        ...Object.fromEntries(Object.entries(utm || {}).slice(0, 4).map(([k, v]) => [k, String(v).slice(0, 100)]))
      },
      success_url: `${site}/?status=success`,
      cancel_url: `${site}/?status=cancel#collection`
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not start checkout.' });
  }
};
