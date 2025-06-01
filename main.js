let stockData = {};
let productosCargados = false;
let stockCargado = false;

function intentarRenderizar() {
  if (stockCargado && productosCargados) {
    renderizarProductos();
  }
}

function cargarStockDesdeGoogleSheet() {
  Tabletop.init({
    key: '1xWB7Wy37IGoWWnXuA7QVCPCbgHSxgNQKk_FQerbamFQ',
    simpleSheet: true,
    callback: function(data) {
      stockData = {};
      data.forEach(item => {
        stockData[item.nombre] = parseInt(item.stock);
      });
      stockCargado = true;
      intentarRenderizar();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cargarStockDesdeGoogleSheet();
  productosCargados = true;
  intentarRenderizar();
});
