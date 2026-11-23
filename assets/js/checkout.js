/* Оформление заказа (форма и переход в WhatsApp) */
function sheet(){var p=P.filter(function(x){return x.id==st.pid})[0],d=document.createElement('div');d.className='sheet';
d.innerHTML='<form novalidate>'+slogo(44)+'<h2 style="margin-top:0">Оформление заказа</h2><p class="sum"><b>'+p.name+'</b><br><span class="mut">Артикул '+p.sku+', размер '+st.size+'</span><br><b>'+fmt(p.price)+'</b></p><label class="fld"><span>Имя</span><input name="n" autocomplete="name"></label><label class="fld"><span>Город</span><input name="c" autocomplete="address-level2"></label><label class="fld"><span>Адрес доставки</span><input name="a" autocomplete="street-address"></label><label class="fld"><span>Почтовый индекс</span><input name="z" inputmode="numeric" autocomplete="postal-code"></label><label class="fld"><span>Телефон</span><input name="t" type="tel" autocomplete="tel"></label><p class="err" id="err" role="alert" hidden></p><button class="btn block" type="submit">'+ic('wa')+'Перейти в WhatsApp</button><button class="btn ghost block" type="button" id="cl" style="margin-top:8px">Отмена</button></form>';
document.body.appendChild(d);d.querySelector('input').focus();
d.querySelector('#cl').onclick=function(){d.remove()};d.onclick=function(e){if(e.target==d)d.remove()};
d.querySelector('form').onsubmit=function(e){e.preventDefault();var f=e.target,v=function(k){return f.elements[k].value.trim()},er=$('#err');
function bad(m){er.textContent=m;er.hidden=false}
if(!v('n')||!v('c')||!v('a')||!v('z')||!v('t'))return bad('Заполните все поля: имя, город, адрес, индекс и телефон.');
if(v('t').replace(/\D/g,'').length<10)return bad('Телефон указан неполностью. Введите номер вместе с кодом.');
var num=st.wa.replace(/\D/g,'');if(!num)return bad('Номер WhatsApp магазина не настроен. Добавьте его в настройках.');
var m='Здравствуйте! Хочу оформить заказ в STREET STYLE.\n\nТовар: '+p.name+'\nАртикул: '+p.sku+'\nРазмер: '+st.size+'\nЦена: '+p.price+' ₸\n\nИмя: '+v('n')+'\nГород: '+v('c')+'\nАдрес доставки: '+v('a')+'\nПочтовый индекс: '+v('z')+'\nТелефон: '+v('t')+'\n\nПожалуйста, подтвердите наличие и условия доставки.';
var url='https://wa.me/'+num+'?text='+encodeURIComponent(m);d.remove();toast('Открываем WhatsApp. Заказ подтвердит магазин.');window.open(url,'_blank','noopener')}}
