# 消費機會成本計算器

原生 HTML、CSS、JavaScript 靜態工具，無外部依賴、無建置流程。

直接開啟 `index.html` 即可計算。預設本金 NT$800,000、年化報酬率 6%，依 `FV = PV × (1 + r)^n` 計算 5、10、20、30 年後的資產總值與額外複利收益。

## GitHub Pages

1. 將全部檔案（包含 `icons` 目錄）提交到 GitHub repository 的 `main` 分支根目錄。
2. 在 repository 的 Settings → Pages 選擇 Deploy from a branch，指定 `main` 和 `/ (root)`。
3. 開啟 Pages 提供的 HTTPS 網址。

Android Chrome 可透過瀏覽器選單安裝或加入主畫面。首次連線開啟並完成 Service Worker 快取後，即可離線使用。PWA 安裝與 Service Worker 需要 HTTPS 或 localhost；直接以 `file://` 開啟仍可計算，但無法安裝離線快取。

## 輸入處理

空白視為 0；支援小數。負本金、非法數字及低於 -100% 的報酬率顯示提示。報酬率超出建議的 0–20% 時提醒但仍計算。超出 JavaScript 有限數值範圍時顯示提示。有效數值存入 localStorage；儲存受限時仍能計算。

修改快取檔案清單時，請更新 `sw.js` 的 `CACHE_NAME` 版本。
