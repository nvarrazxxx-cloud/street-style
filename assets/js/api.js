/* Слой доступа к Supabase (таблицы из supabase_base.sql). Без настроек в config.js выключен: SB.on === false */
var SB={on:false,c:null};
(function(){
var k=window.SB_CFG||{};
if(!k.url||!k.key||!window.supabase)return;
SB.c=window.supabase.createClient(k.url,k.key,{auth:{persistSession:true,autoRefreshToken:true}});
SB.on=true;
var c=SB.c;
function ck(r){if(r.error)throw r.error;return r}
function fromRow(r){
var sz={};(r.product_sizes||[]).slice().sort(function(a,b){return a.sort_order-b.sort_order}).forEach(function(x){sz[x.size]=x.stock});
var im=(r.product_images||[]).slice().sort(function(a,b){return a.position-b.position}).map(function(x){return x.url});
return{id:r.id,sku:r.sku,name:r.name,cat:r.category,price:r.price,color:r.color,hex:r.color_hex,d:r.description,nw:r.is_new?1:0,pop:r.is_popular?1:0,hid:r.is_hidden,sizes:sz,imgs:im}}
function toBlob(u){var p=u.split(','),m=/data:([^;]+)/.exec(p[0])[1],b=atob(p[1]),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return new Blob([a],{type:m})}
function upload(u,pid,n){var path='p'+pid+'/'+Date.now()+'-'+n+'.jpg';
return c.storage.from('product-images').upload(path,toBlob(u),{contentType:'image/jpeg'}).then(ck).then(function(){return c.storage.from('product-images').getPublicUrl(path).data.publicUrl})}

SB.login=function(email,pw){return c.auth.signInWithPassword({email:email,password:pw}).then(ck)};
SB.logout=function(){return c.auth.signOut()};
SB.isAdmin=function(){return c.auth.getSession().then(function(s){if(!s.data.session)return false;return c.rpc('is_admin').then(function(r){return !!r.data})}).catch(function(){return false})};

SB.load=function(){return Promise.all([
c.from('products').select('*, product_sizes(size,stock,sort_order), product_images(url,position)').order('id'),
c.from('store_settings').select('*').eq('id',1).maybeSingle()]).then(function(r){ck(r[0]);return{products:(r[0].data||[]).map(fromRow),cfg:r[1].data||null}})};

SB.saveProduct=function(p){
var row={sku:p.sku,name:p.name,category:p.cat,price:p.price,color:p.color,color_hex:p.hex,description:p.d,is_new:!!p.nw,is_popular:!!p.pop,is_hidden:!!p.hid},id=p.id,out=JSON.parse(JSON.stringify(p));
var s0=id?c.from('products').update(row).eq('id',id).then(ck):c.from('products').insert(row).select('id').single().then(ck).then(function(r){id=r.data.id});
return s0.then(function(){out.id=id;return c.from('product_sizes').delete().eq('product_id',id).then(ck)})
.then(function(){var rows=Object.keys(p.sizes).map(function(s,n){return{product_id:id,size:s,stock:p.sizes[s],sort_order:n}});return rows.length?c.from('product_sizes').insert(rows).then(ck):0})
.then(function(){return Promise.all((p.imgs||[]).map(function(u,n){return/^data:/.test(u)?upload(u,id,n):u}))})
.then(function(urls){out.imgs=urls;return c.from('product_images').delete().eq('product_id',id).then(ck)})
.then(function(){var rows=out.imgs.map(function(u,n){return{product_id:id,url:u,position:n}});return rows.length?c.from('product_images').insert(rows).then(ck):0})
.then(function(){return out})};
SB.setStock=function(id,size,n){return c.from('product_sizes').update({stock:n}).eq('product_id',id).eq('size',size).then(ck)};
SB.setHidden=function(id,h){return c.from('products').update({is_hidden:!!h}).eq('id',id).then(ck)};
SB.deleteProduct=function(id){return c.from('products').delete().eq('id',id).then(ck)};
SB.saveSettings=function(s){return c.from('store_settings').upsert({id:1,name:s.name,whatsapp:s.whatsapp,delivery:s.delivery,contacts:s.contacts,maintenance:s.maintenance}).then(ck)};

SB.track=function(kind,pid,vid){var tg=null;try{tg=window.Telegram.WebApp.initDataUnsafe.user.id||null}catch(e){}
c.from('analytics_events').insert({kind:kind,product_id:pid||null,visitor_id:String(vid||'x').slice(0,64),tg_user_id:tg}).then(function(){},function(){})};
SB.events=function(){var all=[],from=0;
function page(){return c.from('analytics_events').select('kind,product_id,visitor_id,created_at').order('created_at',{ascending:false}).range(from,from+999).then(ck).then(function(r){var d=r.data||[];all=all.concat(d);from+=1000;if(d.length==1000&&from<10000)return page()})}
return page().then(function(){return all.map(function(x){return{t:Date.parse(x.created_at),k:x.kind,id:x.product_id||0,v:x.visitor_id}})})};
})();
