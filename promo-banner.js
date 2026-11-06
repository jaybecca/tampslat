/* Small, configurable product showcase rendered below each page's content/footer. */
(() => {
  const products = window.TAMPSLAT_PROMOS || [
    { name: 'TAMPOps', description: 'Web, cloud and DevSecOps solutions', url: 'https://tampops.tampconsulting.space' },
    { name: 'TAMP Education', description: 'Creative learning for children', url: 'https://education.tampconsulting.space' },
    { name: 'TAMP Consulting', description: 'People, HR and business growth', url: 'https://www.tampconsulting.space' }
  ];
  function mount() {
    if (!document.body || document.getElementById('tampslat-promo-strip') || !Array.isArray(products) || !products.length) return;
    const style = document.createElement('style');
    style.textContent = `
      #tampslat-promo-strip{box-sizing:border-box;width:100%;padding:13px clamp(14px,3vw,34px);border-top:1px solid #e7eaf2;background:#f8f9fc;color:#25304b;font:inherit}
      #tampslat-promo-strip *{box-sizing:border-box}
      #tampslat-promo-strip .ts-promo-inner{max-width:1440px;margin:0 auto;display:flex;align-items:center;gap:16px}
      #tampslat-promo-strip .ts-promo-label{flex:0 0 auto;color:#737e96;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
      #tampslat-promo-strip .ts-promo-list{min-width:0;flex:1;display:flex;align-items:center;justify-content:flex-end;gap:10px;overflow-x:auto}
      #tampslat-promo-strip .ts-promo-link{display:flex;align-items:center;gap:9px;flex:0 0 auto;padding:8px 12px;border:1px solid #e4e8f1;border-radius:10px;background:#fff;color:#273451;text-decoration:none;line-height:1.25;transition:border-color .15s,transform .15s}
      #tampslat-promo-strip .ts-promo-link:hover{border-color:#9b83ed;transform:translateY(-1px)}
      #tampslat-promo-strip .ts-promo-name{display:block;font-size:12px;font-weight:800}
      #tampslat-promo-strip .ts-promo-description{display:block;margin-top:2px;color:#7b8499;font-size:10px}
      #tampslat-promo-strip .ts-promo-arrow{color:#6946d8;font-weight:900}
      @media(max-width:640px){#tampslat-promo-strip .ts-promo-inner{align-items:flex-start;flex-direction:column;gap:8px}#tampslat-promo-strip .ts-promo-list{width:100%;justify-content:flex-start}}
    `;
    const strip = document.createElement('aside');
    strip.id = 'tampslat-promo-strip';
    strip.setAttribute('aria-label', 'Discover products and services from TAMP');
    const inner = document.createElement('div');
    inner.className = 'ts-promo-inner';
    const label = document.createElement('span');
    label.className = 'ts-promo-label';
    label.textContent = 'Explore the TAMP ecosystem';
    const list = document.createElement('div');
    list.className = 'ts-promo-list';
    products.filter(p => p && typeof p.name === 'string' && typeof p.url === 'string' && (p.url.startsWith('https://') || p.url.startsWith('http://'))).forEach(product => {
      const link = document.createElement('a');
      link.className = 'ts-promo-link';
      link.href = product.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const copy = document.createElement('span');
      const name = document.createElement('span');
      name.className = 'ts-promo-name';
      name.textContent = product.name;
      copy.appendChild(name);
      if (product.description) {
        const description = document.createElement('span');
        description.className = 'ts-promo-description';
        description.textContent = product.description;
        copy.appendChild(description);
      }
      const arrow = document.createElement('span');
      arrow.className = 'ts-promo-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';
      link.append(copy, arrow);
      list.appendChild(link);
    });
    if (!list.childElementCount) return;
    inner.append(label, list);
    strip.appendChild(inner);
    document.head.appendChild(style);
    document.body.appendChild(strip);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
