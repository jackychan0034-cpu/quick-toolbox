const $ = (id) => document.getElementById(id);

function updateCurrency() {
  const amount = Number($("foreignAmount").value) || 0;
  const rate = Number($("exchangeRate").value) || 0;
  $("currencyResult").textContent = `HK$${(amount * rate).toLocaleString("en-HK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
["foreignAmount", "exchangeRate", "currencyName"].forEach(id => $(id).addEventListener("input", updateCurrency));
async function refreshRate(){const base=$("currencyName").value.trim().toUpperCase(),status=$("rateStatus"),button=$("refreshRate");if(!/^[A-Z]{3}$/.test(base)){status.textContent="請輸入 3 個英文字母的幣別，例如 USD";return}button.disabled=true;status.textContent="正在取得每日匯率…";try{const response=await fetch(`https://api.frankfurter.dev/v2/rate/${base}/HKD`);if(!response.ok)throw new Error();const data=await response.json();$("exchangeRate").value=Number(data.rate).toFixed(4);updateCurrency();status.textContent=`已更新：${data.date}（${base}/HKD）`}catch{status.textContent="暫時無法取得匯率，請稍後再試或手動輸入。"}finally{button.disabled=false}}
$("refreshRate").addEventListener("click",refreshRate);

const units = {
  length: { label: "長度", choices: { m: "米 (m)", km: "公里 (km)", cm: "厘米 (cm)", in: "吋 (in)", ft: "呎 (ft)" }, toBase: { m: 1, km: 1000, cm: .01, in: .0254, ft: .3048 } },
  weight: { label: "重量", choices: { kg: "公斤 (kg)", g: "克 (g)", lb: "磅 (lb)", oz: "安士 (oz)" }, toBase: { kg: 1, g: .001, lb: .45359237, oz: .028349523125 } },
  temperature: { label: "溫度", choices: { c: "攝氏 (°C)", f: "華氏 (°F)" } }
};
function setUnitOptions() {
  const type = $("unitType").value;
  const options = Object.entries(units[type].choices).map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
  $("fromUnit").innerHTML = options; $("toUnit").innerHTML = options;
  $("toUnit").selectedIndex = 1;
  updateUnits();
}
function updateUnits() {
  const type = $("unitType").value, value = Number($("unitValue").value) || 0, from = $("fromUnit").value, to = $("toUnit").value;
  let result;
  if (type === "temperature") result = from === to ? value : from === "c" ? (value * 9 / 5) + 32 : (value - 32) * 5 / 9;
  else result = value * units[type].toBase[from] / units[type].toBase[to];
  $("unitResult").textContent = `${result.toLocaleString("en-HK", { maximumFractionDigits: 4 })} ${units[type].choices[to]}`;
}
$("unitType").addEventListener("change", setUnitOptions);
["unitValue", "fromUnit", "toUnit"].forEach(id => $(id).addEventListener("input", updateUnits));
setUnitOptions(); updateCurrency();

function search(query) { if (!query.trim()) { $("productName").focus(); return; } window.open(query, "_blank", "noopener"); }
$("googleSearch").addEventListener("click", () => search(`https://www.google.com/search?q=${encodeURIComponent($("productName").value + " price")}`));
$("hkSearch").addEventListener("click", () => search(`https://www.google.com/search?q=${encodeURIComponent("site:price.com.hk " + $("productName").value)}`));
$("productName").addEventListener("keydown", event => { if (event.key === "Enter") $("googleSearch").click(); });

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
