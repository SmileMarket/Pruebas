let stockData = {};
let productosCargados = false;
let stockCargado = false;

function intentarRenderizar() {
  if (stockCargado && productosCargados) {
    renderizarProductos();
  }
}

function cargarStockDesdeGoogleSheet() {
  Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vSm_x_4hR7AM7cghSD1NWOTzf1q8-o3QMhGqQOENtSBRtF0mIkiWPohv3hhbDhuzYGa459Tn3HQXKOL/pub?gid=0&single=true&output=csv", {
    download: true,
    header: true,
    complete: function(results) {
      stockData = {};
      results.data.forEach(item => {
        stockData[item.nombre] = parseInt(item.stock);
      });
      stockCargado = true;
      intentarRenderizar();
    },
    error: function(err) {
      console.error("Error cargando CSV:", err);
    }
  });
}

function renderizarProductos() {
  const contenedor = document.getElementById('productos');
  contenedor.innerHTML = '';
  productos.forEach(producto => {
    const stockRaw = stockData[producto.nombre];
    const stock = isNaN(stockRaw) ? 99 : parseInt(stockRaw);
    const div = document.createElement('div');
    div.className = 'producto';

    const imagenHTML = `
      <div class="producto-imagen-container" onclick="mostrarModalInfo('${producto.nombre}', \`${producto.descripcion}\`)">
        <img src="${producto.imagen}" alt="${producto.nombre}" />
        ${stock <= 0 ? '<div class="sin-stock-label">SIN STOCK</div>' : ''}
        <div class="info-overlay">+ info</div>
      </div>
    `;

    div.innerHTML = `
      ${imagenHTML}
      <h3>${producto.nombre}</h3>
      <p class="precio">$${producto.precio.toLocaleString()}</p>
    `;
    contenedor.appendChild(div);
  });
}

function mostrarModalInfo(nombre, descripcion) {
  document.getElementById('modal-titulo').textContent = nombre;
  document.getElementById('modal-descripcion').textContent = descripcion;
  document.getElementById('info-modal').style.display = 'flex';
}

function cerrarModalInfo() {
  document.getElementById('info-modal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  cargarStockDesdeGoogleSheet();
  productosCargados = true;
  intentarRenderizar();
});
