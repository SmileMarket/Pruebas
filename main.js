const carrito = [];
let productos = [];
let cupones = [];

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else current += char;
  }

  result.push(current.trim());
  return result;
}

// =======================
// CARGA PRODUCTOS
// =======================
async function cargarProductosDesdeGoogleSheet() {
  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSm_x_4hR7AM7cghSD1NWOTzf1q8-o3QMhGqQOENtSBRtF0mIkiWPohv3hhbDhuzYGa459Tn3HQXKOL/pub?gid=1670706691&single=true&output=csv';

  const res = await fetch(url);
  const text = await res.text();

  const lineas = text.split('\n').filter(l => l.trim());
  const headers = parseCSVLine(lineas[0]).map(h => h.toLowerCase());

  productos = lineas.slice(1).map(l => {
    const cols = parseCSVLine(l);
    const obj = Object.fromEntries(headers.map((h,i)=>[h, cols[i]]));

    return {
      nombre: obj.nombre,
      categoria: obj.categoria,
      precio: parseFloat(obj.precio) || 0,
      imagen: obj.imagen,
      descripcion: obj.descripcion || '',
      stock: parseInt(obj.stock) || 0
    };
  });
}

// =======================
// RENDER PRODUCTOS
// =======================
function renderProductos() {
  const cont = document.getElementById("productos");
  cont.innerHTML = "";

  const categorias = [...new Set(productos.map(p => p.categoria))];

  categorias.forEach(cat => {
    const h2 = document.createElement("h2");
    h2.textContent = cat;
    cont.appendChild(h2);

    const div = document.createElement("div");
    div.className = "productos";

    productos
      .filter(p => p.categoria === cat)
      .forEach(p => {
        const el = document.createElement("div");
        el.className = "producto";

        el.innerHTML = `
          <img src="${p.imagen}" onerror="this.src='https://via.placeholder.com/150'">
          <h3>${p.nombre}</h3>
          <div class="precio">$${p.precio}</div>

          <div class="control-cantidad">
            <button onclick="cambiarCantidad(this,-1)">-</button>
            <input value="1">
            <button onclick="cambiarCantidad(this,1)">+</button>
          </div>

          <button class="boton" onclick='agregarAlCarrito(${JSON.stringify(p)})'>
            Agregar
          </button>
        `;

        div.appendChild(el);
      });

    cont.appendChild(div);
  });
}

// =======================
// CANTIDAD
// =======================
function cambiarCantidad(btn, delta) {
  const input = btn.parentElement.querySelector("input");
  let val = parseInt(input.value) || 1;
  val += delta;
  if (val < 1) val = 1;
  input.value = val;
}

// =======================
// CARRITO
// =======================
function agregarAlCarrito(prod) {
  const existente = carrito.find(p => p.nombre === prod.nombre);

  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({...prod, cantidad:1});
  }

  actualizarCarrito();
}

function actualizarCarrito() {
  const cont = document.getElementById("carrito-items");
  const totalDiv = document.getElementById("total");

  cont.innerHTML = "";

  let total = 0;
  let cantidadTotal = 0;

  carrito.forEach((p,i)=>{
    total += p.precio * p.cantidad;
    cantidadTotal += p.cantidad;

    const item = document.createElement("div");
    item.className = "carrito-item";
    item.innerHTML = `
      ${p.nombre} x${p.cantidad} - $${p.precio * p.cantidad}
      <button onclick="eliminarItem(${i})">❌</button>
    `;
    cont.appendChild(item);
  });

  totalDiv.textContent = "Total: $" + total;

  document.getElementById("contador-carrito").textContent = cantidadTotal;
}

function eliminarItem(i) {
  carrito.splice(i,1);
  actualizarCarrito();
}

// =======================
// WHATSAPP PEDIDO
// =======================
document.getElementById("confirmar").addEventListener("click", ()=>{

  if (carrito.length === 0) return;

  let mensaje = "Hola! Quiero hacer un pedido:%0A";

  carrito.forEach(p=>{
    mensaje += `- ${p.nombre} x${p.cantidad}%0A`;
  });

  const total = carrito.reduce((acc,p)=>acc+p.precio*p.cantidad,0);

  mensaje += `%0ATotal: $${total}`;

  window.open(`https://wa.me/5491130335334?text=${mensaje}`, "_blank");
});

// =======================
// BUSCADOR
// =======================
document.getElementById("buscador").addEventListener("input", e=>{
  const val = e.target.value.toLowerCase();

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(val)
  );

  const cont = document.getElementById("productos");
  cont.innerHTML = "";

  filtrados.forEach(p=>{
    const el = document.createElement("div");
    el.className = "producto";
    el.innerHTML = `
      <img src="${p.imagen}">
      <h3>${p.nombre}</h3>
      <div class="precio">$${p.precio}</div>
      <button class="boton" onclick='agregarAlCarrito(${JSON.stringify(p)})'>
        Agregar
      </button>
    `;
    cont.appendChild(el);
  });
});

// =======================
// INIT
// =======================
document.addEventListener("DOMContentLoaded", async () => {
  await cargarProductosDesdeGoogleSheet();
  renderProductos();
});