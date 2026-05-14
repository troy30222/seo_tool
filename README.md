# SEO Compass

SEO Compass 是一個純前端、免註冊的 SEO 工具網站範例，提供：

- **網站 SEO 完整檢測**：輸入網址後會先爬取 robots.txt、sitemap.xml、站內連結與同網域 JS/CSS，待所有可讀取內容載入完成後，檢查 Title、Meta Description、H1、Canonical、Robots、Viewport、圖片 Alt、Heading、Schema、社群分享標籤、語言與 Favicon，並輸出整站分數、問題與修正建議。
- **網站技術查詢**：整站載入頁面與同網域資源後，用 HTML / JS / CSS 特徵偵測 CMS、電商平台、前端框架、分析追蹤、CDN 與付款工具，包含 WordPress、WooCommerce、Shopify、SHOPLINE、91APP、Cyberbiz、WACA、QDM、Magento、Wix 等常見平台。
- **SEO 工具箱**：SERP 預覽、關鍵字密度分析、robots.txt 產生器、sitemap XML 產生器與 UTM 追蹤網址產生器。
- **SEO 修正清單**：整理上線前與內容發佈前應檢查的技術 SEO、內容、結構化資料與追蹤衡量項目。

## 本機執行

```bash
python3 -m http.server 8080
```

開啟 <http://127.0.0.1:8080/>。
測試網址 : https://troy30222.github.io/seo_tool/
## 使用限制

遠端網址檢測會使用公開 CORS 代理並盡量讀取 sitemap、站內連結與同網域資源，因此可能受目標網站防火牆、CORS、robots 規範或代理服務穩定度影響。前端安全上限為 80 頁與 80 個 JS/CSS 資源；若網址抓取失敗，請改貼頁面 HTML 原始碼以取得完整檢測結果。正式商用建議搭配後端 crawler、排程檢測與 Lighthouse / PageSpeed API。
