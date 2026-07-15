# 小幫手工具箱

這是可直接部署的靜態網站，不需要安裝程式、不需要資料庫，也不會儲存使用者輸入的內容。

## 自動部署到 Cloudflare（免費）

此網站會放在 GitHub，再由 Cloudflare Pages 自動發布。首次連接後，每次把更新推送到 GitHub 的 `main` 分支，Cloudflare 都會自動重新部署，不用再上載 ZIP。

Cloudflare Pages 設定：

1. 到 **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**。
2. 選擇 GitHub 專案 `quick-toolbox`。
3. Framework preset 選 **None**；Build command 留空；Build output directory 填 `.`。
4. 按 **Save and Deploy**。

Cloudflare Pages 免費方案足以部署這個純靜態網站。官方說明：<https://developers.cloudflare.com/pages/get-started/git-integration/>。

## 日後想更改內容

- 網站名稱：修改 `index.html` 內的「小幫手工具箱」。
- 匯率：在網站按「更新每日匯率」即可取得免費每日參考數據。
- 加入新工具：把想加入的功能告訴 Codex，例如「折扣計算」或「圖片格式轉換」。
