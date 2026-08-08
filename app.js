let products=[];
async function load(){products=await fetch("/api/products").then(r=>r.json()); render(products)}
function render(list){document.querySelector("#products").innerHTML=list.filter(p=>p.available).map(p=>`
<article class="card"><div class="icon">M</div><p class="eyebrow">${esc(p.category)}</p><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="card-bottom"><span>${esc(p.price)}</span><button onclick="order('${esc(p.name)}')">Request service</button></div></article>`).join("") || "<p>No services found.</p>"}
function order(name){const text=encodeURIComponent(`Hello PROLOGS, I would like to request: ${name}`);location.href=`https://wa.me/2348144753380?text=${text}`}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
document.querySelector("#search").addEventListener("input",e=>{const q=e.target.value.toLowerCase();render(products.filter(p=>(p.name+" "+p.category+" "+p.description).toLowerCase().includes(q)))});
load();