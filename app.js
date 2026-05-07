const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const seoChecks = [
  { key: 'title', label: 'Title 標題', category: 'On-page', priority: '高', fix: '每頁設定唯一標題，建議 30–60 字並放入核心關鍵字。' },
  { key: 'description', label: 'Meta Description', category: 'On-page', priority: '高', fix: '撰寫 80–160 字摘要，包含價值主張與自然關鍵字。' },
  { key: 'h1', label: 'H1 結構', category: '內容', priority: '高', fix: '每頁保留一個清楚 H1，且與搜尋意圖一致。' },
  { key: 'canonical', label: 'Canonical URL', category: '索引', priority: '高', fix: '為可索引頁設定 canonical，避免重複內容分散權重。' },
  { key: 'robots', label: 'Robots Meta', category: '索引', priority: '高', fix: '確認重要頁面沒有 noindex / nofollow。' },
  { key: 'viewport', label: 'Mobile Viewport', category: '技術', priority: '高', fix: '加入 viewport meta，確保行動裝置可正常瀏覽。' },
  { key: 'images', label: '圖片 Alt', category: '內容', priority: '中', fix: '為有資訊價值的圖片補上描述性 alt。' },
  { key: 'headings', label: 'Heading 階層', category: '內容', priority: '中', fix: '依 H1→H2→H3 組織內容，不要跳階或以標題做樣式裝飾。' },
  { key: 'schema', label: '結構化資料', category: '進階', priority: '中', fix: '加入 JSON-LD Schema，例如 Organization、Article、Product、Breadcrumb。' },
  { key: 'social', label: 'Open Graph / Twitter Card', category: '分享', priority: '中', fix: '補齊 og:title、og:description、og:image 與 twitter:card。' },
  { key: 'lang', label: 'HTML 語言', category: '可用性', priority: '低', fix: '在 html 標籤設定 lang，例如 zh-Hant。' },
  { key: 'favicon', label: 'Favicon', category: '品牌', priority: '低', fix: '設定 favicon / apple-touch-icon 提升品牌辨識。' },
];

const techSignatures = [
  { name: 'WordPress', category: 'CMS', patterns: ['wp-content', 'wp-includes', 'wordpress'] },
  { name: 'WooCommerce', category: 'Ecommerce', patterns: ['woocommerce', 'wc-cart-fragments', 'wc-blocks'] },
  { name: 'Shopify', category: 'Ecommerce', patterns: ['cdn.shopify.com', 'shopify.theme', 'myshopify.com'] },
  { name: 'SHOPLINE', category: 'Ecommerce', patterns: ['shoplineapp.com', 'shopline', 'shoplytics'] },
  { name: '91APP', category: 'Ecommerce', patterns: ['91app', 'nineyi', '91mai'] },
  { name: 'Cyberbiz', category: 'Ecommerce', patterns: ['cyberbiz', 'cyberbiz.io'] },
  { name: 'WACA', category: 'Ecommerce', patterns: ['waca', 'waca.ec'] },
  { name: 'QDM', category: 'Ecommerce', patterns: ['qdm', 'qdm.cloud'] },
  { name: 'EasyStore', category: 'Ecommerce', patterns: ['easystore', 'easy.co'] },
  { name: 'Magento / Adobe Commerce', category: 'Ecommerce', patterns: ['mage/cookies', 'magento', 'x-magento'] },
  { name: 'OpenCart', category: 'Ecommerce', patterns: ['catalog/view/theme', 'route=product', 'opencart'] },
  { name: 'PrestaShop', category: 'Ecommerce', patterns: ['prestashop', 'modules/ps_'] },
  { name: 'Wix', category: 'Website Builder', patterns: ['wixstatic.com', 'wix.com', 'x-wix'] },
  { name: 'Squarespace', category: 'Website Builder', patterns: ['squarespace', 'static1.squarespace.com'] },
  { name: 'Webflow', category: 'Website Builder', patterns: ['webflow', 'assets.website-files.com'] },
  { name: 'React', category: 'Frontend', patterns: ['react', '__react', 'data-reactroot'] },
  { name: 'Vue.js', category: 'Frontend', patterns: ['vue', '__vue__', 'data-v-'] },
  { name: 'Next.js', category: 'Frontend', patterns: ['__next_data__', '/_next/static'] },
  { name: 'Nuxt', category: 'Frontend', patterns: ['__nuxt__', '/_nuxt/'] },
  { name: 'Google Analytics / GA4', category: 'Analytics', patterns: ['gtag/js', 'google-analytics.com', 'G-'] },
  { name: 'Google Tag Manager', category: 'Tag Manager', patterns: ['googletagmanager.com/gtm.js', 'GTM-'] },
  { name: 'Meta Pixel', category: 'Ads', patterns: ['connect.facebook.net', 'fbq('] },
  { name: 'Cloudflare', category: 'CDN / Security', patterns: ['cloudflare', 'cf-ray', '__cf_bm'] },
  { name: 'Stripe', category: 'Payment', patterns: ['js.stripe.com', 'stripe'] },
  { name: 'PayPal', category: 'Payment', patterns: ['paypal.com/sdk/js', 'paypalobjects'] },
];

