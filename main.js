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

document.addEventListener('DOMContentLoaded', () => {
  cargarStockDesdeGoogleSheet();
  productosCargados = true;
  intentarRenderizar();
});
