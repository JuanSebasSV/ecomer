// === Cargar productos desde la API del backend (versión robusta) ===
async function fetchProductsFromAPI() {
  try {
    const res = await fetch("https://tiendavirtual-z09x.onrender.com/api/productos");
    if (!res.ok) throw new Error("Error al cargar productos del servidor: " + res.status);
    const data = await res.json();

    console.log("Productos obtenidos desde la base de datos:", data);

    // Mapear todos los posibles nombres de campo a la estructura que usa el front
    return data.map(p => ({
      id: p.id ?? p.productId ?? String(p._id ?? ""),                 // soporta id o productId o _id
      title: p.title ?? p.nombre ?? "Sin título",
      desc: p.desc ?? p.descripcion ?? "",
      price: (p.price ?? p.precio ?? 0),
      image: p.image ?? p.imagen ?? p.img ?? "../images/placeholder.png",
      category: p.category ?? p.categoria ?? "otros",
      rating: (p.rating ?? 4.5),
      reviews: (p.reviews ?? 0),
      newestRank: (p.newestRank ?? 0),
      badge: (p.badge ?? null)
    }));
  } catch (err) {
    console.error("❌ Error al traer productos:", err);
    return [];
  }
}

// === Inicializar productos (espera datos y luego renderiza) ===
let PRODUCTS = []; // global

async function initProducts() {
  PRODUCTS = await fetchProductsFromAPI();
  window.PRODUCTS = PRODUCTS;

  // Esperar a que el DOM exista y luego renderizar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('productos-grid')) render();
    });
  } else {
    if (document.getElementById('productos-grid')) render();
  }
}

// Llamada de arranque
initProducts();

// Estado de la interfaz
let state = {
  query: '',
  category: 'all',
  priceRange: 'all',
  sortBy: 'relevance',
  page: 1,
  perPage: 6
};

// Funciones auxiliares
function formatPrice(n) {
  return '$' + n.toLocaleString('es-CO');
}

function inPriceRange(price, range) {
  if (!range || range === 'all') return true;
  const [min, max] = range.split('-').map(x => Number(x));
  return price >= min && price <= max;
}

// Referencias al DOM (se ejecuta solo si existen los elementos)
const grid = document.getElementById('productos-grid');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const priceFilter = document.getElementById('price-filter');
const sortFilter = document.getElementById('sort-filter');
const pagination = document.getElementById('pagination');

// Render de tarjetas (ahora soporta badge si existe p.badge)
function createProductCard(p) {
  const wrapper = document.createElement('div');
  wrapper.className = 'bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 product-card relative';
  wrapper.setAttribute('data-category', p.category);
  wrapper.setAttribute('data-price', p.price);
  wrapper.setAttribute('data-product-id', p.id);
  wrapper.id = `product-${p.id}`;

  wrapper.innerHTML = `
    <div class="bg-gradient-to-br from-gray-100 to-gray-200 h-48 flex items-center justify-center relative overflow-hidden">
      ${p.badge ? `<span class="absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-md ${badgeClass(p.badge)} z-10">${p.badge}</span>` : ''}
      <img src="${p.image}" alt="${p.title}" loading="lazy" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
    </div>
    <div class="p-6">
      <h3 class="text-lg font-bold mb-2 text-gray-800 dark:text-gray-100">${p.title}</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">${p.desc}</p>
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-2xl font-bold text-blue-600 dark:text-blue-400">${formatPrice(p.price)}</span>
        </div>
        <div class="flex items-center">
          <div class="text-yellow-400 mr-2">${'★'.repeat(Math.round(p.rating))}</div>
          <span class="text-gray-500 text-sm">(${p.reviews} reseñas)</span>
        </div>
      </div>
      <div class="flex space-x-2">
        <button class="ver-detalles-btn bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition duration-300 flex-1 text-sm" data-product-id="${p.id}">Ver Detalles</button>
        <button class="add-to-cart-btn bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition duration-300 flex-1 text-sm"
          data-product="${p.title}" data-price="${p.price}" data-id="${p.id}">Comprar</button>
      </div>
    </div>
  `;
  return wrapper;
}

// Helper para clases visuales de badge (colores)
function badgeClass(label) {
  switch ((label || '').toLowerCase()) {
    case 'nuevo': return 'bg-green-600 text-white';
    case 'oferta': return 'bg-red-600 text-white';
    case 'top': return 'bg-yellow-400 text-black';
    default: return 'bg-gray-800 text-white';
  }
}

