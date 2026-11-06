# TAMPslat advertising controls

## Upload an advert
1. Sign in with an account whose server-side role is `admin`.
2. Open `admin.html` and use **Page adverts**.
3. Upload JPG, PNG or WebP artwork (maximum 2 MB). Recommended canvas: **1200 × 160 px**; use a wide horizontal banner. Other sizes are contained rather than stretched.
4. Add a title and accessible alternative text, then upload. No destination URL is needed; the image is display-only. Campaigns can be paused, reactivated or deleted from the admin list.

The active image appears in the unobtrusive horizontal strip below page content across all HTML pages. It is not clickable and does not redirect visitors. The strip is hidden automatically when there are no active campaigns.

## Plan rules
- Free and Starter: adverts are always shown while an active campaign exists; the setting is locked.
- Pro and Business: adverts are shown by default and can be switched off in Settings. The preference is stored server-side.
- The Worker enforces the plan restriction; changing browser state cannot bypass it.

Artwork is stored in the existing Cloudflare R2 `FILES` bucket. Campaign metadata and preferences are stored in D1. No additional Cloudflare product is required.
