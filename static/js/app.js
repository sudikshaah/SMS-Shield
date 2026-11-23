const API = {
  health: "/api/health",
  predict: "/api/predict",
  bulk: "/api/bulk-predict",
  analytics: "/api/analytics",
  model: "/api/model-info"
};

const $ = (id) => document.getElementById(id);
const viewNames = {overview:"Overview",single:"Single scan",bulk:"Bulk analysis",analytics:"Data observatory",model:"Model archive",about:"About project"};
let selectedFile = null, bulkRows = [], charts = {};

function showToast(message) {
  const toast = $("toast"); toast.textContent = message; toast.classList.add("show");
  clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 2800);
}
function setView(name) {
  if (!viewNames[name]) return;
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === `view-${name}`));
  document.querySelectorAll(".nav-link").forEach(b => b.classList.toggle("active", b.dataset.view === name));
  $("crumbCurrent").textContent = viewNames[name];
  $("sidebar").classList.remove("open");
  if (name === "analytics") loadAnalytics();
  if (name === "model") loadModelInfo();
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-view]").forEach(el => el.addEventListener("click", e => {e.preventDefault(); setView(el.dataset.view);}));
document.querySelectorAll("[data-go]").forEach(el => el.addEventListener("click", () => setView(el.dataset.go)));
$("mobileMenu").addEventListener("click", () => $("sidebar").classList.toggle("open"));

async function apiFetch(url, options={}) {
  const response = await fetch(url, options);
  let data;
  try { data = await response.json(); } catch { throw new Error("The server returned an unreadable response."); }
  if (!response.ok) throw new Error(data.error || data.message || `Request failed (${response.status}).`);
  return data;
}
async function checkHealth() {
  try {
    const data = await apiFetch(API.health);
    $("statusDot").className = "status-dot online";
    $("statusText").textContent = "System online";
    $("statusSub").textContent = data.version ? `API connected · ${data.version}` : "Flask API connected";
  } catch {
    $("statusDot").className = "status-dot offline";
    $("statusText").textContent = "API not connected";
    $("statusSub").textContent = "Start your Flask backend";
  }
}
function countText(input, output, suffix) {
  const update = () => { $(output).textContent = `${input.value.length} / 5000${suffix || ""}`; };
  input.addEventListener("input", update); update();
}
countText($("quickMessage"), "quickCount", "");
countText($("singleMessage"), "singleCount", " characters");
$("quickClear").addEventListener("click", () => {$("quickMessage").value=""; $("quickCount").textContent="0 / 5000";});
$("singleClear").addEventListener("click", () => {$("singleMessage").value=""; $("singleCount").textContent="0 / 5000 characters"; $("singleFeedback").textContent="";});
document.querySelectorAll("[data-sample]").forEach(b => b.addEventListener("click", () => {
  $("singleMessage").value = b.dataset.sample; $("singleCount").textContent = `${b.dataset.sample.length} / 5000 characters`;
}));

function renderResult(data) {
  const prediction = String(data.prediction || "").toLowerCase();
  if (!["spam","ham"].includes(prediction)) throw new Error("The API response must include prediction: 'spam' or 'ham'.");
  const confidence = Number.isFinite(Number(data.confidence)) ? `${(Number(data.confidence) <= 1 ? Number(data.confidence)*100 : Number(data.confidence)).toFixed(1)}%` : "Not provided";
  const cleaned = data.cleaned_text ? escapeHtml(data.cleaned_text) : "Not provided by the API";
  const model = data.model ? escapeHtml(data.model) : "Not provided";
  $("singleResult").innerHTML = `<div class="result-content"><span class="result-label">ANALYSIS RESULT</span><div><span class="prediction-pill ${prediction}">${prediction === "spam" ? "⚠" : "✓"} ${prediction.toUpperCase()}</span></div><h3>${prediction === "spam" ? "Treat this message with caution." : "Classified as a ham message."}</h3><p>${prediction === "spam" ? "The connected model classified this message as spam. Avoid interacting with suspicious links or requests." : "The connected model classified this message as ham. Continue to use your judgement with unexpected requests."}</p><div class="result-divider"></div><div class="result-kv"><span>Confidence</span><b>${confidence}</b></div><div class="result-kv"><span>Model</span><b>${model}</b></div><div class="result-divider"></div><span class="result-label">CLEANED TEXT</span><p>${cleaned}</p></div>`;
}
function escapeHtml(value) {return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function analyseMessage(source) {
  const input = source === "quick" ? $("quickMessage") : $("singleMessage");
  const feedback = $("singleFeedback");
  const message = input.value.trim();
  if (!message) { if(source==="quick") showToast("Enter a message first."); else feedback.textContent="Please enter an SMS message to analyse."; return; }
  setView("single"); $("singleMessage").value = message; $("singleCount").textContent = `${message.length} / 5000 characters`;
  $("singleResult").innerHTML = `<div class="result-empty"><span class="empty-orbit">…</span><h3>Analysing message</h3><p>Waiting for a response from your Flask model.</p></div>`;
  feedback.textContent = "Sending message to the prediction API…";
  $("analyseBtn").disabled = true;
  try {
    const data = await apiFetch(API.predict, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message})});
    if (data.success === false) throw new Error(data.error || "The model could not classify this message.");
    renderResult(data); feedback.textContent = "Analysis complete.";
  } catch (error) {
    $("singleResult").innerHTML = `<div class="result-empty"><span class="empty-orbit">!</span><h3>Could not complete analysis</h3><p>${escapeHtml(error.message)}<br><br>Check that your Flask backend implements <b>POST /api/predict</b>.</p><span class="result-hint">API CONNECTION NEEDED</span></div>`;
    feedback.textContent = error.message;
  } finally {$("analyseBtn").disabled = false;}
}
$("analyseBtn").addEventListener("click", () => analyseMessage("single"));
$("quickScanBtn").addEventListener("click", () => analyseMessage("quick"));

