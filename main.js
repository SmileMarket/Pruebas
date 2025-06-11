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

function animarCarrito() {
  const icono = document.querySelector('.carrito-float');
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
      let sinStockEtiqueta = '';
      if (producto.stock <= 0) {
        sinStockEtiqueta = `<div class=\"sin-stock-overlay\">⛔ SIN&nbsp;STOCK</div>`;
      }
      if (producto.nuevo) etiquetas.push('🆕 Nuevo');
      if (producto.masVendido) etiquetas.push('🔥 Muy vendido');
      if (producto.recomendado) etiquetas.push('⭐ Recomendado');

      const etiquetasHTML = etiquetas.map(texto => `<span class="etiqueta">${texto}</span>`).join('');

      let imagenHTML = "";
      if (producto.imagen) {
        imagenHTML = `
          <div class="producto-imagen-container" onclick="mostrarModalInfo('${producto.nombre}', \`${producto.descripcion || 'Sin descripción disponible'}\`)">
            ${sinStockEtiqueta}<img src="${producto.imagen}" alt="${producto.nombre}" style="max-width:100%; height:auto; margin-bottom:10px;" />
          </div>
        `;
      }

      div.innerHTML = `
        ${imagenHTML}
        <h3 style='margin: 2px 0; font-size: 1.1rem;'>${producto.nombre}</h3>
        <div class="etiquetas" style="margin: 2px 0; gap: 2px; font-size: 0.8rem;">${etiquetasHTML}</div>
        <p class="categoria-texto" style="margin: 2px 0; font-size: 0.85rem;">${producto.categoria}</p>
        <p class="precio" style="margin: 2px 0; font-size: 1.05rem;">$ ${producto.precio.toLocaleString("es-AR")},00</p>
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
    const numeroWhatsApp = '5491130335334';
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
      let mensaje = 'Hola! Quiero realizar una compra:\n';
      let total = 0;

      carrito.forEach(item => {
        const linea = `• ${item.nombre} x ${item.cantidad} - $${(item.precio * item.cantidad).toLocaleString()}`;
        resumen.innerHTML += `<div>${linea}</div>`;
        mensaje += `${linea}\n`;
        total += item.precio * item.cantidad;
      });

      const totalTexto = `Total: $${total.toLocaleString()}`;
      resumen.innerHTML += `<div style="margin-top:1rem;font-weight:bold;">${totalTexto}</div>`;
      mensaje += `\n${totalTexto}`;

      document.getElementById('enviar-whatsapp').dataset.mensaje = mensaje;
      document.getElementById('resumen-modal').style.display = 'flex';
    });
  }
});
