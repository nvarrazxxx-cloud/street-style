/* Состояние, утилиты, иконки */
var st={v:'home',cat:'all',q:'',sort:'pop',fav:[],pid:null,size:null,wa:''};
try{st.fav=JSON.parse(localStorage.getItem('ss_fav')||'[]');st.wa=localStorage.getItem('ss_wa')||''}catch(e){}
var $=function(s){return document.querySelector(s)};
var fmt=function(n){return n.toLocaleString('ru-RU')+' ₸'};
var I={home:'<path d="M4 11l8-7 8 7v9H4z"/>',cat:'<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>',heart:'<path d="M12 20s-7-4.6-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.400-7 10-7 10z"/>',set:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.600 5.600l2.100 2.100M16.300 16.300l2.100 2.100M5.600 18.400l2.100-2.100M16.300 7.700l2.100-2.100"/>',back:'<path d="M15 5l-7 7 7 7"/>',wa:'<path d="M4 20l1.300-4.200A8 8 0 118 19z"/>'};
var ic=function(k){return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">'+I[k]+'</svg>'};
function slogo(n){return '<img class="ss-logo" src="assets/img/logo/street-style-logo.jpg" width="'+n+'" height="'+n+'" alt="STREET STYLE">'}
