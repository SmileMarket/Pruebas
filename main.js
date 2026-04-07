// guardá este bloque como main.js

const carrito = [];
let productos = [];
let cupones = [];
let cuponAplicado = null;
let totalGlobal = 0;
let descuentoGlobal = 0;

// 🔥 URL de tu API (YA CONFIGURADA)
const API_URL = "https://script.google.com/macros/s/AKfycbx1Ab0DMSukT94mE8aI8t9Eb5A7jnb5F97beWbFdzxPa9tnYyYH_PuN-49JklJO25Q/exec";

// --- Persistencia ---
function guardarCarritoEnLocalStorage() {
  try {
    localStorage.setItem('smilemarket_carrito_v1', JSON.stringify(carrito));
  } catch (e) {}
}

function cargarCarritoDesdeLocalStorage() {
  try {
    const raw = localStorage.getItem('smilemarket_carrito_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) parsed.forEach(item => carrito.push(item));
    }
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

  barra.style.width = valor + '%';

  barraProgresoInterval = setInterval(() => {
    if (valor < 92) {
      valor += Math.random() * 6;
      barra.style.width = Math.min(92, Math.round(valor)) + '%';
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
    barra.style.width = '0%';
  }, 300);
}

// 🔥 CARGA DESDE JSON
async function cargarDatosDesdeAPI() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    productos = data.productos.map(p => ({
      nombre: p.nombre || 'Sin nombre',
      categoria: p.categoria || 'Sin categoría',
      precio: parseFloat(p.precio) || 0,
      descripcion: p.descripcion || '',
      imagen: p.imagen || '',
      stock: parseInt(p.stock) || 0,
      nuevo: String(p.nuevo).toUpperCase() === 'TRUE',
      masvendido: String(p.masvendido).toUpperCase() === 'TRUE',
      recomendado: String(p.recomendado).toUpperCase() === 'TRUE'
    }));

    cupones = data.cupones.map(c => ({
      codigo: String(c.codigo).toUpperCase(),
      descuento: parseFloat(c.descuento) || 0
    }));

  } catch (e) {
    console.error("ERROR cargando JSON:", e);
    alert("Error cargando productos. Revisá la API.");
  }
}

// --- CARRITO ---
function agregarAlCarrito(boton) {
  const producto = boton.closest('.producto');
  const nombre = producto.dataset.nombre;
  const precio = parseFloat(producto.dataset.precio);
  const cantidad = parseInt(producto.querySelector('.cantidad-input').value);

  const existente = carrito.find(i => i.nombre === nombre);

  if (existente) existente.cantidad += cantidad;
  else carrito.push({ nombre, precio, cantidad });

  guardarCarritoEnLocalStorage();
  actualizarCarrito();
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  guardarCarritoEnLocalStorage();
  actualizarCarrito();
}

function actualizarCarrito() {
  const cont = document.getElementById('carrito-items');
  if (!cont) return;

  cont.innerHTML = '';

  let total = 0;
  let cantidad = 0;

  carrito.forEach((item, i) => {
    const div = document.createElement('div');

    div.innerHTML = `
      <div>${item.nombre} x${item.cantidad}</div>
      <div>$${(item.precio * item.cantidad).toLocaleString()}</div>
      <button onclick="eliminarDelCarrito(${i})">X</button>
    `;

    cont.appendChild(div);

    total += item.precio * item.cantidad;
    cantidad += item.cantidad;
  });

  totalGlobal = total;

  document.getElementById('total').textContent = '$' + total.toLocaleString();
  document.getElementById('contador-carrito').textContent = cantidad;
}

// --- UI ---
function cambiarCantidad(boton, delta) {
  const input = boton.parentElement.querySelector('input');
  let val = parseInt(input.value) || 1;
  val += delta;
  if (val < 1) val = 1;
  input.value = val;
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', async () => {

  iniciarSplash();
  cargarCarritoDesdeLocalStorage();

  await cargarDatosDesdeAPI(); // 🔥 CAMBIO CLAVE

  renderProductos();

  finalizarSplash();
  actualizarCarrito();
});

// --- RENDER ---
function renderProductos() {
  const contenedor = document.getElementById('productos');
  contenedor.innerHTML = '';

  const porCategoria = {};

  productos.forEach(p => {
    if (!porCategoria[p.categoria]) porCategoria[p.categoria] = [];
    porCategoria[p.categoria].push(p);
  });

  Object.keys(porCategoria).forEach(cat => {

    const grupo = document.createElement('div');

    grupo.innerHTML = `<h2>${cat}</h2>`;

    porCategoria[cat].forEach(p => {

      const div = document.createElement('div');
      div.className = 'producto';

      div.dataset.nombre = p.nombre;
      div.dataset.precio = p.precio;

      div.innerHTML = `
        <img src="${p.imagen}" style="width:100%;height:120px;object-fit:contain;">
        <h3>${p.nombre}</h3>
        <p>$${p.precio.toLocaleString()}</p>

        <div>
          <button onclick="cambiarCantidad(this,-1)">-</button>
          <input value="1" readonly>
          <button onclick="cambiarCantidad(this,1)">+</button>
        </div>

        <button onclick="agregarAlCarrito(this)">Agregar</button>
      `;

      grupo.appendChild(div);
    });

    contenedor.appendChild(grupo);
  });
}

// --- GLOBAL ---
window.agregarAlCarrito = agregarAlCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
window.cambiarCantidad = cambiarCantidad;