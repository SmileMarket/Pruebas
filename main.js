const carrito = [];

async function cargarStockDesdeGoogleSheet() {
  const urlCSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSm_x_4hR7AM7cghSD1NWOTzf1q8-o3QMhGqQOENtSBRtF0mIkiWPohv3hhbDhuzYGa459Tn3HQXKOL/pub?gid=0&single=true&output=csv';

  const response = await fetch(urlCSV);
  const texto = await response.text();
  const lineas = texto.split('\n');
  const headers = lineas[0].split(',').map(h => h.trim());

  const stockData = {};
  for (let i = 1; i < lineas.length; i++) {
    const columnas = lineas[i].split(',').map(c => c.trim());
    const fila = Object.fromEntries(headers.map((h, j) => [h, columnas[j]]));
    const nombre = fila.nombre?.trim();
    const stock = Number(fila.stock?.trim().replace(",", "."));
    stockData[nombre] = isNaN(stock) ? 0 : stock;
  }

  productos.forEach(p => {
    p.stock = stockData[p.nombre] ?? 0;
  });
}

function agregarAlCarrito(boton) {
  const producto = boton.closest('.producto');
  const nombre = producto.dataset.nombre;
  const precio = parseFloat(producto.dataset.precio);
  const cantidad = parseInt(producto.querySelector('.cantidad-input').value);

  const existente = carrito.find(item => item.nombre === nombre);
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({ nombre, precio, cantidad });
  }

  mostrarPopup();
  animarCarrito();
  actualizarCarrito();
  mostrarCarritoSiEsMovil();
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  actualizarCarrito();
}

function actualizarCarrito() {
  const carritoItems = document.getElementById('carrito-items');
  carritoItems.innerHTML = '';
  let total = 0;
  let cantidadTotal = 0;

  carrito.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'carrito-item';
    itemDiv.innerHTML = `
      <div>${item.nombre} x ${item.cantidad}</div>
      <div>$${(item.precio * item.cantidad).toLocaleString()}</div>
      <button onclick="eliminarDelCarrito(${index})" class="eliminar-btn">&times;</button>
    `;
    carritoItems.appendChild(itemDiv);
    total += item.precio * item.cantidad;
    cantidadTotal += item.cantidad;
  });

  document.getElementById('total').textContent = 'Total: $' + total.toLocaleString();
  document.getElementById('contador-carrito').textContent = cantidadTotal;

  const carrito = document.getElementById('carrito');
  if (cantidadTotal > 0 && window.innerWidth < 768) {
    carrito.style.display = 'block';
  }
}

function mostrarPopup() {
  const popup = document.getElementById('popup');
  if (popup) {
    popup.style.display = 'block';
    setTimeout(() => {
      popup.style.display = 'none';
    }, 1000);
  }
}

function cambiarCantidad(boton, delta) {
  const input = boton.parentElement.querySelector('.cantidad-input');
  let cantidad = parseInt(input.value) || 1;
  cantidad += delta;
  if (cantidad < 1) cantidad = 1;
  input.value = cantidad;
}

function mostrarCarritoSiEsMovil() {
  const carrito = document.getElementById('carrito');
  if (window.innerWidth < 768) {
    carrito.style.display = 'block';
  }
}

function cerrarCarrito() {
  const carrito = document.getElementById('carrito');
  carrito.style.display = 'none';
}

