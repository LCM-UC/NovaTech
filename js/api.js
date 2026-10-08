const BASE_URL = 'https://apiapp-16i1.onrender.com/api';

// Control de elementos de UI para estado
const loader = document.getElementById('loader');
const errorMsg = document.getElementById('error-message');

function mostrarCarga(mostrar) {
    if (mostrar) loader.classList.remove('hidden');
    else loader.classList.add('hidden');
}

function mostrarError(mensaje) {
    errorMsg.textContent = mensaje;
    errorMsg.classList.remove('hidden');
    setTimeout(() => errorMsg.classList.add('hidden'), 5000);
}

// Funciones de consumo de API
async function fetchAPI(endpoint) {
    try {
        mostrarCarga(true);
        // Hacemos la petición a tu API desplegada
        const response = await fetch(`${BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error('Error en la respuesta del servidor');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error Fetch:", error);
        mostrarError("Hubo un problema de conexión con el servidor. Intenta nuevamente.");
        return null;
    } finally {
        mostrarCarga(false);
    }
}

// Servicios específicos
const apiService = {
    getProductos: () => fetchAPI('/productos'),
    getCategorias: () => fetchAPI('/categorias')
};