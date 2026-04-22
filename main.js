const carrito = [];
let productos = [];

/* FIX GOOGLE DRIVE IMAGES */
function transformarImagen(url){
if(!url) return "https://via.placeholder.com/150";

if(url.includes("drive.google.com")){
const id = url.match(/[-\w]{25,}/);
return id ? `https://drive.google.com/uc?export=view&id=${id[0]}` : url;
}

return url;
}

/* CSV */
function parseCSVLine(line){
const result=[];
let current='',inQuotes=false;

for(let char of line){
if(char === '"'){inQuotes=!inQuotes}
else if(char === ',' && !inQuotes){result.push(current);current=''}
else{current+=char}
}
result.push(current);
return result;
}

/* LOAD */
async function cargarProductos(){

const url='https://docs.google.com/spreadsheets/d/e/2PACX-1vSm_x_4hR7AM7cghSD1NWOTzf1q8-o3QMhGqQOENtSBRtF0mIkiWPohv3hhbDhuzYGa459Tn3HQXKOL/pub?gid=1670706691&output=csv';

const res=await fetch(url);
const text=await res.text();

const lines=text.split('\n');
const headers=parseCSVLine(lines[0]).map(h=>h.toLowerCase());

productos=lines.slice(1).map(l=>{
const cols=parseCSVLine(l);
const obj=Object.fromEntries(headers.map((h,i)=>[h,cols[i]]));

return{
nombre:obj.nombre,
precio:parseFloat((obj.precio||"0").replace(/[^0-9]/g,''))||0,
imagen:transformarImagen(obj.imagen),
};
});

render();
}

/* RENDER */
function render(){
const cont=document.getElementById('productos');
cont.innerHTML='';

productos.forEach((p,i)=>{

cont.innerHTML+=`
<div class="producto">
<img src="${p.imagen}" onerror="this.src='https://via.placeholder.com/150'">

<h4>${p.nombre}</h4>

<div class="precio">$${p.precio}</div>

<button class="boton" onclick="agregar(${i})">Agregar</button>
</div>
`;

});
}

/* CARRITO */
function agregar(i){

const item=carrito.find(x=>x.nombre===productos[i].nombre);

if(item){
item.cantidad++;
}else{
carrito.push({...productos[i],cantidad:1});
}

actualizarCarrito();
}

function actualizarCarrito(){

const cont=document.getElementById('carrito-items');
const totalDiv=document.getElementById('total');
const contador=document.getElementById('contador');

cont.innerHTML='';
let total=0;
let cantidadTotal=0;

carrito.forEach(p=>{
total+=p.precio*p.cantidad;
cantidadTotal+=p.cantidad;

cont.innerHTML+=`
<div>
${p.nombre} x${p.cantidad} - $${p.precio*p.cantidad}
</div>
`;
});

totalDiv.innerText="Total: $"+total;
contador.innerText=cantidadTotal;
}

/* TOGGLE */
function toggleCarrito(){
document.getElementById('carrito').classList.toggle('mostrar');
}

/* WHATSAPP */
function enviarWhatsApp(){

let texto="Hola! Quiero hacer este pedido:%0A";

carrito.forEach(p=>{
texto+=`${p.nombre} x${p.cantidad}%0A`;
});

window.open(`https://wa.me/5491130335334?text=${texto}`);
}

function consultaWhatsApp(){
window.open("https://wa.me/5491130335334?text=Hola! Tengo una consulta:");
}

/* INIT */
document.addEventListener('DOMContentLoaded',cargarProductos);