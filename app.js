const $ = (id) => document.getElementById(id);

function updateCurrency() {
  const amount = Number($("foreignAmount").value) || 0;
  const rate = Number($("exchangeRate").value) || 0;
  $("currencyResult").textContent = `HK$${(amount * rate).toLocaleString("en-HK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
["foreignAmount", "exchangeRate", "currencyName"].forEach(id => $(id).addEventListener("input", updateCurrency));
async function refreshRate(){const base=$("currencyName").value.trim().toUpperCase(),status=$("rateStatus"),button=$("refreshRate");if(!/^[A-Z]{3}$/.test(base)){status.textContent="請輸入 3 個英文字母的幣別，例如 USD";return}button.disabled=true;status.textContent="正在取得每日匯率…";try{const response=await fetch(`https://api.frankfurter.dev/v2/rate/${base}/HKD`);if(!response.ok)throw new Error();const data=await response.json();$("exchangeRate").value=Number(data.rate).toFixed(4);updateCurrency();status.textContent=`已更新：${data.date}（${base}/HKD）`}catch{status.textContent="暫時無法取得匯率，請稍後再試或手動輸入。"}finally{button.disabled=false}}
$("refreshRate").addEventListener("click",refreshRate);

updateCurrency();

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % (index + 1);
    [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
  }
  return items;
}

$("shuffleProxies").addEventListener("click", () => {
  const proxies = $("proxyList").value.split(/\r?\n/).map(item => item.trim()).filter(Boolean);
  const status = $("proxyStatus");
  if (!proxies.length) {
    status.textContent = "請先貼上至少一條代理資料。";
    $("proxyList").focus();
    return;
  }
  $("shuffledProxyList").value = shuffle(proxies).join("\n");
  status.textContent = `已隨機打亂 ${proxies.length} 條代理資料。`;
});

$("copyProxies").addEventListener("click", async () => {
  const list = $("shuffledProxyList").value.trim();
  const status = $("proxyStatus");
  if (!list) { status.textContent = "沒有可複製的代理資料。"; return; }
  try {
    await navigator.clipboard.writeText(list);
    status.textContent = "已複製打亂後的代理清單。";
  } catch {
    $("shuffledProxyList").focus();
    $("shuffledProxyList").select();
    status.textContent = "已選取清單，請按 Ctrl/Cmd + C 複製。";
  }
});

function linesFrom(id) {
  return $(id).value.split(/\r?\n/).map(item => item.trim()).filter(Boolean);
}

function cleanEntities(text) {
  return text.replace(/&amp;/g, "&");
}

$("mergeFormat").addEventListener("click", () => {
  const entries = linesFrom("formatLeft"), status = $("formatStatus");
  if (!entries.length) { status.textContent = "請先在資料 A 輸入至少一筆資料。"; return; }
  const pairs = entries.map(item => {
    item = cleanEntities(item);
    const parts = item.split(/\s+/).filter(Boolean);
    return parts.length > 1 ? parts.join(":") : null;
  }).filter(Boolean);
  if (!pairs.length) { status.textContent = "每行請至少包含兩項資料，並以空格或 Tab 分開。"; return; }
  $("formatOutput").value = pairs.join("\n");
  $("formatSplitOutput").value = "";
  status.textContent = pairs.length === entries.length ? `已合併 ${pairs.length} 筆資料。` : `已合併 ${pairs.length} 筆資料；略過格式不完整的行。`;
});

$("splitFormat").addEventListener("click", () => {
  const entries = linesFrom("formatLeft"), status = $("formatStatus");
  if (!entries.length) { status.textContent = "請先在輸入資料貼上至少一行資料。"; return; }
  const validEntries = entries.map(item => {
    item = cleanEntities(item);
    const separator = item.indexOf(":");
    return separator > 0 ? [item.slice(0, separator), item.slice(separator + 1)] : null;
  }).filter(Boolean);
  if (!validEntries.length) { status.textContent = "找不到可分拆的「資料 A:資料 B」格式。"; return; }
  $("formatSplitOutput").value = validEntries.map(([left, right]) => `${left}\t${right}`).join("\n");
  $("formatOutput").value = "";
  status.textContent = validEntries.length === entries.length ? `已分拆 ${validEntries.length} 筆資料。` : `已分拆 ${validEntries.length} 筆資料；略過沒有冒號的行。`;
});

$("copyFormat").addEventListener("click", async () => {
  const result = $("formatOutput").value.trim(), status = $("formatStatus");
  if (!result) { status.textContent = "請先合併資料。"; return; }
  try { await navigator.clipboard.writeText(result); status.textContent = "已複製合併結果。"; }
  catch { $("formatOutput").focus(); $("formatOutput").select(); status.textContent = "已選取結果，請按 Ctrl/Cmd + C 複製。"; }
});

$("downloadFormat").addEventListener("click", () => {
  const result = $("formatOutput").value.trim(), status = $("formatStatus");
  if (!result) { status.textContent = "請先合併資料。"; return; }
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([result], { type: "text/plain;charset=utf-8" }));
  link.download = "merged-data.txt";
  link.click();
  URL.revokeObjectURL(link.href);
  status.textContent = "已建立 TXT 檔案。";
});

$("copySplitFormat").addEventListener("click", async () => {
  const result = $("formatSplitOutput").value.trim(), status = $("formatStatus");
  if (!result) { status.textContent = "請先分拆資料。"; return; }
  try { await navigator.clipboard.writeText(result); status.textContent = "已複製分拆結果。"; }
  catch { $("formatSplitOutput").focus(); $("formatSplitOutput").select(); status.textContent = "已選取分拆結果，請按 Ctrl/Cmd + C 複製。"; }
});

$("downloadSplitFormat").addEventListener("click", () => {
  const result = $("formatSplitOutput").value.trim(), status = $("formatStatus");
  if (!result) { status.textContent = "請先分拆資料。"; return; }
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([result], { type: "text/plain;charset=utf-8" }));
  link.download = "split-data.txt";
  link.click();
  URL.revokeObjectURL(link.href);
  status.textContent = "已建立分拆 TXT 檔案。";
});
