# Grace & Devotion – Rosary order page

Static page (`index.html`) + one serverless function (`api/checkout.js`) that creates a Stripe Checkout Session.

## Go live
1. Create a new Vercel project with **Root Directory = `grace-devotion`**.
2. Add environment variables:
   - `STRIPE_SECRET_KEY` – start with the `sk_test_…` key, switch to live when ready
   - `SITE_URL` – e.g. `https://order.graceanddevotion.com`
   - optional: `SHIPPING_CENTS` (default 490), `SHIP_COUNTRIES` (default `DE,AT,CH,NL,BE,FR,IT,ES,PL,LU`)
3. Test with card `4242 4242 4242 4242`.
4. Instagram link: `https://your-domain/?utm_source=instagram&utm_medium=reel&utm_campaign=<reel-name>` – the tags are saved on every Stripe order.

## Change products / prices
Edit both the `PRODUCTS` array in `index.html` (display) and `PRODUCTS` in `api/checkout.js` (what is actually charged). Real photos: set `photo: 'images/xyz.jpg'` on a product.
