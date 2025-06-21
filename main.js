const carrito = [];
let productos = [];
let cupones = [];
window.descuentoAplicado = 0;

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
  const headers = lineas[0].split(',').map(h => h.trim().toLowerCase());

  cupones = lineas.slice(1).map(linea => {
    const columnas = linea.split(',').map(c => c.trim());
    const fila = Object.fromEntries(headers.map((h, i) => [h, columnas[i] || '']));
    return {
      codigo: (fila.codigo || '').toUpperCase(),
      descuento: parseFloat(fila.descuento) || 0
    };
  });
}

function validarCupon() {
  const inputCupon = document.getElementById('cupon');
  const feedback = document.getElementById('cupon-feedback');
  const resumen = document.getElementById('resumen-contenido');
  const codigoIngresado = inputCupon?.value.trim().toUpperCase();

  let total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  window.descuentoAplicado = 0;
  resumen.innerHTML = '';

  carrito.forEach(item => {
    const linea = `${item.nombre} x ${item.cantidad} - $${(item.precio * item.cantidad).toLocaleString()}`;
    resumen.innerHTML += `<div style="margin-bottom: 0.4rem;">${linea}</div>`;
  });

  if (codigoIngresado) {
    const cuponValido = cupones.find(c => c.codigo === codigoIngresado);
    if (cuponValido) {
      const montoDescuento = total * (cuponValido.descuento / 100);
      window.descuentoAplicado = montoDescuento;
      const totalConDescuento = total - montoDescuento;

      feedback.textContent = `Cupón aplicado: -${cuponValido.descuento}% ($${montoDescuento.toLocaleString()})`;
      feedback.style.color = 'green';

      resumen.innerHTML += `<div style="margin-top: 0.5rem;">Descuento: -$${montoDescuento.toLocaleString()}</div>`;
      resumen.innerHTML += `<div style="margin-top: 1rem; font-weight: bold;">Total con descuento: $${totalConDescuento.toLocaleString()}</div>`;
    } else {
      feedback.textContent = 'Cupón no válido';
      feedback.style.color = 'red';
      resumen.innerHTML += `<div style="margin-top: 1rem; font-weight: bold;">Total: $${total.toLocaleString()}</div>`;
    }
  } else {
    feedback.textContent = '';
    resumen.innerHTML += `<div style="margin-top: 1rem; font-weight: bold;">Total: $${total.toLocaleString()}</div>`;
  }
}
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

  const carritoIcono = document.getElementById('carrito-icono');
  const carritoPanel = document.getElementById('carrito');

  if (carritoIcono && carritoPanel) {
    carritoIcono.addEventListener('click', (e) => {
      e.preventDefault();
      carritoPanel.classList.toggle('mostrar');
    });
  }
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
        const linea = `${item.nombre} x ${item.cantidad} - $${(item.precio * item.cantidad).toLocaleString()}`;
        resumen.innerHTML += `<div style="margin-bottom: 0.4rem;">${linea}</div>`;
        mensaje += `• ${linea}\n`;
        total += item.precio * item.cantidad;
      });

      // Mostrar subtotal
      resumen.innerHTML += `<div style="margin-top: 0.8rem;"><strong>Subtotal: $${total.toLocaleString()}</strong></div>`;

      // Limpia mensajes previos de cupón
      const feedback = document.getElementById('cupon-feedback');
      if (feedback) {
        feedback.textContent = '';
        feedback.style.color = '';
      }

      // Guarda total en botón de WhatsApp para usar luego
      document.getElementById('enviar-whatsapp').dataset.total = total;
      document.getElementById('resumen-modal').style.display = 'flex';
    });
  }

  document.getElementById('enviar-whatsapp')?.addEventListener('click', () => {
    const resumen = document.getElementById('resumen-contenido');
    const totalFinal = document.getElementById('enviar-whatsapp').dataset.totalFinal;
    const mensaje = resumen.innerText + `\nTotal: $${(totalFinal || 0).toLocaleString()}`;
    const url = `https://wa.me/5491130335334?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    document.getElementById('resumen-modal').style.display = 'none';
  });

  document.getElementById('seguir-comprando')?.addEventListener('click', () => {
    document.getElementById('resumen-modal').style.display = 'none';
  });

  // Botón para aplicar cupón
  const aplicarBtn = document.getElementById('aplicar-cupon');
  aplicarBtn?.addEventListener('click', () => {
    const inputCupon = document.getElementById('cupon');
    const feedback = document.getElementById('cupon-feedback');
    const resumen = document.getElementById('resumen-contenido');
    let total = parseFloat(document.getElementById('enviar-whatsapp').dataset.total || 0);

    if (!inputCupon || !feedback || !resumen) return;

    const codigo = inputCupon.value.trim().toUpperCase();
    const cuponValido = cupones.find(c => c.codigo === codigo);

    // Elimina mensaje previo
    feedback.textContent = '';
    feedback.style.color = '';

    if (!codigo) {
      feedback.textContent = 'Ingresá un código de descuento';
      feedback.style.color = 'red';
      return;
    }

    if (!cuponValido) {
      feedback.textContent = 'Cupón no válido';
      feedback.style.color = 'red';
      return;
    }

    const descuento = cuponValido.descuento;
    const descuentoValor = total * (descuento / 100);
    const totalFinal = total - descuentoValor;

    // Actualiza mensaje
    feedback.textContent = `Cupón aplicado: ${descuento}% de descuento (-$${descuentoValor.toLocaleString()})`;
    feedback.style.color = 'green';

    // Actualiza resumen visual
    resumen.innerHTML += `
      <div style="margin-top: 0.5rem;">Descuento: -$${descuentoValor.toLocaleString()}</div>
      <div style="margin-top: 0.5rem; font-weight: bold;">Total con descuento: $${totalFinal.toLocaleString()}</div>
    `;

    // Guarda total final para WhatsApp
    document.getElementById('enviar-whatsapp').dataset.totalFinal = totalFinal;
  });
});
// Funciones auxiliares fuera de DOMContentLoaded

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
