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
    const stock = Number(fila.stock?.replace(",", "."));
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
  if (popup) {
    popup.style.display = 'block';
    setTimeout(() => popup.style.display = 'none', 1000);
  }
}

function cambiarCantidad(boton, delta) {
  const input = boton.parentElement.querySelector('.cantidad-input');
  let cantidad = parseInt(input.value) || 1;
  cantidad = Math.max(1, cantidad + delta);
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
  const icono = document.getElementById('carrito-icono');
  if (icono) {
    icono.classList.add('vibrar');
    setTimeout(() => icono.classList.remove('vibrar'), 500);
  }
}

function crearBotonIrArriba() {
  const btn = document.createElement('button');
  btn.id = 'ir-arriba';
  btn.textContent = '↑';
  btn.style.position = 'fixed';
  btn.style.bottom = '20px';
  btn.style.right = '20px';
  btn.style.padding = '12px 16px';
  btn.style.border = 'none';
  btn.style.borderRadius = '50%';
  btn.style.backgroundColor = '#f5a2f5';
  btn.style.color = 'white';
  btn.style.fontSize = '1.5rem';
  btn.style.cursor = 'pointer';
  btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
  btn.style.zIndex = '999';
  btn.style.display = 'none';
  btn.title = 'Ir arriba';
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    btn.style.display = window.scrollY > 300 ? 'block' : 'none';
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await cargarStockDesdeGoogleSheet();

  const contenedor = document.getElementById('productos');
  const productosPorCategoria = {};

  productos.forEach(producto => {
    const categoria = producto.categoria || 'Sin categoría';
    productosPorCategoria[categoria] ??= [];
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

      const etiquetasHTML = etiquetas.length
        ? `<div class="etiquetas">${etiquetas.map(t => `<span class="etiqueta">${t}</span>`).join('')}</div>` : '';

      const imagenHTML = producto.imagen ? `
        <div class="producto-imagen-container" onclick="mostrarModalInfo('${producto.nombre}', \`${producto.descripcion || 'Sin descripción disponible'}\`)">
          <img src="${producto.imagen}" alt="${producto.nombre}" />
          ${producto.stock <= 0 
            ? '<div class="sin-stock-overlay">SIN STOCK</div>' 
            : '<div class="info-overlay">+ info</div>'}
        </div>` : '';

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

  const carritoToggle = document.getElementById('carrito-icono');
  carritoToggle.addEventListener('click', (e) => {
    e.preventDefault();
    const carrito = document.getElementById('carrito');
    carrito.style.display = carrito.style.display === 'none' ? 'block' : 'none';
  });

  const confirmarBtn = document.getElementById('confirmar');
  confirmarBtn.addEventListener('click', () => {
    if (carrito.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }

    const resumen = carrito.map(item => `• ${item.nombre} x ${item.cantidad} - $${(item.precio * item.cantidad).toLocaleString()}`).join('\n');
    const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
    const mensaje = `Hola! Quiero realizar una compra:\n${resumen}\n\nTotal: $${total.toLocaleString()}`;
    const url = `https://wa.me/5491130335334?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');

    document.getElementById('carrito').style.display = 'none';
  });

  document.addEventListener('click', (e) => {
    const carrito = document.getElementById('carrito');
    const icono = document.getElementById('carrito-icono');
    if (!carrito.contains(e.target) && e.target !== icono && window.innerWidth < 768) {
      carrito.style.display = 'none';
    }
  });

  // Buscador
  const inputBuscador = document.getElementById('buscador');
  inputBuscador.addEventListener('input', () => {
    const termino = inputBuscador.value.trim().toLowerCase();
    const productosDOM = document.querySelectorAll('.producto');

    productosDOM.forEach(producto => {
      const nombre = producto.dataset.nombre.toLowerCase();
      const descripcion = (producto.dataset.descripcion || '').toLowerCase();
      const categoria = (producto.dataset.categoria || '').toLowerCase();

      const coincide = nombre.includes(termino) || descripcion.includes(termino) || categoria.includes(termino);
      producto.style.display = coincide ? '' : 'none';

      if (coincide) {
        const nombreElem = producto.querySelector('h3');
        const categoriaElem = producto.querySelector('.categoria-texto');
        const regex = new RegExp(`(${termino})`, 'gi');
        nombreElem.innerHTML = producto.dataset.nombre.replace(regex, '<mark>$1</mark>');
        categoriaElem.innerHTML = producto.dataset.categoria.replace(regex, '<mark>$1</mark>');
      }
    });
  });

  crearBotonIrArriba();
});
