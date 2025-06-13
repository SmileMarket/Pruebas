const carrito = [];

async function cargarStockDesdeGoogleSheet() {
  const urlCSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSm_x_4hR7AM7cghSD1NWOTzf1q8-o3QMhGqQOENtSBRtF0mIkiWPohv3hhbDhuzYGa459Tn3HQXKOL/pub?gid=0&single=true&output=csv';
  const response = await fetch(urlCSV);
  const texto = await response.text();
  const lineas = texto.trim().split('\n');
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
    setTimeout(() => {
      popup.style.display = 'none';
    }, 1000);
  }
}

function cambiarCantidad(boton, delta) {
  const input = boton.parentElement.querySelector('.cantidad-input');
  let cantidad = parseInt(input.value) || 1;
  cantidad = Math.max(1, cantidad + delta);
  input.value = cantidad;
}

function animarCarrito() {
  const icono = document.getElementById('carrito-icono');
  if (icono) {
    icono.classList.add('vibrar');
    setTimeout(() => icono.classList.remove('vibrar'), 500);
  }
}

function scrollSuaveArriba() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', async () => {
  await cargarStockDesdeGoogleSheet();

  const contenedor = document.getElementById('productos');
  const buscador = document.getElementById('buscador');

  productos.forEach(producto => {
    const div = document.createElement('div');
    div.className = 'producto';
    div.dataset.nombre = producto.nombre;
    div.dataset.precio = producto.precio;

    const img = document.createElement('img');
    img.src = producto.imagen || '';
    img.alt = producto.nombre;
    div.appendChild(img);

    const h3 = document.createElement('h3');
    h3.textContent = producto.nombre;
    div.appendChild(h3);

    const precio = document.createElement('p');
    precio.className = 'precio';
    precio.textContent = `$${producto.precio.toLocaleString("es-AR")},00`;
    div.appendChild(precio);

    const cantidad = document.createElement('div');
    cantidad.className = 'control-cantidad';
    cantidad.innerHTML = `
      <button onclick="cambiarCantidad(this, -1)" ${producto.stock <= 0 ? 'disabled' : ''}>−</button>
      <input class="cantidad-input" type="number" value="1" min="1" readonly>
      <button onclick="cambiarCantidad(this, 1)" ${producto.stock <= 0 ? 'disabled' : ''}>+</button>
    `;
    div.appendChild(cantidad);

    const boton = document.createElement('button');
    boton.className = 'boton';
    boton.textContent = producto.stock <= 0 ? 'Sin stock' : 'Agregar al carrito';
    if (producto.stock <= 0) {
      boton.disabled = true;
      boton.style.background = '#ccc';
    }
    boton.onclick = () => agregarAlCarrito(boton);
    div.appendChild(boton);

    contenedor.appendChild(div);
  });

  document.getElementById('carrito-icono').addEventListener('click', e => {
    e.preventDefault();
    const carrito = document.getElementById('carrito');
    carrito.style.display = carrito.style.display === 'block' ? 'none' : 'block';
  });

  document.getElementById('confirmar').addEventListener('click', () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío.');
      return;
    }

    let mensaje = 'Hola! Quiero realizar una compra:\n';
    let total = 0;

    carrito.forEach(item => {
      const subtotal = item.precio * item.cantidad;
      mensaje += `• ${item.nombre} x ${item.cantidad} - $${subtotal.toLocaleString()}\n`;
      total += subtotal;
    });

    mensaje += `\nTotal: $${total.toLocaleString()}`;
    const url = `https://wa.me/5491130335334?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  });

  buscador.addEventListener('input', () => {
    const termino = buscador.value.toLowerCase();
    const productosDOM = document.querySelectorAll('.producto');
    productosDOM.forEach(p => {
      const nombre = p.dataset.nombre.toLowerCase();
      p.style.display = nombre.includes(termino) ? '' : 'none';
    });
  });

  // Subir
  const botonSubir = document.getElementById('boton-subir');
  window.addEventListener('scroll', () => {
    botonSubir.style.display = window.scrollY > 400 ? 'block' : 'none';

    const header = document.querySelector('header');
    if (window.scrollY > 80) {
      header.classList.add('shrink');
    } else {
      header.classList.remove('shrink');
    }
  });

  botonSubir.addEventListener('click', scrollSuaveArriba);
});

