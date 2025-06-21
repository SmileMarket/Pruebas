const carrito = [];
let productos = [];
let cupones = [];

async function cargarProductosDesdeGoogleSheet() {
  const urlCSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSm_x_4hR7AM7cghSD1NWOTzf1q8-o3QMhGqQOENtSBRtF0mIkiWPohv3hhbDhuzYGa459Tn3HQXKOL/pub?gid=1670706691&single=true&output=csv';
  const response = await fetch(urlCSV);
  const texto = await response.text();
  const lineas = texto.split('\n').filter(l => l.trim() !== '');
  const headers = lineas[0].split(',').map(h => h.trim());

  productos = lineas.slice(1).map(linea => {
    const columnas = linea.split(',').map(c => c.trim());
    const producto = Object.fromEntries(headers.map((h, i) => [h, columnas[i] || '']));
    return {
      nombre: producto.nombre || 'Sin nombre',
      categoria: producto.categoria || 'Sin categoría',
      precio: parseFloat(producto.precio) || 0,
      descripcion: producto.descripcion || '',
      imagen: producto.imagen || '',
      stock: parseInt(producto.stock) || 0,
      nuevo: producto.nuevo === 'TRUE',
      masVendido: producto.masVendido === 'TRUE',
      recomendado: producto.recomendado === 'TRUE'
    };
  });
}

async function cargarCuponesDesdeGoogleSheet() {
  const urlCSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSm_x_4hR7AM7cghSD1NWOTzf1q8-o3QMhGqQOENtSBRtF0mIkiWPohv3hhbDhuzYGa459Tn3HQXKOL/pub?gid=713979488&single=true&output=csv';
  const response = await fetch(urlCSV);
  const texto = await response.text();
  const lineas = texto.split('\n').filter(l => l.trim() !== '');
  const headers = lineas[0].split(',').map(h => h.trim());

  cupones = lineas.slice(1).map(linea => {
    const columnas = linea.split(',').map(c => c.trim());
    const fila = Object.fromEntries(headers.map((h, i) => [h, columnas[i] || '']));
    return {
      codigo: fila.Codigo?.toUpperCase() || '',
      descuento: parseFloat(fila.Descuento) || 0
    };
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
    icono.classList.remove('vibrar');
    void icono.offsetWidth;
    icono.classList.add('vibrar');
    setTimeout(() => icono.classList.remove('vibrar'), 500);
  }
}
document.addEventListener('DOMContentLoaded', async () => {
  await cargarProductosDesdeGoogleSheet();
  await cargarCuponesDesdeGoogleSheet();

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
      div.dataset.descripcion = producto.descripcion;
      div.dataset.categoria = producto.categoria;

      const etiquetas = [];
      if (producto.nuevo) etiquetas.push('🆕 Nuevo');
      if (producto.masVendido) etiquetas.push('🔥 Muy vendido');
      if (producto.recomendado) etiquetas.push('⭐ Recomendado');

      const etiquetasHTML = etiquetas.length > 0
        ? `<div class="etiquetas">${etiquetas.map(t => `<span class="etiqueta">${t}</span>`).join('')}</div>`
        : '';

      const imagenHTML = producto.imagen ? `
        <div class="producto-imagen-container" onclick="mostrarModalInfo('${producto.nombre}', \`${producto.descripcion || 'Sin descripción disponible'}\`)">
          <img src="${producto.imagen}" alt="${producto.nombre}" style="width:100%; height:160px; object-fit:contain;" />
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

  const buscador = document.getElementById('buscador');
  buscador?.addEventListener('input', () => {
    const texto = buscador.value.toLowerCase();
    const productosDOM = document.querySelectorAll('.producto');
    productosDOM.forEach(producto => {
      const nombre = producto.dataset.nombre.toLowerCase();
      const categoria = producto.dataset.categoria.toLowerCase();
      producto.style.display = (nombre.includes(texto) || categoria.includes(texto)) ? 'flex' : 'none';
    });
  });
  const carritoIcono = document.getElementById('carrito-icono');
  const carritoPanel = document.getElementById('carrito');

  if (carritoIcono && carritoPanel) {
    carritoIcono.addEventListener('click', (e) => {
      e.preventDefault();
      carritoPanel.classList.toggle('mostrar');
    });
  }

  const resumen = document.getElementById('resumen-contenido');
  const inputCupon = document.getElementById('cupon');
  const feedback = document.getElementById('cupon-feedback');
  const btnValidarCupon = document.getElementById('validar-cupon');

  let codigoValidado = '';
  let porcentajeDescuento = 0;

  function calcularResumen() {
    resumen.innerHTML = '';
    let total = 0;
    let mensaje = 'Hola! Quiero realizar una compra:\n';

    carrito.forEach(item => {
      const linea = `${item.nombre} x ${item.cantidad} - $${(item.precio * item.cantidad).toLocaleString()}`;
      resumen.innerHTML += `<div style="margin-bottom: 0.4rem;">${linea}</div>`;
      mensaje += `• ${linea}\n`;
      total += item.precio * item.cantidad;
    });

    resumen.innerHTML += `<div style="margin-top: 0.7rem;">Subtotal: $${total.toLocaleString()}</div>`;
    mensaje += `\nSubtotal: $${total.toLocaleString()}`;

    let totalConDescuento = total;

    if (codigoValidado && porcentajeDescuento > 0) {
      const descuentoAplicado = total * (porcentajeDescuento / 100);
      totalConDescuento -= descuentoAplicado;

      resumen.innerHTML += `<div>Descuento: -$${descuentoAplicado.toLocaleString()}</div>`;
      resumen.innerHTML += `<div style="margin-top: 0.5rem; font-weight: bold;">Total: $${totalConDescuento.toLocaleString()}</div>`;

      mensaje += `\nDescuento (${porcentajeDescuento}%): -$${descuentoAplicado.toLocaleString()}`;
    } else {
      resumen.innerHTML += `<div style="margin-top: 0.5rem; font-weight: bold;">Total: $${total.toLocaleString()}</div>`;
    }

    mensaje += `\nTotal: $${totalConDescuento.toLocaleString()}`;
    document.getElementById('enviar-whatsapp').dataset.mensaje = mensaje;
  }

  btnValidarCupon?.addEventListener('click', () => {
    const codigoIngresado = inputCupon?.value.trim().toUpperCase();
    const cuponValido = cupones.find(c => c.codigo === codigoIngresado);

    if (cuponValido) {
      codigoValidado = cuponValido.codigo;
      porcentajeDescuento = cuponValido.descuento;
      feedback.textContent = `Cupón aplicado: -${porcentajeDescuento}% de descuento`;
      feedback.style.color = 'green';
    } else {
      codigoValidado = '';
      porcentajeDescuento = 0;
      feedback.textContent = 'Cupón no válido';
      feedback.style.color = 'red';
    }

    calcularResumen();
  });

  const confirmarBtn = document.getElementById('confirmar');
  confirmarBtn?.addEventListener('click', () => {
    if (carrito.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }
    calcularResumen();
    document.getElementById('resumen-modal').style.display = 'flex';
  });

  document.getElementById('enviar-whatsapp')?.addEventListener('click', () => {
    const mensaje = document.getElementById('enviar-whatsapp').dataset.mensaje;
    const url = `https://wa.me/5491130335334?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    document.getElementById('resumen-modal').style.display = 'none';
  });

  document.getElementById('seguir-comprando')?.addEventListener('click', () => {
    document.getElementById('resumen-modal').style.display = 'none';
  });
});
