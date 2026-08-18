const KEY='retailmate_clean_v031';
const BASE={settings:{businessName:'My Shop',lowStock:5},products:[],sales:[],purchases:[],expenses:[],credits:[]};
let db=load();

function load(){try{return {...BASE,...JSON.parse(localStorage.getItem(KEY)||'{}'),settings:{...BASE.settings,...(JSON.parse(localStorage.getItem(KEY)||'{}').settings}}}catch(e){return JSON.parse(JSON.stringify(BASE))}}
function save(){localStorage.setItem(KEY,JSON.stringify(db));refresh()}
function M(n){return 'GH₵'+Number(n||0).toFixed(2)}
function D(){return new Date().toISOString().slice(0,10)}
function id(){return (crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random())}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function totals(){let d=D(),s=db.sales.filter(x=>x.date===d),rev=s.reduce((a,x)=>a+x.total,0),cost=s.reduce((a,x)=>a+x.cost,0),exp=db.expenses.filter(x=>x.date===d).reduce((a,x)=>a+x.amount,0),cred=db.credits.filter(x=>!x.paid).reduce((a,x)=>a+x.amount,0);return{rev,cost,exp,cred,profit:rev-cost-exp,s}}
function refresh(){let t=totals();business.textContent=db.settings.businessName;salesToday.textContent=M(t.rev);expensesToday.textContent=M(t.exp);creditOwed.textContent=M(t.cred);profitToday.textContent=M(t.profit);status.textContent=navigator.onLine?'Online • saved locally':'Offline • saved locally'}
function productOptions(){return db.products.map((p,i)=>`<option value="${i}">${esc(p.name)} (${p.qty} left)</option>`).join('')}

function showView(v){
 const el=document.getElementById('view');
 if(v==='sell'){
  el.innerHTML=`<h2>Sell</h2><div class="form"><label>Product<select id="product">${productOptions()||'<option>No products yet</option>'}</select></label><label>Quantity<input id="qty" type="number" min="1" value="1"></label><label>Payment<select id="payment"><option>Cash</option><option>Mobile Money</option><option>Credit</option></select></label><label>Customer name<input id="customer" placeholder="Required for credit"></label><button class="primary" onclick="recordSale()">Record Sale</button></div>`
 } else if(v==='buy'){
  el.innerHTML=`<h2>I Bought Goods</h2><div class="form"><label>Product name<input id="name"></label><label>Quantity<input id="buyQty" type="number" min="1" value="1"></label><label>Cost per item<input id="cost" type="number" min="0" step=".01"></label><label>Selling price<input id="sellPrice" type="number" min="0" step=".01"></label><button class="primary" onclick="recordPurchase()">Save Purchase</button></div>`
 } else if(v==='stock'){
  el.innerHTML=`<h2>My Stock</h2><div class="list">${db.products.length?db.products.map(p=>`<div class="item"><div><b>${esc(p.name)}</b><small>Cost ${M(p.cost)} • Sell ${M(p.sell)}</small></div><span class="badge">${p.qty} left</span></div>`).join(''):'<div class="empty">No stock yet.</div>'}</div>`
 } else if(v==='expense'){
  el.innerHTML=`<h2>Expense</h2><div class="form"><label>Description<input id="expDesc"></label><label>Amount<input id="expAmount" type="number" step=".01"></label><button class="primary" onclick="recordExpense()">Record Expense</button></div>`
 } else if(v==='credit'){
  const open=db.credits.filter(x=>!x.paid);
  el.innerHTML=`<h2>Customer Owes Me</h2>${open.length?open.map(c=>`<div class="item"><div><b>${esc(c.customer)}</b><small>${esc(c.product)} • ${c.date}</small></div><div><b>${M(c.amount)}</b><br><button onclick="markPaid('${c.id}')">Mark paid</button></div></div>`).join(''):'<div class="empty">No unpaid credit.</div>'}`
 } else if(v==='report'){
  const t=totals(),cash=t.s.filter(x=>x.payment==='Cash').reduce((a,x)=>a+x.total,0),momo=t.s.filter(x=>x.payment==='Mobile Money').reduce((a,x)=>a+x.total,0),credit=t.s.filter(x=>x.payment==='Credit').reduce((a,x)=>a+x.total,0);
  el.innerHTML=`<h2>My Business</h2><div class="report"><div><small>Sales</small><b>${M(t.rev)}</b></div><div><small>Profit</small><b>${M(t.profit)}</b></div><div><small>Cash</small><b>${M(cash)}</b></div><div><small>Mobile Money</small><b>${M(momo)}</b></div><div><small>Credit sales</small><b>${M(credit)}</b></div><div><small>Expenses</small><b>${M(t.exp)}</b></div></div>`
 } else if(v==='database'){
  const bytes=new Blob([JSON.stringify(db)]).size;
  el.innerHTML=`<h2>Database Management</h2><div class="notice">Your active RetailMate database is stored locally on this device. Export backups regularly until cloud sync is added.</div><div class="dbgrid"><div class="dbcard"><small>Products</small><b>${db.products.length}</b></div><div class="dbcard"><small>Sales</small><b>${db.sales.length}</b></div><div class="dbcard"><small>Purchases</small><b>${db.purchases.length}</b></div><div class="dbcard"><small>Database size</small><b>${(bytes/1024).toFixed(1)} KB</b></div></div><div class="dbactions"><button class="primary" onclick="exportDB()">Export Backup</button><button class="secondary" onclick="importFile.click()">Restore Backup</button><button class="danger" onclick="clearDB()">Clear Database</button></div>`
 }
}

function recordPurchase(){let n=name.value.trim(),q=+buyQty.value,c=+cost.value,s=+sellPrice.value;if(!n||q<1)return alert('Complete the product details.');let p=db.products.find(x=>x.name.toLowerCase()===n.toLowerCase());if(p){p.qty+=q;p.cost=c;p.sell=s}else db.products.push({id:id(),name:n,qty:q,cost:c,sell:s});db.purchases.push({id:id(),date:D(),product:n,qty:q,cost:c,total:q*c});save();showView('stock')}
function recordSale(){let p=db.products[+product.value],q=+qty.value;if(!p||q<1)return alert('Add stock first.');if(q>p.qty)return alert('Not enough stock.');if(payment.value==='Credit'&&!customer.value.trim())return alert('Enter customer name.');let total=q*p.sell;db.sales.push({id:id(),date:D(),product:p.name,qty:q,total,cost:q*p.cost,payment:payment.value});p.qty-=q;if(payment.value==='Credit')db.credits.push({id:id(),date:D(),customer:customer.value.trim(),product:p.name,amount:total,paid:false});save();showView('report')}
function recordExpense(){let a=+expAmount.value;if(a<=0)return alert('Enter an amount.');db.expenses.push({id:id(),date:D(),description:expDesc.value.trim()||'Expense',amount:a});save();showView('report')}
function markPaid(i){let c=db.credits.find(x=>x.id===i);if(c){c.paid=true;c.paidDate=D();save();showView('credit')}}
function exportDB(){let blob=new Blob([JSON.stringify({version:'0.3.1',exportedAt:new Date().toISOString(),database:db},null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='RetailMate_Backup_'+D()+'.json';a.click();URL.revokeObjectURL(u)}
importFile.onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let x=JSON.parse(await f.text()),d=x.database||x;if(!d.products||!d.sales||!d.settings)throw 0;if(confirm('Replace current RetailMate database with this backup?')){db=d;save();showView('database')}}catch(err){alert('Invalid RetailMate backup.')}e.target.value=''}
function clearDB(){if(confirm('Permanently erase all RetailMate records stored on this device?')){db=JSON.parse(JSON.stringify(BASE));save();showView('database')}}
window.addEventListener('online',refresh);window.addEventListener('offline',refresh);refresh();showView('stock');if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
