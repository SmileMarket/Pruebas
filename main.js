const carrito = [];
let productos = [];

/* CSV parser igual */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/* CARGA PRODUCTOS */
async function cargarProductos() {

const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSm_x_4hR7AM7cghSD1NWOTzf1q8-o3QMhGqQOENtSBRtF0mIkiWPohv3hhbDhuzYGa459Tn3HQXKOL/pub?gid=1670706691&single=true&output=csv';

const res = await fetch(url);
const text = await res.text();

const lines = text.split('\n').filter(l => l.trim() !== '');
const headers = parseCSVLine(lines[0]);

productos = lines.slice(1).map(l => {
const cols = parseCSVLine(l);

return {
nombre: cols[0],
categoria: cols[1],
precio: parseFloat(cols[2]),
descripcion: cols[3],
imagen: cols[4],
stock: parseInt(cols[5])
};
});

renderProductos();

}

/* RENDER */

function renderProductos(){

const cont = document.getElementById('productos');
cont.innerHTML = '';

productos.forEach((p,i)=>{

const div = document.createElement('div');
div.className = 'producto';

div.innerHTML = `
<img src="${p.imagen}">
<h3>${p.nombre}</h3>

<div class="etiqueta estudiante">🎓 Estudiantes</div>

<div style="font-size:0.8rem;color:#666;">
✔ Usado en prácticas
</div>

<div class="precio">$${p.precio}</div>

<div class="control-cantidad">
<button onclick="cambiarCantidad(${i},-1)">-</button>
<input id="cant-${i}" value="1">
<button onclick="cambiarCantidad(${i},1)">+</button>
</div>

<button class="boton" onclick="agregarCarrito(${i})">
Agregar
</button>
`;

cont.appendChild(div);

});

}

/* CANTIDAD */

function cambiarCantidad(i,val){
const input = document.getElementById('cant-'+i);
let num = parseInt(input.value) || 1;
num += val;
if(num<1) num=1;
input.value = num;
}

/* CARRITO */

function agregarCarrito(i){

const cantidad = parseInt(document.getElementById('cant-'+i).value);

carrito.push({
...productos[i],
cantidad
});

mostrarPopup();
renderCarrito();

}

function mostrarPopup(){
const p = document.getElementById('popup');
p.style.display='block';
setTimeout(()=>p.style.display='none',1000);
}

function renderCarrito(){

const cont = document.getElementById('carrito-items');
cont.innerHTML='';

let total=0;

carrito.forEach(item=>{
total += item.precio*item.cantidad;

cont.innerHTML += `
<div>
${item.nombre} x${item.cantidad}
</div>
`;
});

document.getElementById('total').innerText = "Total: $" + total;

}

/* INIT */

document.addEventListener('DOMContentLoaded',()=>{
cargarProductos();
});