// Filtro general
function getFilteredProducts() {
  let list = PRODUCTS.filter(p => {
    const q = state.query.trim().toLowerCase();
    if (q) {
      const haystack = (p.title + ' ' + p.desc + ' ' + p.category).toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (state.category !== 'all' && p.category !== state.category) return false;
    if (!inPriceRange(p.price, state.priceRange)) return false;
    return true;
  });

  switch (state.sortBy) {
    case 'price-asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'name-asc':
      list.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'newest':
      list.sort((a, b) => (a.newestRank || 0) - (b.newestRank || 0));
      break;
    default:
      break;
  }

  return list;
}

// Render principal (actualizado)
function render() {
  if (!grid) return;

  const all = getFilteredProducts();
  const total = all.length;

  grid.innerHTML = '';

  // 🟦 Si el filtro está en "Todas las categorías", mostramos todos los productos (sin paginación)
  if (state.category === 'all') {
    all.forEach(p => grid.appendChild(createProductCard(p)));
    // Ocultamos la paginación
    if (pagination) pagination.innerHTML = '';
  } else {
    // 🟩 Si hay una categoría seleccionada, usamos paginación
    const start = (state.page - 1) * state.perPage;
    const end = start + state.perPage;
    const pageItems = all.slice(start, end);

    if (pageItems.length === 0) {
      grid.innerHTML = '<div class="col-span-1 text-center text-gray-500">No se encontraron productos.</div>';
    } else {
      pageItems.forEach(p => grid.appendChild(createProductCard(p)));
    }

    renderPagination(Math.ceil(total / state.perPage), state.page);
  }
}

// Render paginación 
function renderPagination(totalPages, current) {
  if (!pagination) return;
  pagination.innerHTML = '';

  if (totalPages <= 1) return; // si solo hay una página, no mostramos nada

  const prev = document.createElement('button');
  prev.className = 'px-4 py-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50';
  prev.textContent = 'Anterior';
  prev.disabled = current === 1;
  prev.addEventListener('click', () => {
    state.page = Math.max(1, state.page - 1);
    render();
  });
  pagination.appendChild(prev);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className =
      i === current
        ? 'px-4 py-2 bg-blue-600 text-white rounded-lg'
        : 'px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50';
    btn.textContent = i;
    btn.addEventListener('click', () => {
      state.page = i;
      render();
    });
    pagination.appendChild(btn);
  }

  const next = document.createElement('button');
  next.className = 'px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50';
  next.textContent = 'Siguiente';
  next.disabled = current === totalPages;
  next.addEventListener('click', () => {
    state.page = Math.min(totalPages, state.page + 1);
    render();
  });
  pagination.appendChild(next);
}

// Listeners (verifica que los elementos existan)
if (searchInput) {
  searchInput.addEventListener('input', e => {
    state.query = e.target.value;
    state.page = 1;
    render();
  });
}

if (categoryFilter) {
  categoryFilter.addEventListener('change', e => {
    state.category = e.target.value;
    state.page = 1;
    render();
  });
}

if (priceFilter) {
  priceFilter.addEventListener('change', e => {
    state.priceRange = e.target.value;
    state.page = 1;
    render();
  });
}

if (sortFilter) {
  sortFilter.addEventListener('change', e => {
    state.sortBy = e.target.value;
    state.page = 1;
    render();
  });
}

// === NOTIFICACIONES FLOTANTES (con botón de cierre) ===
function showNotification(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed top-4 right-4 space-y-3 z-[9999]";
    document.body.appendChild(container);
  }

  const isDark = document.documentElement.classList.contains("dark");

  const toast = document.createElement("div");
  toast.className = `
    relative flex items-start justify-between gap-3
    px-4 py-3 rounded-lg shadow-lg border
    transition-all duration-300 transform
    ${isDark
      ? "bg-gray-900 text-white border-gray-700"
      : "bg-white text-gray-900 border-gray-200"}
    ${type === "success" ? "border-green-500" : ""}
    ${type === "info" ? "border-blue-500" : ""}
    opacity-0 translate-y-2
  `;

  // Contenido del mensaje
  const messageSpan = document.createElement("span");
  messageSpan.textContent = message;
  messageSpan.className = "flex-1";

  // Botón de cierre (X)
  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "&times;";
  closeBtn.setAttribute("aria-label", "Cerrar notificación");
  closeBtn.className = `
    text-lg leading-none font-bold ml-2
    ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-black"}
    transition-colors duration-200
  `;

  // Al hacer clic en la X, eliminar con animación
  closeBtn.addEventListener("click", () => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  });

  toast.appendChild(messageSpan);
  toast.appendChild(closeBtn);
  container.appendChild(toast);

  // Animación de entrada
  requestAnimationFrame(() => {
    toast.classList.remove("opacity-0", "translate-y-2");
    toast.classList.add("opacity-100", "translate-y-0");
  });

  // Autoeliminar después de 3.5s
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}



