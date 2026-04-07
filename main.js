// guardá este bloque como main.js

const carrito = [];
let productos = [];
let cupones = [];
let cuponAplicado = null;
let totalGlobal = 0;
let descuentoGlobal = 0;

// ✅ Parser CSV robusto (soporta comas, comillas y saltos)
function parseCSV(texto) {
  const filas = [];
  let fila = [];
  let valor = '';
  let enComillas = false;

  for (let i = 0; i < texto.length; i++) {
    const char = texto[i];
    const next = texto[i + 1];

    if (char === '"' && enComillas && next === '"') {
      valor += '"';
      i++;
    } else if (char === '"') {
      enComillas = !enComillas;
    } else if (char === ',' && !enComillas) {
      fila.push(valor.trim());
      valor = '';
    } else if ((char === '\n' || char === '\r') && !enComillas) {
      if (valor || fila.length) {
        fila.push(valor.trim());
        filas.push(fila);
        fila = [];
        valor = '';
      }
    } else {
      valor += char;
    }
  }

  if (valor || fila.length) {
    fila.push(valor.trim());
    filas.push(fila);
  }

  return filas;
}

// --- Persistencia ---
function guardarCarritoEnLocalStorage() {
  try {
    localStorage.setItem('smilemarket_carrito_v1', JSON.stringify(carrito));
  } catch (e) {}
}

function cargarCarritoDesdeLocalStorage() {
  try {
    const raw = localStorage.getItem('smilemarket_carrito_v1');
    if (raw) JSON.parse(raw).forEach(item => carrito.push(item));
  } catch (e) {}
}

// --- Splash ---
let barraProgresoInterval = null;
function iniciarSplash() {
  const splash = document.getElementById('splash');
  const barra = document.getElementById('barra-progreso');
  if (!splash || !barra) return;

  splash.style.display = 'flex';
  let valor = 5;

  barraProgresoInterval = setInterval(() => {
    if (valor < 92) {
      valor += Math.random() * 5;
      barra.style.width = valor + '%';
    }
  }, 300);
}

function finalizarSplash() {
  const splash = document.getElementById('splash');
  const barra = document.getElementById('barra-progreso');
  if (!splash || !barra) return;

  clearInterval(barraProgresoInterval);
  barra.style.width = '100%';

  setTimeout(() => {
    splash.style.display = 'none';
  }, 400);
}

// ✅ PRODUCTOS CSV
async function cargarProductosDesdeGoogleSheet() {
  const urlCSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSm_x_4hR7AM7cghSD1NWOTzf1q8-o3QMhGqQOENtSBRtF0mIkiWPohv3hhbDhuzYGa459Tn3HQXKOL/pub?gid=1670706691&single=true&output=csv';

  const res = await fetch(urlCSV);
  const texto = await res.text();

  const data = parseCSV(texto);
  const headers = data[0].map(h => h.toLowerCase());

  productos = data.slice(1).map(row => {
    const obj = Object.fromEntries(headers.map((h, i) => [h, row[i]]));

    return {
      nombre: obj.nombre || '',
      categoria: obj.categoria || '',
      precio: parseFloat(obj.precio) || 0,
      descripcion: obj.descripcion || '',
      imagen: obj.imagen || '',
      stock: parseInt(obj.stock) || 0,
      nuevo: obj.nuevo === 'TRUE',
      masvendido: obj.masvendido === 'TRUE',
      recomendado: obj.recomendado === 'TRUE'
    };
  });
}

// ✅ CUPONES CSV
async function cargarCuponesDesdeGoogleSheet() {
  const urlCSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSm_x_4hR7AM7cghSD1NWOTzf1q8-o3QMhGqQOENtSBRtF0mIkiWPohv3hhbDhuzYGa459Tn3HQXKOL/pub?gid=713979488&single=true&output=csv';

  const res = await fetch(urlCSV);
  const texto = await res.text();

  const data = parseCSV(texto);
  const headers = data[0].map(h => h.toLowerCase());

  cupones = data.slice(1).map(row => {
    const obj = Object.fromEntries(headers.map((h, i) => [h, row[i]]));

    return {
      codigo: obj.codigo?.toUpperCase() || '',
      descuento: parseFloat(obj.descuento) || 0
    };
  });
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', async () => {
  iniciarSplash();
  cargarCarritoDesdeLocalStorage();

  try {
    await cargarProductosDesdeGoogleSheet();
    await cargarCuponesDesdeGoogleSheet();
  } catch (e) {
    alert("Error cargando productos");
    console.error(e);
  }

  finalizarSplash();

  // 👉 DEBUG CLAVE
  console.log("PRODUCTOS:", productos);
  console.log("CUPONES:", cupones);

  renderProductos();
});

// --- RENDER ---
function renderProductos() {
  const contenedor = document.getElementById('productos');
  contenedor.innerHTML = '';

  productos.forEach(producto => {
    const div = document.createElement('div');
    div.className = 'producto';

    div.innerHTML = `
      <h3>${producto.nombre}</h3>
      <p>$${producto.precio}</p>
      <button onclick="agregarAlCarritoManual('${producto.nombre}', ${producto.precio})">
        Agregar
      </button>
    `;

    contenedor.appendChild(div);
  });
}

// --- CARRITO SIMPLE ---
function agregarAlCarritoManual(nombre, precio) {
  const existente = carrito.find(p => p.nombre === nombre);

  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ nombre, precio, cantidad: 1 });
  }

  guardarCarritoEnLocalStorage();
  console.log("Carrito:", carrito);
}