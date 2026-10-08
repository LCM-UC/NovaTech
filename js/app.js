// Estado global de la aplicación
let productosGlobal = [];
let categoriasGlobal = [];
let carrito = []; // Guarda objetos: { producto: {}, cantidad: 1 }

// Elementos del DOM
const gridProductos = document.getElementById('grid-productos');
const selectCategoria = document.getElementById('select-categoria');
const inputBusqueda = document.getElementById('input-busqueda');
const emptyMessage = document.getElementById('empty-message');
const contenedorDetalle = document.getElementById('contenedor-detalle');

function navegar(seccionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(`sec-${seccionId}`).classList.remove('hidden');
    
    if (seccionId === 'catalogo' && productosGlobal.length === 0) {
        inicializarCatalogo();
    }
}

async function inicializarCatalogo() {
    categoriasGlobal = await apiService.getCategorias();
    productosGlobal = await apiService.getProductos();

    if (categoriasGlobal) renderizarFiltroCategorias();
    if (productosGlobal) {
        renderizarProductos(productosGlobal);
        renderizarCarruselesInicio();
    }
}

function renderizarCarruselesInicio() {
    const contenedor = document.getElementById('carruseles-inicio');
    contenedor.innerHTML = '';

    categoriasGlobal.forEach(cat => {
        const catId = cat.id || cat.Id;
        const catNombre = cat.nombre || cat.Nombre;
        
        const productosCat = productosGlobal.filter(p => (p.categoriaId || p.CategoriaId) === catId);
        
        if(productosCat.length > 0) {
            const seccion = document.createElement('div');
            seccion.className = 'mb-5 text-start';
            
            let htmlCards = '';
            productosCat.forEach(prod => {
                const id = prod.id || prod.Id;
                const nombre = prod.nombre || prod.Nombre;
                const precio = prod.precio || prod.Precio;
                const imagen = prod.imagen || prod.Imagen;

                htmlCards += `
                    <div class="card-wrapper">
                        <div class="card h-100 tech-card text-light border-secondary rounded-0 p-2">
                            <img src="${imagen}" class="card-img-top rounded-0 img-grayscale" alt="${nombre}">
                            <div class="card-body d-flex flex-column px-2">
                                <h5 class="card-title fw-bold fs-6">${nombre}</h5>
                                <h4 class="mb-3">$${precio.toFixed(2)}</h4>
                                <div class="mt-auto">
                                    <button class="btn btn-outline-light btn-sm rounded-0 w-100 fw-bold" onclick="verDetalle(${id})">VER DETALLES</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            seccion.innerHTML = `
                <h3 class="fw-bold border-bottom border-secondary pb-2 mb-4 tracking-wide text-uppercase">_DESTACADOS: ${catNombre}</h3>
                <div class="horizontal-scroll">
                    ${htmlCards}
                </div>
            `;
            contenedor.appendChild(seccion);
        }
    });
}

function renderizarProductos(productos) {
    gridProductos.innerHTML = '';
    
    if (productos.length === 0) {
        emptyMessage.classList.remove('hidden');
        return;
    }
    emptyMessage.classList.add('hidden');

    productos.forEach(prod => {
        const id = prod.id || prod.Id;
        const nombre = prod.nombre || prod.Nombre;
        const precio = prod.precio || prod.Precio;
        const categoriaId = prod.categoriaId || prod.CategoriaId;
        const imagen = prod.imagen || prod.Imagen;

        const cat = categoriasGlobal.find(c => (c.id || c.Id) === categoriaId);
        const nombreCat = cat ? (cat.nombre || cat.Nombre) : 'General';

        const col = document.createElement('div');
        col.className = 'col';
        
        col.innerHTML = `
            <div class="card h-100 tech-card text-light border-secondary rounded-0 p-2">
                <img src="${imagen}" class="card-img-top rounded-0 img-grayscale" alt="${nombre}">
                <div class="card-body d-flex flex-column px-2">
                    <small class="text-muted tracking-wide mb-2">[ ${nombreCat.toUpperCase()} ]</small>
                    <h5 class="card-title fw-bold">${nombre}</h5>
                    <h4 class="mb-3">$${precio.toFixed(2)}</h4>
                    <div class="mt-auto">
                        <button class="btn btn-outline-light rounded-0 w-100 mb-2 fw-bold" onclick="verDetalle(${id})">DETALLES</button>
                        <button class="btn btn-light rounded-0 w-100 fw-bold" onclick="agregarAlCarrito(${id}, false)">AÑADIR RÁPIDO</button>
                    </div>
                </div>
            </div>
        `;
        gridProductos.appendChild(col);
    });
}

function renderizarFiltroCategorias() {
    categoriasGlobal.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id || cat.Id;
        option.textContent = cat.nombre || cat.Nombre;
        selectCategoria.appendChild(option);
    });
}

function aplicarFiltros() {
    const texto = inputBusqueda.value.toLowerCase();
    const categoriaId = selectCategoria.value;

    const filtrados = productosGlobal.filter(prod => {
        const nombre = prod.nombre || prod.Nombre;
        const catId = prod.categoriaId || prod.CategoriaId;
        
        const coincideTexto = nombre.toLowerCase().includes(texto);
        const coincideCategoria = categoriaId === 'todas' || catId.toString() === categoriaId;
        return coincideTexto && coincideCategoria;
    });

    renderizarProductos(filtrados);
}

inputBusqueda.addEventListener('input', aplicarFiltros);
selectCategoria.addEventListener('change', aplicarFiltros);

function verDetalle(idBuscado) {
    const producto = productosGlobal.find(p => (p.id || p.Id) === idBuscado);
    if(!producto) return;

    const cat = categoriasGlobal.find(c => (c.id || c.Id) === (producto.categoriaId || producto.CategoriaId));
    const nombreCat = cat ? (cat.nombre || cat.Nombre) : 'General';
    const precio = producto.precio || producto.Precio;
    const imagen = producto.imagen || producto.Imagen;
    const specs = producto.especificaciones || producto.Especificaciones;
    const stock = producto.stock || producto.Stock;
    const id = producto.id || producto.Id;
    
    contenedorDetalle.innerHTML = `
        <div class="row g-5 align-items-center">
            <div class="col-md-5">
                <img src="${imagen}" class="img-fluid img-detail" alt="${producto.nombre || producto.Nombre}">
            </div>
            <div class="col-md-7">
                <p class="text-muted tracking-wide mb-1">// ${nombreCat.toUpperCase()}</p>
                <h2 class="display-6 fw-bold mb-3">${producto.nombre || producto.Nombre}</h2>
                <h3 class="text-white mb-4 fs-1">$${precio.toFixed(2)}</h3>
                <div class="mb-4">
                    <strong class="text-muted">ESPECIFICACIONES TÉCNICAS:</strong><br>
                    <span class="fs-5">${specs}</span>
                </div>
                <p class="text-muted mb-4">Stock disponible: ${stock} unidades</p>
                
                <div class="d-flex align-items-center mb-4">
                    <label class="text-muted me-3 fw-bold">CANTIDAD:</label>
                    <input type="number" id="input-cantidad" class="form-control bg-dark text-light border-secondary rounded-0 text-center fs-5" value="1" min="1" max="${stock}" style="width: 100px;">
                </div>

                <button class="btn btn-light btn-lg rounded-0 fw-bold px-5" onclick="agregarAlCarrito(${id}, true)">
                    AÑADIR AL CARRITO
                </button>
            </div>
        </div>
    `;
    navegar('detalle');
}

function agregarAlCarrito(id, desdeDetalle) {
    const producto = productosGlobal.find(p => (p.id || p.Id) === id);
    if(!producto) return;

    let cantidadAComprar = 1;

    if (desdeDetalle) {
        const input = document.getElementById('input-cantidad');
        if (input) cantidadAComprar = parseInt(input.value);
    }

    const itemExistente = carrito.find(item => (item.producto.id || item.producto.Id) === id);

    if (itemExistente) {
        itemExistente.cantidad += cantidadAComprar; 
    } else {
        carrito.push({ producto: producto, cantidad: cantidadAComprar }); 
    }

    actualizarCarritoUI();
    
    const btnCart = document.querySelector('nav button:last-child');
    btnCart.classList.remove('btn-outline-light');
    btnCart.classList.add('btn-light');
    setTimeout(() => {
        btnCart.classList.remove('btn-light');
        btnCart.classList.add('btn-outline-light');
    }, 300);
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarritoUI();
}

function actualizarCarritoUI() {
    const totalItems = carrito.reduce((suma, item) => suma + item.cantidad, 0);
    document.getElementById('cart-count').textContent = totalItems;
    
    const lista = document.getElementById('lista-carrito');
    lista.innerHTML = '';
    
    let total = 0;
    
    if(carrito.length === 0) {
        lista.innerHTML = '<p class="text-muted text-center py-3">El carrito está vacío.</p>';
    } else {
        carrito.forEach((item, index) => {
            const prod = item.producto;
            const precio = prod.precio || prod.Precio;
            const nombre = prod.nombre || prod.Nombre;
            const subtotal = precio * item.cantidad;
            
            total += subtotal;
            
            const div = document.createElement('div');
            div.className = 'carrito-item flex-column flex-md-row align-items-start align-items-md-center';
            div.innerHTML = `
                <div class="mb-2 mb-md-0">
                    <span class="fs-5">${nombre}</span><br>
                    <small class="text-muted">Cantidad: ${item.cantidad} x $${precio.toFixed(2)}</small>
                </div>
                <div class="d-flex align-items-center w-100 justify-content-between justify-content-md-end" style="max-width: 200px;">
                    <span class="fs-4 me-4 fw-bold text-white">$${subtotal.toFixed(2)}</span>
                    <button class="btn btn-sm btn-outline-danger rounded-0" onclick="eliminarDelCarrito(${index})">X</button>
                </div>
            `;
            lista.appendChild(div);
        });
    }
    document.getElementById('total-precio').textContent = total.toFixed(2);
}

function procesarCompra() {
    if(carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }
    alert("¡Orden procesada con éxito! Conectando con la pasarela...");
    carrito = [];
    actualizarCarritoUI();
    navegar('inicio');
}

// Iniciar cargando la data 
window.onload = () => {
    inicializarCatalogo();
};