function animarCarrito() {
  const icono = document.getElementById('carrito-icono');
  if (icono) {
    icono.classList.add('vibrar');
    setTimeout(() => icono.classList.remove('vibrar'), 500);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await cargarStockDesdeGoogleSheet();

  const contenedor = document.getElementById('productos');
  const productosPorCategoria = {};

  productos.forEach(producto => {
    const categoria = producto.categoria || 'Sin categoría';
    if (!productosPorCategoria[categoria]) {
      productosPorCategoria[categoria] = [];
    }
    productosPorCategoria[categoria].push(producto);
  });

  for (const categoria in productosPorCategoria) {
    const grupo = document.createElement('div');
    grupo.className = 'grupo-categoria';

    const titulo = document.createElement('h2');
    titulo.textContent = categoria;
    grupo.appendChild(titulo);

    const contenedorCategoria = document.createElement('div');
    contenedorCategoria.className = 'productos';

    productosPorCategoria[categoria].forEach(producto => {
      const div = document.createElement('div');
      div.className = 'producto';
      div.dataset.nombre = producto.nombre;
      div.dataset.precio = producto.precio;
      div.dataset.descripcion = producto.descripcion || '';
      div.dataset.categoria = producto.categoria || '';

      const etiquetas = [];
      if (producto.nuevo) etiquetas.push('🆕 Nuevo');
      if (producto.masVendido) etiquetas.push('🔥 Muy vendido');
      if (producto.recomendado) etiquetas.push('⭐ Recomendado');

      const etiquetasHTML = etiquetas.length > 0
        ? `<div class="etiquetas">${etiquetas.map(t => `<span class="etiqueta">${t}</span>`).join('')}</div>`
        : '';

      let imagenHTML = "";
      if (producto.imagen) {
        imagenHTML = `
          <div class="producto-imagen-container">
            <img src="${producto.imagen}" alt="${producto.nombre}" style="max-width:100%; height:auto; margin-bottom:10px;" />
            ${producto.stock <= 0
              ? '<div class="info-overlay" style="background:red;color:white;">SIN STOCK</div>'
              : '<div class="info-overlay">+ info</div>'}
          </div>
        `;
      }

      div.innerHTML = `
        ${imagenHTML}
        <h3>${producto.nombre}</h3>
        ${etiquetasHTML}
        <p class="categoria-texto">${producto.categoria}</p>
        <p class="precio">$ ${producto.precio.toLocaleString("es-AR")},00</p>
        <div class="control-cantidad">
          <button class="menos" onclick="cambiarCantidad(this, -1)" ${producto.stock <= 0 ? 'disabled' : ''}>−</button>
          <input class="cantidad-input" type="number" value="1" min="1" readonly />
          <button class="mas" onclick="cambiarCantidad(this, 1)" ${producto.stock <= 0 ? 'disabled' : ''}>+</button>
        </div>
        <button class="boton" onclick="agregarAlCarrito(this)" ${producto.stock <= 0 ? 'disabled style="background:#ccc;cursor:not-allowed;"' : ''}>
          ${producto.stock <= 0 ? 'Sin stock' : 'Agregar al carrito'}
        </button>
      `;

      contenedorCategoria.appendChild(div);
    });

    grupo.appendChild(contenedorCategoria);
    contenedor.appendChild(grupo);
  }

  // Botón de scroll suave hacia arriba
  const btnIrArriba = document.createElement('button');
  btnIrArriba.textContent = '↑';
  btnIrArriba.title = 'Ir arriba';
  btnIrArriba.style = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 999;
    padding: 10px 12px;
    font-size: 1.2rem;
    background-color: #007b7f;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  `;
  btnIrArriba.onclick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  document.body.appendChild(btnIrArriba);

  // Evento para abrir/cerrar carrito
  document.getElementById('carrito-icono').addEventListener('click', (e) => {
    e.preventDefault();
    const carrito = document.getElementById('carrito');
    carrito.style.display = carrito.style.display === 'block' ? 'none' : 'block';
  });

  // Botón cerrar carrito (solo en móvil)
  const cerrarBtn = document.createElement('button');
  cerrarBtn.innerText = '❌';
  cerrarBtn.title = 'Cerrar';
  cerrarBtn.style = `
    position: absolute;
    top: 8px;
    right: 10px;
    font-size: 1.2rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #d9534f;
    z-index: 1001;
  `;
  cerrarBtn.addEventListener('click', cerrarCarrito);
  document.getElementById('carrito').appendChild(cerrarBtn);

  // Botón "Seguir comprando"
  const seguirBtn = document.createElement('button');
  seguirBtn.innerText = 'Seguir comprando';
  seguirBtn.className = 'boton';
  seguirBtn.style = 'margin-top: 10px; background: #ccc; color: #333;';
  seguirBtn.addEventListener('click', cerrarCarrito);
  document.getElementById('carrito').appendChild(seguirBtn);
});