function setSelectedFile(file) {
  if (!file) return;
  if (!file.name.toLowerCase().endsWith(".csv")) {showToast("Please choose a CSV file."); return;}
  if (file.size > 10*1024*1024) {showToast("The file is larger than 10 MB."); return;}
  selectedFile=file; $("fileName").textContent=`${file.name} · ${(file.size/1024).toFixed(1)} KB`;
  $("fileDetails").hidden=false; $("bulkAnalyseBtn").disabled=false; $("bulkFeedback").textContent="";
}
$("csvFile").addEventListener("change", e => setSelectedFile(e.target.files[0]));
$("dropZone").addEventListener("click", e => {if(e.target.tagName!=="LABEL") $("csvFile").click();});
$("dropZone").addEventListener("keydown", e => {if(e.key==="Enter"||e.key===" ") $("csvFile").click();});
["dragenter","dragover"].forEach(evt=>$("dropZone").addEventListener(evt,e=>{e.preventDefault();$("dropZone").classList.add("dragover");}));
["dragleave","drop"].forEach(evt=>$("dropZone").addEventListener(evt,e=>{e.preventDefault();$("dropZone").classList.remove("dragover");}));
$("dropZone").addEventListener("drop",e=>setSelectedFile(e.dataTransfer.files[0]));
$("removeFile").addEventListener("click",()=>{selectedFile=null;$("csvFile").value="";$("fileDetails").hidden=true;$("bulkAnalyseBtn").disabled=true;});
$("bulkAnalyseBtn").addEventListener("click", async()=>{
  if(!selectedFile)return;
  const form=new FormData();form.append("file",selectedFile);form.append("message_column",$("messageColumn").value.trim()||"message");
  $("bulkAnalyseBtn").disabled=true;$("bulkFeedback").textContent="Uploading and classifying your messages…";
  try{
    const data=await apiFetch(API.bulk,{method:"POST",body:form});
    bulkRows=data.results||data.predictions||[];
    if(!Array.isArray(bulkRows))throw new Error("Bulk API must return a results or predictions array.");
    renderBulk(bulkRows);$("bulkResultsPanel").hidden=false;$("bulkFeedback").textContent=`Completed: ${bulkRows.length} result(s) returned.`;
  }catch(error){$("bulkFeedback").textContent=`${error.message} Check POST /api/bulk-predict.`;}
  finally{$("bulkAnalyseBtn").disabled=false;}
});
function renderBulk(rows){
  $("bulkTableBody").innerHTML=rows.map(row=>{
    const pred=String(row.prediction||"").toLowerCase();const conf=Number.isFinite(Number(row.confidence))?`${(Number(row.confidence)<=1?Number(row.confidence)*100:Number(row.confidence)).toFixed(1)}%`:"—";
    return `<tr><td>${escapeHtml(row.message||row.sms||row.text||"")}</td><td><span class="table-result ${["spam","ham"].includes(pred)?pred:""}">${escapeHtml(pred.toUpperCase()||"UNKNOWN")}</span></td><td>${conf}</td></tr>`;
  }).join("");
}
$("exportCsvBtn").addEventListener("click",()=>{
  if(!bulkRows.length)return;
  const rows=[["message","prediction","confidence"],...bulkRows.map(r=>[r.message||r.sms||r.text||"",r.prediction||"",r.confidence??""])];
  const csv=rows.map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="sms-shield-results.csv";a.click();URL.revokeObjectURL(url);
});

