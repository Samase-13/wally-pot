let productos = [];

fetch("./js/productos.json")
  .then(response => response.json())
  .then(data => {
    productos = data;
    cargarProducto();
  });

function cargarProducto() {
  const urlParams = new URLSearchParams(window.location.search);
  const productoId = urlParams.get('id');

  const producto = productos.find(p => p.id === productoId);

  const productoDetallesDiv = document.getElementById("producto-detalles");
  productoDetallesDiv.innerHTML = `
                <div class="producto">
                <h1 class="logo">
                <a href="./Inicio-venta.html">
                    <img id="myBotton" src="./images/regresar.png" id="mi-imagen" alt="">
                </a> 
            </h1>
  <div class="producto-info">
    <img src="${producto.imagen}" alt="${producto.titulo}" class="producto-imagen">
    <div class="producto-content">
      <h3 class="producto-titulo">${producto.titulo}</h3>
      <div class=Contenedor-Prodcutos>
        <h5 class="producto-descripcion">${producto.Descripcion}</h5>
      </div>        
      <p class="producto-precio">Precio: S/${producto.precio}</p>
      <div class="producto-cantidad">
        <button class="btn-cantidad" id="btn-disminuir">-</button>
        <span class="cantidad">1</span>
        <button class="btn-cantidad" id="btn-aumentar">+</button>
      </div>
      <button class="btn-comprar"></button>
    </div>
  </div>
</div>


              <!-- Agrega aquí más detalles del producto según tus necesidades -->
              
                `;

  const btnDisminuir = document.getElementById("btn-disminuir");
  const btnAumentar = document.getElementById("btn-aumentar");
  const cantidadSpan = document.querySelector(".cantidad");
  const btnComprar = document.querySelector(".btn-comprar");

  let cantidad = 1;

  btnDisminuir.addEventListener("click", () => {
    if (cantidad > 1) {
      cantidad--;
      cantidadSpan.innerText = cantidad;
    }
  });

  btnAumentar.addEventListener("click", () => {
    cantidad++;
    cantidadSpan.innerText = cantidad;
  });

  btnComprar.addEventListener("click", () => {
    Toastify({
      text: "¡Producto comprado!",
      duration: 3000,
      close: true,
      gravity: "top", 
      position: "right", 
      style: {
        background: "linear-gradient(to right, #4b33a8, #785ce9)",
        borderRadius: "2rem",
        textTransform: "uppercase",
        fontSize: ".75rem"
      },
      offset: {
        x: '1.5rem', 
        y: '1.5rem' 
      },
      onClick: function () { } 
    }).showToast();

  
    agregarAlCarrito(producto);

    window.location.href = "carrito.html";
  });


  const botonComprarProducto = document.querySelector("#comprar-producto");

  botonComprarProducto.addEventListener("click", () => {
    const productoSeleccionado = {
      id: producto.id, 
      titulo: producto.titulo, 
      imagen: producto.imagen, 
      precio: producto.precio, 
      cantidad: 1 
    };

    let productosEnCarrito = localStorage.getItem("productos-en-carrito");
    productosEnCarrito = productosEnCarrito ? JSON.parse(productosEnCarrito) : [];

    if (productosEnCarrito && productosEnCarrito.length > 0) {
      const productoExistente = productosEnCarrito.find(
        producto => producto.id === productoSeleccionado.id
      );

      if (productoExistente) {
        console.log("El producto ya está en el carrito");
      } else {
        productosEnCarrito.push(productoSeleccionado);
        localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
      }
    } else {
      productosEnCarrito = [productoSeleccionado];
      localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    }
    window.location.href = "./carrito.html";
  });



}