function routeTo(id) {
  const route = id || location.hash.replace('#', '') || 'home';
  $$('.page').forEach(page => page.classList.toggle('active', page.id === route));
  $$('.nav-links a, .hero-actions a').forEach(link => link.classList.toggle('active', link.dataset.route === route));
  if (!document.getElementById(route)) routeTo('home');
}

window.addEventListener('hashchange', () => routeTo());
routeTo();

$('.nav-toggle').addEventListener('click', () => {
  const links = $('#navLinks');
  const isOpen = links.classList.toggle('open');
  $('.nav-toggle').setAttribute('aria-expanded', String(isOpen));
});

async function fetchHtml(url) {
  const normalized = url.startsWith('http') ? url : `https://${url}`;
  const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(normalized)}`;
  const response = await fetch(proxy);
  if (!response.ok) throw new Error('無法讀取目標網站，請貼上 HTML 後再分析。');
  return { html: await response.text(), url: normalized };
}

function parseDocument(html) {
  return new DOMParser().parseFromString(html, 'text/html');
}

function textLen(text = '') { return text.trim().replace(/\s+/g, ' ').length; }
function statusBadge(status) { return `<span class="badge ${status}">${status === 'pass' ? '通過' : status === 'warn' ? '警告' : status === 'fail' ? '需修正' : '資訊'}</span>`; }

function analyzeSeo(html, url = '') {
  const doc = parseDocument(html);
  const title = doc.querySelector('title')?.textContent.trim() || '';
  const description = doc.querySelector('meta[name="description" i]')?.content.trim() || '';
  const h1s = $$('h1', doc).map(h => h.textContent.trim()).filter(Boolean);
  const canonical = doc.querySelector('link[rel="canonical" i]')?.href || '';
  const robots = doc.querySelector('meta[name="robots" i]')?.content || '未設定';
  const viewport = doc.querySelector('meta[name="viewport" i]')?.content || '';
  const imgs = $$('img', doc);
  const missingAlt = imgs.filter(img => !img.hasAttribute('alt') || !img.getAttribute('alt').trim()).length;
  const headings = $$('h1,h2,h3,h4,h5,h6', doc).map(h => ({ level: Number(h.tagName.slice(1)), text: h.textContent.trim() }));
  const schemas = $$('script[type="application/ld+json" i]', doc).length;
  const ogCount = $$('meta[property^="og:" i]', doc).length;
  const twitterCount = $$('meta[name^="twitter:" i]', doc).length;
  const lang = doc.documentElement.getAttribute('lang') || '';
  const favicon = doc.querySelector('link[rel*="icon" i]')?.href || '';
  const links = $$('a[href]', doc);
  let host = '';
  try { host = url ? new URL(url).hostname : ''; } catch { host = ''; }
  const internalLinks = host ? links.filter(a => a.href.includes(host)).length : 0;
  const externalLinks = links.length - internalLinks;
  const bodyText = doc.body?.innerText || doc.body?.textContent || '';
  const wordCount = (bodyText.match(/[\p{L}\p{N}]+/gu) || []).length;

  const checks = [
    { key: 'title', status: title && textLen(title) <= 60 && textLen(title) >= 10 ? 'pass' : title ? 'warn' : 'fail', detail: title ? `${textLen(title)} 字：${title}` : '缺少 title。' },
    { key: 'description', status: description && textLen(description) <= 160 && textLen(description) >= 50 ? 'pass' : description ? 'warn' : 'fail', detail: description ? `${textLen(description)} 字：${description}` : '缺少 meta description。' },
    { key: 'h1', status: h1s.length === 1 ? 'pass' : h1s.length > 1 ? 'warn' : 'fail', detail: `找到 ${h1s.length} 個 H1${h1s[0] ? `：${h1s[0]}` : ''}` },
    { key: 'canonical', status: canonical ? 'pass' : 'warn', detail: canonical || '未設定 canonical。' },
    { key: 'robots', status: /noindex|nofollow/i.test(robots) ? 'fail' : 'pass', detail: robots },
    { key: 'viewport', status: viewport ? 'pass' : 'fail', detail: viewport || '缺少 viewport meta。' },
    { key: 'images', status: imgs.length === 0 || missingAlt === 0 ? 'pass' : missingAlt / imgs.length > 0.35 ? 'fail' : 'warn', detail: `${imgs.length} 張圖片，${missingAlt} 張缺少 alt。` },
    { key: 'headings', status: headings.length && h1s.length ? 'pass' : 'warn', detail: `共 ${headings.length} 個 heading。` },
    { key: 'schema', status: schemas ? 'pass' : 'warn', detail: `找到 ${schemas} 組 JSON-LD。` },
    { key: 'social', status: ogCount >= 2 ? 'pass' : 'warn', detail: `Open Graph ${ogCount} 個；Twitter ${twitterCount} 個。` },
    { key: 'lang', status: lang ? 'pass' : 'warn', detail: lang || 'html 未設定 lang。' },
    { key: 'favicon', status: favicon ? 'pass' : 'warn', detail: favicon || '未偵測到 favicon。' },
  ];
  const score = Math.round(checks.reduce((sum, item) => sum + (item.status === 'pass' ? 8.34 : item.status === 'warn' ? 4.2 : 0), 0));
  return { title, description, checks, score: Math.min(score, 100), headings, wordCount, links: { total: links.length, internalLinks, externalLinks }, url };
}

function renderAnalysis(report) {
  const failing = report.checks.filter(c => c.status !== 'pass');
  $('#analysisOutput').innerHTML = `
    <article class="result-card full score-summary">
      <div class="score-ring small-score" style="background: conic-gradient(${report.score >= 80 ? 'var(--ok)' : report.score >= 55 ? 'var(--warn)' : 'var(--bad)'} 0 ${report.score}%, rgba(255,255,255,.12) ${report.score}% 100%)"><span>${report.score}</span><small>/100</small></div>
      <div><h2>SEO 健康分數</h2><p class="hero-text">${failing.length ? `找到 ${failing.length} 個建議修正項目，請優先處理高優先級項目。` : '所有核心項目皆通過。'}</p></div>
    </article>
    <article class="result-card"><h3>${statusBadge('info')} 核心指標</h3><ul class="metric-list">
      <li><strong>字數：</strong>${report.wordCount}</li><li><strong>連結：</strong>${report.links.total}（內部 ${report.links.internalLinks} / 外部 ${report.links.externalLinks}）</li><li><strong>Title：</strong>${report.title || '未設定'}</li><li><strong>Description：</strong>${report.description || '未設定'}</li>
    </ul></article>
    <article class="result-card"><h3>${statusBadge('info')} Heading 大綱</h3><ul class="metric-list">${report.headings.slice(0, 12).map(h => `<li><strong>H${h.level}</strong> ${escapeHtml(h.text || '(空白)')}</li>`).join('') || '<li>未找到 heading。</li>'}</ul></article>
    <article class="result-card full"><h3>${statusBadge('fail')} SEO 修正建議</h3><ul class="fix-list">${report.checks.map(check => {
      const meta = seoChecks.find(item => item.key === check.key);
      return `<li>${statusBadge(check.status)} <strong>${meta.label}</strong>（${meta.category}｜優先級：${meta.priority}）<br>${escapeHtml(check.detail)}<br><strong>建議：</strong>${meta.fix}</li>`;
    }).join('')}</ul></article>`;
}

$('#analyzerForm').addEventListener('submit', async event => {
  event.preventDefault();
  $('#analysisStatus').textContent = '分析中...';
  $('#analysisOutput').innerHTML = '';
  try {
    const pasted = $('#htmlInput').value.trim();
    const url = $('#targetUrl').value.trim();
    const payload = pasted ? { html: pasted, url } : await fetchHtml(url);
    renderAnalysis(analyzeSeo(payload.html, payload.url));
    $('#analysisStatus').textContent = '分析完成。';
  } catch (error) {
    $('#analysisStatus').textContent = error.message;
  }
});

function detectTech(html, url = '') {
  const haystack = `${html} ${url}`.toLowerCase();
  return techSignatures.map(sig => {
    const hits = sig.patterns.filter(pattern => haystack.includes(pattern.toLowerCase()));
    return hits.length ? { ...sig, hits, confidence: Math.min(98, 52 + hits.length * 16) } : null;
  }).filter(Boolean).sort((a, b) => b.confidence - a.confidence);
}

function renderTech(results) {
  const grouped = results.reduce((acc, item) => ((acc[item.category] ||= []).push(item), acc), {});
  $('#techOutput').innerHTML = Object.entries(grouped).map(([category, items]) => `
    <article class="tech-group"><h2>${category}</h2>${items.map(item => `<div class="tech-item"><span><strong>${item.name}</strong><br><small>命中：${item.hits.map(escapeHtml).join(', ')}</small></span><span class="confidence">${item.confidence}%</span></div>`).join('')}</article>
  `).join('') || '<article class="tech-group"><h2>未偵測到明確技術</h2><p class="hero-text">請貼上更多 HTML 原始碼，或使用可由瀏覽器讀取的公開網址。</p></article>';
}

$('#techForm').addEventListener('submit', async event => {
  event.preventDefault();
  $('#techStatus').textContent = '偵測中...';
  try {
    const pasted = $('#techHtml').value.trim();
    const url = $('#techUrl').value.trim();
    const payload = pasted ? { html: pasted, url } : await fetchHtml(url);
    renderTech(detectTech(payload.html, payload.url));
    $('#techStatus').textContent = '偵測完成。';
  } catch (error) {
    $('#techStatus').textContent = error.message;
  }
});

function escapeHtml(value = '') {
  return value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function updateSerp() {
  const title = $('#serpTitle').value.trim();
  const desc = $('#serpDesc').value.trim();
  $('#serpPreviewTitle').textContent = title || '你的頁面標題會顯示在這裡';
  $('#serpPreviewDesc').textContent = desc || '描述會顯示在這裡，建議清楚說明頁面價值並包含自然關鍵字。';
  $('#serpCounter').textContent = `標題 ${textLen(title)} 字；描述 ${textLen(desc)} 字`;
}
$('#serpTitle').addEventListener('input', updateSerp);
$('#serpDesc').addEventListener('input', updateSerp);

$('#densityBtn').addEventListener('click', () => {
  const words = ($('#densityText').value.toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) || []).filter(w => !['https', 'www', 'com'].includes(w));
  const counts = words.reduce((acc, word) => ((acc[word] = (acc[word] || 0) + 1), acc), {});
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  $('#densityOutput').innerHTML = top.map(([word, count]) => `<div><strong>${escapeHtml(word)}</strong>：${count} 次（${((count / words.length) * 100).toFixed(1)}%）</div>`).join('') || '請先貼上文字。';
});

$('#robotsBtn').addEventListener('click', () => {
  const sitemap = $('#robotsSitemap').value.trim();
  const mode = $('#robotsMode').value;
  const lines = ['User-agent: *'];
  if (mode === 'block-all') lines.push('Disallow: /');
  if (mode === 'allow') lines.push('Allow: /');
  if (mode === 'block-private') lines.push('Allow: /', 'Disallow: /admin', 'Disallow: /cart', 'Disallow: /checkout');
  if (sitemap) lines.push('', `Sitemap: ${sitemap}`);
  $('#robotsOutput').textContent = lines.join('\n');
});

$('#sitemapBtn').addEventListener('click', () => {
  const root = $('#siteRoot').value.trim().replace(/\/$/, '');
  const paths = $('#pathsInput').value.split('\n').map(p => p.trim()).filter(Boolean);
  const urls = paths.map(path => `${root}${path.startsWith('/') ? path : `/${path}`}`);
  $('#sitemapOutput').textContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${escapeHtml(url)}</loc></url>`).join('\n')}\n</urlset>`;
});

$('#utmBtn').addEventListener('click', () => {
  try {
    const url = new URL($('#utmUrl').value.trim());
    [['utm_source', '#utmSource'], ['utm_medium', '#utmMedium'], ['utm_campaign', '#utmCampaign']].forEach(([key, selector]) => {
      const value = $(selector).value.trim();
      if (value) url.searchParams.set(key, value);
    });
    $('#utmOutput').textContent = url.toString();
  } catch {
    $('#utmOutput').textContent = '請輸入有效網址。';
  }
});

const checklist = [
  ['索引與爬蟲', '確認 robots.txt、meta robots、canonical、sitemap.xml、狀態碼與重複內容。'],
  ['頁面標題', '每個重要頁面都有唯一 title，長度適中並符合搜尋意圖。'],
  ['內容品質', '補足主題深度、FAQ、實體關聯詞、作者/品牌信任訊號與更新日期。'],
  ['網站架構', '首頁、分類、文章、產品頁具備清楚內部連結與麵包屑。'],
  ['技術體驗', '檢查行動版、Core Web Vitals、圖片壓縮、懶載入與 JS 可索引性。'],
  ['結構化資料', '依頁面類型導入 Organization、LocalBusiness、Article、Product、FAQ、Breadcrumb。'],
  ['國際化', '多語網站設定 hreflang、語言屬性與區域化 URL。'],
  ['追蹤衡量', '串接 GA4、GTM、Search Console，建立轉換與 SEO 儀表板。'],
  ['安全與信任', '全站 HTTPS、無混合內容、清楚聯絡方式、隱私權與退換貨政策。'],
];
$('#checklistGrid').innerHTML = checklist.map(([title, desc]) => `<article class="check-card"><h2>${title}</h2><p>${desc}</p></article>`).join('');
