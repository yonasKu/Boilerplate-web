# .well-known directory

Place the Apple Pay domain verification file here when enabling Apple Pay on production:

- Expected filename: `apple-developer-merchantid-domain-association`
- Final public URL: `https://YOUR_DOMAIN/.well-known/apple-developer-merchantid-domain-association`
- Content-type: `text/plain`
- No redirects; must be served exactly at the path above.

How to get the file:
1) Stripe Dashboard → Settings → Payments → Payment methods → Apple Pay → Set up
2) Add your production domain (e.g., `app.sproutbook.com`).
3) Download the verification file from Stripe.
4) Save it in this folder with the exact filename.
5) Deploy, then click Verify in Stripe.

Notes:
- This folder is committed so the path exists in all environments. Do NOT commit the real verification file for security; add only at deploy-time if needed.
- For staging/preview domains, you typically do NOT verify Apple Pay; verify only for the production domain.