// === CONTADOR DE CARRITO (visual) ===
let cartCount = 0;
const cartCounter = document.getElementById("cart-counter");

// Delegación de eventos global (añadir al carrito desde productos)
document.addEventListener("click", (e) => {
  const addBtn = e.target.closest(".add-to-cart-btn");
  const detailsBtn = e.target.closest(".ver-detalles-btn");

  // BOTÓN COMPRAR - VERSIÓN CORREGIDA CON IMAGEN GARANTIZADA
  if (addBtn) {
    const productCard = addBtn.closest(".product-card");
    const id =
      addBtn.dataset.id || addBtn.dataset.productId || addBtn.dataset.product;
    const title = addBtn.dataset.product || addBtn.dataset.id || "Producto";
    const price = Number(addBtn.dataset.price || 0);

    // CRÍTICO: Obtener la imagen correctamente con múltiples fallbacks
    let image = "";

    // Método 1: Desde el img dentro de la tarjeta
    const imgElement = productCard?.querySelector("img");
    if (imgElement) {
      image = imgElement.getAttribute("src") || imgElement.src;
      console.log(`📸 Imagen desde elemento <img>: ${image}`);
    }

    // Método 2: Desde el dataset (si lo tienes)
    if (!image && addBtn.dataset.image) {
      image = addBtn.dataset.image;
      console.log(`📸 Imagen desde dataset: ${image}`);
    }

    // Método 3: Buscar en el array de productos global
    if (!image && window.PRODUCTS && Array.isArray(window.PRODUCTS)) {
      const product = window.PRODUCTS.find((p) => p.id == id);
      if (product && product.image) {
        image = product.image;
        console.log(`📸 Imagen desde PRODUCTS global: ${image}`);
      }
    }

    // Fallback: placeholder
    if (!image) {
      image = "../images/placeholder.png";
      console.log(`⚠️ No se encontró imagen, usando placeholder`);
    }

    console.log(`🛒 Agregando al carrito:`, {
      id,
      title,
      price,
      image,
      qty: 1,
    });

    // Leer carrito desde localStorage
    const cart = readCartLocal();
    const idx = cart.findIndex((i) => i.id === id);

    if (idx === -1) {
      // Agregar nuevo producto
      cart.push({
        id,
        title,
        price,
        qty: 1,
        image, // ← ASEGURAR QUE LA IMAGEN SE GUARDE
      });
    } else {
      // Incrementar cantidad
      cart[idx].qty = (cart[idx].qty || 0) + 1;
      // IMPORTANTE: Actualizar imagen por si no la tenía
      if (!cart[idx].image) {
        cart[idx].image = image;
      }
    }

    writeCartLocal(cart);

    // Actualizar contador visual
    const counterEl = document.getElementById("cart-counter");
    if (counterEl) {
      const total = cart.reduce((s, i) => s + (i.qty || 0), 0);
      counterEl.style.display = total > 0 ? "flex" : "none";
      counterEl.textContent = total;
    }

    // Notificación
    showNotification(
      `Tu producto "${title}" ha sido añadido al carrito 🛒`,
      "success"
    );
  }

  // BOTÓN DETALLES (reemplaza alert con notificación)
  if (detailsBtn) {
    const pid = detailsBtn.dataset.productId;
    showNotification(`Detalles del producto (${pid})`, "info");
  }
});


// Inicializar render al cargar la página (productos)
document.addEventListener('DOMContentLoaded', () => {
  if (grid) render();
  console.log('✅ Script de productos inicializado correctamente (' + PRODUCTS.length + ' productos cargados)');
});
