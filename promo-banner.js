/* Admin-managed TAMPslat promotions. Campaign artwork is served by the main Worker. */
(() => {
  async function mount() {
    if (!document.body || document.getElementById('tampslat-promo-strip')) return;
    try {
      const response = await fetch('/api/ads/active', { credentials: 'include', headers: { Accept: 'application/json' } });
      if (!response.ok) return;
      const data = await response.json();
      const ads = Array.isArray(data.ads) ? data.ads : [];
      if (!ads.length) return;
      const style = document.createElement('style');
      style.textContent = `
        #tampslat-promo-strip{box-sizing:border-box;width:100%;padding:8px clamp(12px,3vw,30px);border-top:1px solid #e7eaf2;background:#f8f9fc;color:#25304b;font:inherit}
        #tampslat-promo-strip *{box-sizing:border-box}
        #tampslat-promo-strip .ts-ad-inner{max-width:1440px;margin:0 auto;display:flex;align-items:center;gap:12px}
        #tampslat-promo-strip .ts-ad-label{flex:0 0 auto;color:#737e96;font-size:9px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}
        #tampslat-promo-strip .ts-ad-list{min-width:0;flex:1;display:flex;align-items:center;justify-content:center;gap:10px;overflow-x:auto}
        #tampslat-promo-strip .ts-ad-link{display:block;flex:1 1 0;min-width:0;max-width:100%;text-align:center}
        #tampslat-promo-strip img{display:block;width:100%;max-width:1200px;max-height:112px;height:auto;object-fit:contain;margin:auto;border-radius:8px}
        #tampslat-promo-strip .ts-ad-copy{display:block;color:#737e96;font-size:10px;margin-top:3px}
        @media(max-width:640px){#tampslat-promo-strip .ts-ad-inner{align-items:flex-start;flex-direction:column;gap:5px}#tampslat-promo-strip .ts-ad-list{width:100%;justify-content:flex-start}#tampslat-promo-strip img{max-height:88px}}
      `;
      const strip = document.createElement('aside');
      strip.id = 'tampslat-promo-strip';
      strip.setAttribute('aria-label', 'Sponsored promotions');
      const inner = document.createElement('div');
      inner.className = 'ts-ad-inner';
      const label = document.createElement('span');
      label.className = 'ts-ad-label';
      label.textContent = 'Sponsored';
      const list = document.createElement('div');
      list.className = 'ts-ad-list';
      ads.forEach(ad => {
        if (!ad || typeof ad.imageUrl !== 'string') return;
        const item = document.createElement('div');
        item.className = 'ts-ad-link';
        const image = document.createElement('img');
        image.src = ad.imageUrl;
        image.alt = ad.alt_text || ad.title || 'Sponsored advert';
        image.loading = 'lazy';
        image.decoding = 'async';
        item.appendChild(image);
        if (ad.description) {
          const caption = document.createElement('span');
          caption.className = 'ts-ad-copy';
          caption.textContent = ad.description;
          item.appendChild(caption);
        }
        list.appendChild(item);
      });
      if (!list.childElementCount) return;
      inner.append(label, list);
      strip.appendChild(inner);
      document.head.appendChild(style);
      document.body.appendChild(strip);
    } catch { /* Ads are non-blocking; app use continues if the ad service is unavailable. */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
