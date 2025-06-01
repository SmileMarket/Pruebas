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
    const stock = stockData[producto.nombre] ?? 99;
    const div = document.createElement('div');
    div.className = 'producto';
    div.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" />
      ${stock === 0 ? '<div class="sin-stock-label">SIN STOCK</div>' : ''}
      <h3>${producto.nombre}</h3>
      <p class="precio">$${producto.precio.toLocaleString()}</p>
      <p>${producto.descripcion}</p>
    `;
    contenedor.appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cargarStockDesdeGoogleSheet();
  productosCargados = true;
  intentarRenderizar();
});
