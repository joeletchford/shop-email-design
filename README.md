# shop-email-design

Live at: https://shop-email-design.quick.shopify.io

Human-readable, click-to-copy reference for the `shop/v2` email design system
in Mozart. Generated from:

- `//areas/platforms/mozart/app/views/emails/libraries/shop/v2/design_tokens.yaml`
- every `_sh*.manifest.yaml` under `shop/v2/`
- every thumbnail under `web/assets/emails/shop/v2/`

## How to redeploy after a tokens/library change

From a World checkout with `//areas/platforms/mozart` in sparse-checkout:

```bash
cd ~/world/trees/root/src/areas/platforms/mozart

# Regenerate the HTML into this Quick site repo
ruby bin/shop_email_design_preview.rb --out=/tmp/quick-sites/shop-email-design/index.html

# Commit and deploy
cd /tmp/quick-sites/shop-email-design
git add -A
git commit -m "Update design reference to match design_tokens.yaml"
git \
  -c http.extraHeader="Authorization: Bearer $RIVER_SESSION_JWT" \
  -c http.extraHeader="On-Behalf-Of: $USER_EMAIL" \
  push origin main

git \
  -c http.extraHeader="Authorization: Bearer $RIVER_SESSION_JWT" \
  -c http.extraHeader="On-Behalf-Of: $USER_EMAIL" \
  push origin main:deploy
```

Live in ~15s.

## Future: GitHub Action auto-deploy

Planned follow-up: a GHA that runs on merges touching
`areas/platforms/mozart/app/views/emails/libraries/shop/v2/**` or
`areas/platforms/mozart/bin/shop_email_design_preview.rb` and auto-deploys.
Blocker: need to sort the auth pattern for GHA → Quick pushes.
