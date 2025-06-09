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
  actualizarCarrito();
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
      <button onclick="eliminarDelCarrito(${index})">&times;</button>
    `;
    carritoItems.appendChild(itemDiv);
    total += item.precio * item.cantidad;
    cantidadTotal += item.cantidad;
  });

  document.getElementById('total').textContent = 'Total: $' + total.toLocaleString();
  document.getElementById('contador-carrito').textContent = cantidadTotal;
}

function mostrarPopup() {
  const popup = document.getElementById('popup');
  popup.style.display = 'block';
  setTimeout(() => {
    popup.style.display = 'none';
  }, 1000);
}
function cambiarCantidad(boton, delta) {
  const input = boton.parentElement.querySelector('.cantidad-input');
  let cantidad = parseInt(input.value) || 1;
  cantidad += delta;
  if (cantidad < 1) cantidad = 1;
  input.value = cantidad;
}

function mostrarModalInfo(nombre, descripcion) {
  document.getElementById('modal-titulo').textContent = nombre;
  document.getElementById('modal-descripcion').textContent = descripcion;
  document.getElementById('info-modal').style.display = 'flex';
}

function cerrarModalInfo() {
  document.getElementById('info-modal').style.display = 'none';
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

      div.innerHTML = `
        ${producto.imagen ? `
          <div class="producto-imagen-container" onclick="mostrarModalInfo('${producto.nombre}', \`${producto.descripcion || 'Sin descripción disponible'}\`)">
            <img src="${producto.imagen}" alt="${producto.nombre}" style="max-width:100%; height:auto; margin-bottom:10px;" />
            ${producto.stock <= 0 ? '<div class="info-overlay" style="background:red;color:white;">SIN STOCK</div>' : '<div class="info-overlay">+ info</div>'}
          </div>
        ` : ''}
        <h3>${producto.nombre}</h3>
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

  // Modal WhatsApp
  const modal = document.createElement('div');
  modal.id = 'resumen-modal';
  modal.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.5);z-index:1000;display:none;justify-content:center;align-items:center;';
  modal.innerHTML = `
    <div style="background:white;padding:20px;border-radius:8px;width:90%;max-width:400px;">
      <h2>Resumen de tu pedido</h2>
      <div id="resumen-contenido" style="margin-bottom:1rem;"></div>
      <button id="enviar-whatsapp" class="boton" style="margin-bottom:10px;">Enviar por WhatsApp</button>
      <button id="cancelar-resumen" class="boton" style="background:#ccc;color:#333;">Cancelar</button>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#cancelar-resumen').onclick = () => {
    modal.style.display = 'none';
  };

  modal.querySelector('#enviar-whatsapp').onclick = () => {
    const mensaje = modal.querySelector('#enviar-whatsapp').dataset.mensaje;
    const numeroWhatsApp = '5491130335334'; // Cambiar si se necesita
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    modal.style.display = 'none';
  };

  const confirmarBtn = document.getElementById('confirmar');
  if (confirmarBtn) {
    confirmarBtn.addEventListener('click', () => {
  if (carrito.length === 0) {
    alert('Tu carrito está vacío.');
    return;
  }

  const resumen = document.getElementById('resumen-contenido');
  resumen.innerHTML = '';
  let mensaje = 'Hola! Quiero realizar una compra:%0A';
  let total = 0;

  carrito.forEach(item => {
    const linea = `• ${item.nombre} x ${item.cantidad} - $${(item.precio * item.cantidad).toLocaleString()}`;
    resumen.innerHTML += `<div>${linea}</div>`;
    mensaje += `${linea}%0A`;
    total += item.precio * item.cantidad;
  });

  mensaje += `%0A*Total: $${total.toLocaleString()}*`;
  document.getElementById('enviar-whatsapp').dataset.mensaje = mensaje;
  document.getElementById('resumen-modal').style.display = 'flex';
});

  }
});
