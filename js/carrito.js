let productosEnCarrito = localStorage.getItem("productos-en-carrito");
productosEnCarrito = JSON.parse(productosEnCarrito);

const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal = document.querySelector("#total");
const botonComprar = document.querySelector("#carrito-acciones-comprar");



function cargarProductosCarrito() {
  if (productosEnCarrito && productosEnCarrito.length > 0) {
    contenedorCarritoVacio.classList.add("disabled");
    contenedorCarritoProductos.classList.remove("disabled");
    contenedorCarritoAcciones.classList.remove("disabled");
    contenedorCarritoComprado.classList.add("disabled");

    contenedorCarritoProductos.innerHTML = "";

    productosEnCarrito.forEach(producto => {
      const div = document.createElement("div");
      div.classList.add("carrito-producto");
    
      const imagen = document.createElement("img");
      imagen.classList.add("carrito-producto-imagen");
      imagen.src = producto.imagen;
      imagen.alt = producto.titulo;
      div.appendChild(imagen);
    
      const tituloDiv = document.createElement("div");
      tituloDiv.classList.add("carrito-producto-titulo");
    
      const tituloSmall = document.createElement("small");
      tituloSmall.textContent = "Título";
      tituloDiv.appendChild(tituloSmall);
    
      const tituloH3 = document.createElement("h3");
      tituloH3.textContent = producto.titulo;
      tituloDiv.appendChild(tituloH3);
    
      div.appendChild(tituloDiv);
    
      const cantidadDiv = document.createElement("div");
      cantidadDiv.classList.add("carrito-producto-cantidad");
    
      const cantidadSmall = document.createElement("small");
      cantidadSmall.textContent = "Cantidad";
      cantidadDiv.appendChild(cantidadSmall);
    
      const cantidadControlesDiv = document.createElement("div");
      cantidadControlesDiv.classList.add("carrito-producto-cantidad-controles");
    
      const decrementarButton = document.createElement("button");
      decrementarButton.classList.add("carrito-producto-cantidad-decrementar");
      decrementarButton.innerHTML = '<i class="bi bi-dash"></i>';
      cantidadControlesDiv.appendChild(decrementarButton);
    
      const cantidadP = document.createElement("p");
      cantidadP.textContent = producto.cantidad;
      cantidadControlesDiv.appendChild(cantidadP);
    
      const incrementarButton = document.createElement("button");
      incrementarButton.classList.add("carrito-producto-cantidad-incrementar");
      incrementarButton.innerHTML = '<i class="bi bi-plus"></i>';
      cantidadControlesDiv.appendChild(incrementarButton);
    
      cantidadDiv.appendChild(cantidadControlesDiv);
      div.appendChild(cantidadDiv);
    
      const precioDiv = document.createElement("div");
      precioDiv.classList.add("carrito-producto-precio");
    
      const precioSmall = document.createElement("small");
      precioSmall.textContent = "Precio";
      precioDiv.appendChild(precioSmall);
    
      const precioP = document.createElement("p");
      precioP.textContent = `S/${producto.precio}`;
      precioDiv.appendChild(precioP);
    
      div.appendChild(precioDiv);
    
      const subtotalDiv = document.createElement("div");
      subtotalDiv.classList.add("carrito-producto-subtotal");
    
      const subtotalSmall = document.createElement("small");
      subtotalSmall.textContent = "Subtotal";
      subtotalDiv.appendChild(subtotalSmall);
    
      const subtotalP = document.createElement("p");
      subtotalP.textContent = `S/${producto.precio * producto.cantidad}`;
      subtotalDiv.appendChild(subtotalP);
    
      div.appendChild(subtotalDiv);
    
      const eliminarButton = document.createElement("button");
      eliminarButton.classList.add("carrito-producto-eliminar");
      eliminarButton.id = producto.id;
      eliminarButton.innerHTML = '<i class="bi bi-trash-fill"></i>';
      div.appendChild(eliminarButton);
    
      contenedorCarritoProductos.append(div);
    });
    

    actualizarBotonesEliminar();
    actualizarTotal();
    actualizarControlesCantidad();
  } else {
    contenedorCarritoVacio.classList.remove("disabled");
    contenedorCarritoProductos.classList.add("disabled");
    contenedorCarritoAcciones.classList.add("disabled");
    contenedorCarritoComprado.classList.add("disabled");
  }
}

