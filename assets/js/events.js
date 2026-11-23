/* Обработчики событий витрины */
document.addEventListener('click',function(e){var t=e.target.closest('[data-fav],[data-go],[data-cat],[data-size],[data-id],#order,#savewa,#topfav');if(!t||e.target.closest('[data-a]'))return;
if(t.dataset.fav){e.stopPropagation();var id=+t.dataset.fav,i=st.fav.indexOf(id);i>-1?st.fav.splice(i,1):st.fav.push(id);try{localStorage.setItem('ss_fav',JSON.stringify(st.fav))}catch(x){}render();toast(i>-1?'Убрано из избранного':'Добавлено в избранное')}
else if(t.id=='topfav')go('favs');
else if(t.dataset.go)go(t.dataset.go);
else if(t.dataset.cat){st.cat=t.dataset.cat;go('catalog')}
else if(t.dataset.size){st.size=t.dataset.size;render()}
else if(t.dataset.id)go('product',+t.dataset.id);
else if(t.id=='order'){st.size?sheet():toast('Выберите размер перед заказом')}
else if(t.id=='savewa'){st.wa=$('#wa').value.replace(/\D/g,'');try{localStorage.setItem('ss_wa',st.wa)}catch(x){}toast(st.wa?'Номер сохранён':'Номер удалён')}});
document.addEventListener('input',function(e){if(e.target.id=='q'){st.q=e.target.value;var pos=e.target.selectionStart;render();var q=$('#q');q.focus();q.setSelectionRange(pos,pos)}});
document.addEventListener('change',function(e){if(e.target.id=='sort'){st.sort=e.target.value;render();$('#sort').value=st.sort}});
