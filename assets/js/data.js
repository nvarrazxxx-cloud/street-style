/* Данные каталога (демо-товары, категории, формы силуэтов) */
var CATS=[['all','Все товары'],['jeans','Джинсы'],['shoes','Обувь'],['tees','Футболки'],['hoodies','Худи'],['pants','Штаны'],['jackets','Куртки'],['acc','Аксессуары']];
var P=[
{id:1,sku:'SS-JN-001',name:'Джинсы Baggy Black',cat:'jeans',price:24900,color:'Чёрный',hex:'#2b2b2b',sizes:{S:2,M:5,L:0,XL:3},nw:1,pop:1,d:'Свободный крой, плотный деним 12 унций, заниженная посадка.'},
{id:2,sku:'SS-HD-014',name:'Худи Oversize Graphite',cat:'hoodies',price:21900,color:'Графит',hex:'#4a4a4a',sizes:{S:0,M:4,L:6,XL:2},nw:0,pop:1,d:'Футер с начёсом, объёмный капюшон, прямой низ.'},
{id:3,sku:'SS-TE-007',name:'Футболка Heavy Tee',cat:'tees',price:9900,color:'Белый',hex:'#e8e8e8',sizes:{S:5,M:8,L:7,XL:0},nw:1,pop:0,d:'Хлопок 240 г/м², удлинённый силуэт, плотный ворот.'},
{id:4,sku:'SS-SH-021',name:'Кроссовки Rail Low',cat:'shoes',price:38900,color:'Серый',hex:'#8a8a8a',sizes:{40:1,41:3,42:4,43:0,44:2},nw:1,pop:1,d:'Рельефная подошва, дышащая сетка, усиленный носок.'},
{id:5,sku:'SS-PN-009',name:'Штаны Cargo Wide',cat:'pants',price:19900,color:'Хаки',hex:'#6b6b4a',sizes:{S:3,M:0,L:4,XL:4},nw:0,pop:0,d:'Широкие карго с боковыми карманами и утяжкой по низу.'},
{id:6,sku:'SS-JK-003',name:'Куртка Coach Jacket',cat:'jackets',price:32900,color:'Чёрный',hex:'#1c1c1c',sizes:{S:2,M:2,L:3,XL:1},nw:1,pop:1,d:'Лёгкая куртка на кнопках, ветрозащитная ткань.'},
{id:7,sku:'SS-AC-002',name:'Кепка Five Panel',cat:'acc',price:6900,color:'Оранжевый',hex:'#FF6B1A',sizes:{ONE:12},nw:0,pop:0,d:'Пятипанельная кепка, регулируемый ремешок.'},
{id:8,sku:'SS-HD-016',name:'Худи Zip Black',cat:'hoodies',price:23900,color:'Чёрный',hex:'#202020',sizes:{S:1,M:3,L:0,XL:0},nw:0,pop:0,d:'Молния на всю длину, плотный футер, манжеты с резинкой.'}];
var SH={tees:'M30 18L42 14Q50 24 58 14L70 18L90 36L80 48L70 42V86H30V42L20 48L10 36Z',hoodies:'M28 22L40 14Q50 30 60 14L72 22L92 62L82 68L72 48V88H28V48L18 68L8 62Z',jackets:'M28 20L42 14L50 20L58 14L72 20L92 60L82 66L72 46V88H28V46L18 66L8 60Z',jeans:'M30 12H70L76 90H55L50 42L45 90H24Z',pants:'M28 12H72L80 90H56L50 40L44 90H20Z',shoes:'M8 66V50Q28 48 38 34L52 42Q62 54 92 56Q96 60 92 70H10Z',acc:'M20 62Q22 30 50 28Q78 30 80 62ZM70 60H96V67H70Z'};
var DEF_CODE='';