function actualizarBotonesEliminar() {
  botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");

  botonesEliminar.forEach(boton => {
    boton.addEventListener("click", eliminarDelCarrito);
  });
}

function actualizarControlesCantidad() {
  const botonesIncrementar = document.querySelectorAll(".carrito-producto-cantidad-incrementar");
  const botonesDecrementar = document.querySelectorAll(".carrito-producto-cantidad-decrementar");

  botonesIncrementar.forEach(boton => {
    boton.addEventListener("click", incrementarCantidad);
  });

  botonesDecrementar.forEach(boton => {
    boton.addEventListener("click", decrementarCantidad);
  });
}

function incrementarCantidad(e) {
  const idBoton = e.currentTarget.parentElement.parentElement.parentElement.querySelector(".carrito-producto-eliminar").id;
  const producto = productosEnCarrito.find(producto => producto.id === idBoton);

  if (producto) {
    producto.cantidad++;
    cargarProductosCarrito();
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
  }
}

function decrementarCantidad(e) {
  const idBoton = e.currentTarget.parentElement.parentElement.parentElement.querySelector(".carrito-producto-eliminar").id;
  const producto = productosEnCarrito.find(producto => producto.id === idBoton);

  if (producto && producto.cantidad > 1) {
    producto.cantidad--;
    cargarProductosCarrito();
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
  }
}

function eliminarDelCarrito(e) {
  Toastify({
    text: "Producto eliminado",
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
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

  const idBoton = e.currentTarget.id;
  const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);

  productosEnCarrito.splice(index, 1);
  cargarProductosCarrito();

  localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

botonVaciar.addEventListener("click", vaciarCarrito);

function vaciarCarrito() {
  Swal.fire({
    title: '¿Estás seguro?',
    icon: 'question',
    html: `Se van a borrar ${productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0)} productos.`,
    showCancelButton: true,
    focusConfirm: false,
    confirmButtonText: 'Sí',
    cancelButtonText: 'No'
  }).then((result) => {
    if (result.isConfirmed) {
      productosEnCarrito.length = 0;
      localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
      cargarProductosCarrito();
    }
  })
}

function actualizarTotal() {
  const totalCalculado = productosEnCarrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);
  contenedorTotal.innerText = `S/${totalCalculado}`;
}

botonComprar.addEventListener("click", () => {
  const obtenerProductosSeleccionados = () => {
    if (productosEnCarrito && productosEnCarrito.length > 0) {
      return productosEnCarrito;
    } else {
      return [];
    }
  };

  const productosSeleccionados = obtenerProductosSeleccionados();

  var precioTotal = document.getElementById("total").innerText;

  if (productosSeleccionados.length > 0) {
    let mensaje = '¡Hola! Quiero comprar los siguientes productos:\n\n';
    productosSeleccionados.forEach((producto) => {
      mensaje += `${producto.titulo} - Cantidad: ${producto.cantidad} - Precio: S/${producto.precio * producto.cantidad}\n`;
    });

    let mensaje2 = '\nPRECIO FINAL: ' + precioTotal + '\n';

    Swal.fire({
      title: 'Gracias Por confiar en \n WALI POT',
      icon: 'success',
      text: 'A continuacion te dirigiremos a WhatsApp en donde podras finalizar tu compra',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.isConfirmed) {
        const telefono = '51940601724'; // Coloca aquí el número de teléfono al que deseas enviar el mensaje por WhatsApp
        const url = `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(mensaje)}${mensaje2}`;
        window.open(url, '_blank');
      }
    });

    productosEnCarrito = [];
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    cargarProductosCarrito();
  } else {
    Swal.fire({
      title: 'Carrito vacío',
      icon: 'error',
      text: 'No hay productos en el carrito. Agrega algunos productos antes de realizar la compra.',
      confirmButtonText: 'Aceptar'
    });
  }
});


cargarProductosCarrito();