function destroyChart(key){if(charts[key]){charts[key].destroy();delete charts[key];}}
function showChartEmpty(canvasId,emptyId,show){$(canvasId).style.display=show?"block":"none";$(emptyId).style.display=show?"none":"grid";}
function makeChart(key,id,type,labels,datasets,options={}){
  destroyChart(key);const canvas=$(id);if(!window.Chart||!canvas)return;
  charts[key]=new Chart(canvas,{type,data:{labels,datasets},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:"#766B80",font:{family:"DM Sans",size:10},usePointStyle:true,boxWidth:8}}},scales:type==="doughnut"?{}:{x:{ticks:{color:"#9A8FA0",font:{size:9}},grid:{display:false}},y:{ticks:{color:"#9A8FA0",font:{size:9}},grid:{color:"#F0EBF4"}}},...options}});
}
async function loadAnalytics(){
  try{
    const data=await apiFetch(API.analytics);$("analyticsSource").textContent=data.source?`Source: ${data.source}`:"Analytics data connected";
    const dist=data.class_distribution||{};const labels=Array.isArray(dist.labels)?dist.labels:Object.keys(dist);const values=Array.isArray(dist.values)?dist.values:Object.values(dist);
    const validDist=labels.length>0&&values.some(v=>Number(v)>0);
    showChartEmpty("classChart","classEmpty",validDist);
    if(validDist)makeChart("class","classChart","doughnut",labels,[{data:values,backgroundColor:["#4D3EA3","#E79AC9","#758AD1","#C5B8E8"],borderWidth:0,hoverOffset:5}],{cutout:"68%",plugins:{legend:{position:"bottom"}}});
    const terms=data.frequent_terms||[];const termLabels=terms.map(x=>x.term||x.label);const termValues=terms.map(x=>Number(x.count||x.value||0));
    const validTerms=terms.length>0;showChartEmpty("termsChart","termsEmpty",validTerms);
    if(validTerms)makeChart("terms","termsChart","bar",termLabels,[{label:"Frequency",data:termValues,backgroundColor:"#9D8BD4",borderRadius:6}],{indexAxis:"y",plugins:{legend:{display:false}}});
    const lengths=data.message_lengths||{};const lenLabels=lengths.labels||[];const lenValues=lengths.values||[];
    const validLengths=lenLabels.length>0&&lenValues.length>0;showChartEmpty("lengthChart","lengthEmpty",validLengths);
    if(validLengths)makeChart("length","lengthChart","bar",lenLabels,[{label:"Messages",data:lenValues,backgroundColor:"#D9A3D3",borderRadius:5}],{plugins:{legend:{display:false}}});
  }catch(error){$("analyticsSource").textContent="Analytics endpoint not connected";["class","terms","length"].forEach(k=>destroyChart(k));showChartEmpty("classChart","classEmpty",false);showChartEmpty("termsChart","termsEmpty",false);showChartEmpty("lengthChart","lengthEmpty",false);}
}
$("refreshAnalytics").addEventListener("click",loadAnalytics);
function formatMetric(v){if(v===undefined||v===null||v==="")return "—";const n=Number(v);return Number.isFinite(n)?`${(n<=1?n*100:n).toFixed(1)}%`:String(v);}
async function loadModelInfo(){
  try{
    const d=await apiFetch(API.model);
    $("modelName").textContent=d.model||"Model name not supplied";$("vectorizerValue").textContent=d.vectorizer||"—";$("datasetValue").textContent=d.dataset||"—";$("splitValue").textContent=d.test_split||"—";
    const m=d.metrics||{};$("accuracyMetric").textContent=formatMetric(m.accuracy);$("precisionMetric").textContent=formatMetric(m.precision);$("recallMetric").textContent=formatMetric(m.recall);$("f1Metric").textContent=formatMetric(m.f1_score);$("metricsNote").textContent="Metrics shown as returned by the connected model-info API.";
  }catch{$("modelName").textContent="Model details not connected";$("metricsNote").textContent="Implement GET /api/model-info to display verified model details and evaluation metrics.";}
}
checkHealth();


// Overview checklist: local-only interaction, no data is uploaded or stored.
const safetyChecks = document.querySelectorAll('#safetyChecks input[type="checkbox"]');
function updateChecklistProgress(){
  const done = [...safetyChecks].filter(item => item.checked).length;
  const output = document.getElementById('checklistProgress');
  if(output) output.textContent = `${done} of ${safetyChecks.length} checks completed`;
}
safetyChecks.forEach(item => item.addEventListener('change', updateChecklistProgress));
const resetChecks = document.getElementById('resetChecks');
if(resetChecks) resetChecks.addEventListener('click', () => { safetyChecks.forEach(item => item.checked = false); updateChecklistProgress(); });
updateChecklistProgress();
