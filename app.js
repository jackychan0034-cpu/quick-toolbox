const $ = (id) => document.getElementById(id);
const AUTH_USER = "Admin";
const AUTH_PASS = "Admin";
const AUTH_KEY = "quickToolboxMember";

function setAuthState(isLoggedIn) {
  document.body.classList.toggle("is-guest", !isLoggedIn);
  document.body.classList.toggle("is-member", isLoggedIn);
  if (isLoggedIn) $("memberBadge").textContent = "Admin · 最高權限";
  $("loginForm").hidden = true;
}

function initAuth() {
  setAuthState(localStorage.getItem(AUTH_KEY) === AUTH_USER);
  $("loginToggle").addEventListener("click", () => {
    $("loginForm").hidden = !$("loginForm").hidden;
    if (!$("loginForm").hidden) $("loginPassword").focus();
  });
  $("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const user = $("loginUser").value.trim();
    const password = $("loginPassword").value;
    if (user === AUTH_USER && password === AUTH_PASS) {
      localStorage.setItem(AUTH_KEY, AUTH_USER);
      $("loginError").textContent = "";
      setAuthState(true);
      return;
    }
    $("loginError").textContent = "帳戶或密碼不正確。";
  });
  $("logoutButton").addEventListener("click", () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthState(false);
    $("loginPassword").focus();
  });
}

initAuth();

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

function parseIpv4(ip) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) return null;
  return parts;
}

function increaseIpv4(ipParts, offset) {
  let value = ((ipParts[0] << 24) >>> 0) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3] + offset;
  if (value > 4294967295) return null;
  return [
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255,
  ].join(".");
}

function downloadText(filename, content) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

$("makeProxies").addEventListener("click", () => {
  const status = $("proxyMakerStatus");
  const listedHosts = linesFrom("proxyMakerHosts");
  const startIp = $("proxyMakerStartIp").value.trim();
  const count = Math.max(1, Math.min(Number($("proxyMakerCount").value) || 0, 1000));
  const port = $("proxyMakerPort").value.trim();
  const user = $("proxyMakerUser").value.trim();
  const pass = $("proxyMakerPass").value.trim();
  if (!/^\d{1,5}$/.test(port) || Number(port) < 1 || Number(port) > 65535) { status.textContent = "請輸入有效 Port，例如 31280。"; return; }
  if (!user || !pass) { status.textContent = "請輸入 Username 和 Password。"; return; }
  let hosts = listedHosts;
  if (!hosts.length) {
    const ipParts = parseIpv4(startIp);
    if (!ipParts) { status.textContent = "請貼上 IP / 主機清單，或輸入有效起始 IP。"; return; }
    hosts = Array.from({ length: count }, (_, index) => increaseIpv4(ipParts, index)).filter(Boolean);
  }
  if (!hosts.length) { status.textContent = "沒有可生成的代理資料。"; return; }
  $("proxyMakerOutput").value = hosts.map(host => `${host}:${port}:${user}:${pass}`).join("\n");
  status.textContent = `已生成 ${hosts.length} 條代理格式。`;
});

$("copyMadeProxies").addEventListener("click", async () => {
  const result = $("proxyMakerOutput").value.trim(), status = $("proxyMakerStatus");
  if (!result) { status.textContent = "請先生成代理資料。"; return; }
  try { await navigator.clipboard.writeText(result); status.textContent = "已複製代理結果。"; }
  catch { $("proxyMakerOutput").focus(); $("proxyMakerOutput").select(); status.textContent = "已選取代理結果，請按 Ctrl/Cmd + C 複製。"; }
});

$("downloadMadeProxies").addEventListener("click", () => {
  const result = $("proxyMakerOutput").value.trim(), status = $("proxyMakerStatus");
  if (!result) { status.textContent = "請先生成代理資料。"; return; }
  downloadText("proxy-list.txt", result);
  status.textContent = "已建立代理 TXT 檔案。";
});

$("mergeFormat").addEventListener("click", () => {
  const entries = linesFrom("formatLeft"), status = $("formatStatus");
  if (!entries.length) { status.textContent = "請先在資料 A 輸入至少一筆資料。"; return; }
  const pairs = entries.map(item => {
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
    const separator = item.indexOf(":");
    return separator > 0 ? [item.slice(0, separator), item.slice(separator + 1)] : null;
  }).filter(Boolean);
  if (!validEntries.length) { status.textContent = "找不到可分拆的「資料 A:資料 B」格式。"; return; }
  $("formatSplitOutput").value = validEntries.map(([left, right]) => `${left}\t${right}`).join("\n");
  $("formatOutput").value = "";
  status.textContent = validEntries.length === entries.length ? `已分拆 ${validEntries.length} 筆資料。` : `已分拆 ${validEntries.length} 筆資料；略過沒有冒號的行。`;
});

$("cleanupFormat").addEventListener("click", () => {
  const mergedResult = $("formatOutput").value;
  const splitResult = $("formatSplitOutput").value;
  const status = $("formatStatus");
  const notice = $("cleanupNotice");
  const target = mergedResult || splitResult;
  if (!target) { status.textContent = "請先合併或分拆資料，再按清理亂碼。"; notice.textContent = "目前沒有結果可清理。請先產生合併結果或分拆結果。"; return; }
  const count = (target.match(/&amp;/g) || []).length;
  const resultName = mergedResult ? "合併結果" : "分拆結果";
  if (mergedResult) $("formatOutput").value = target.replace(/&amp;/g, "&");
  else $("formatSplitOutput").value = target.replace(/&amp;/g, "&");
  notice.textContent = count ? `已清理 ${count} 個亂碼字串，結果已更新在上方的「${resultName}」欄。` : `「${resultName}」欄沒有需要清理的亂碼字串。`;
  status.textContent = count ? `已清理 ${count} 個亂碼字串。` : "目前結果沒有需要清理的亂碼字串。";
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
  downloadText("merged-data.txt", result);
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
  downloadText("split-data.txt", result);
  status.textContent = "已建立分拆 TXT 檔案。";
});
