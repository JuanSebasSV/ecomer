// === Carrusel de imágenes del Hero ===
const heroImages = [
  "../images/hero1.jpg",
  "../images/hero2.jpg",
  "../images/hero3.jpg"
];

const heroSection = document.getElementById("hero");

if (heroSection) {
  let currentIndex = 0;

  function changeBackground() {
    heroSection.style.backgroundImage = `url('${heroImages[currentIndex]}')`;
    heroSection.style.backgroundSize = "cover";
    heroSection.style.backgroundPosition = "center";
    heroSection.style.transition = "background-image 1s ease-in-out";
    currentIndex = (currentIndex + 1) % heroImages.length;
  }

  // Cambia la imagen cada 5 segundos
  changeBackground(); // primera vez
  setInterval(changeBackground, 5000);
}

// === MODO OSCURO (versión robusta: init inmediato si es necesario) ===
(function () {
  function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');

    if (!themeToggleBtn || !lightIcon || !darkIcon) {
      console.error("⚠️ theme-toggle o iconos no encontrados");
      return;
    }

    // Evitar inicializar más de una vez
    if (themeToggleBtn.dataset.themeInit === "1") return;
    themeToggleBtn.dataset.themeInit = "1";

    // Por defecto esconder ambos (evita flash donde se ven ambos)
    lightIcon.style.display = 'none';
    darkIcon.style.display = 'none';
    lightIcon.setAttribute('aria-hidden', 'true');
    darkIcon.setAttribute('aria-hidden', 'true');

    function applyIconVisibility(isDark) {
      if (isDark) {
        lightIcon.style.display = 'none';
        darkIcon.style.display = 'inline-block';
        lightIcon.setAttribute('aria-hidden', 'true');
        darkIcon.setAttribute('aria-hidden', 'false');
      } else {
        lightIcon.style.display = 'inline-block';
        darkIcon.style.display = 'none';
        lightIcon.setAttribute('aria-hidden', 'false');
        darkIcon.setAttribute('aria-hidden', 'true');
      }
    }

    // Determinar estado inicial
    const stored = localStorage.getItem('theme'); // 'dark' | 'light' | null
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialIsDark = (stored === 'dark') || (stored === null && prefersDark);

    // Aplicar clase al documento y mostrar icono correcto
    document.documentElement.classList.toggle('dark', !!initialIsDark);
    applyIconVisibility(!!initialIsDark);

    // Click handler
    themeToggleBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const isDarkNow = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDarkNow ? 'dark' : 'light');
      applyIconVisibility(isDarkNow);
    });

    // Escuchar cambio de preferencia del sistema solo si no hay preferencia guardada
    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const onChange = e => {
        if (!localStorage.getItem('theme')) {
          const systemDark = !!e.matches;
          document.documentElement.classList.toggle('dark', systemDark);
          applyIconVisibility(systemDark);
        }
      };
      // compatibilidad: addEventListener('change') o addListener
      try {
        mq.addEventListener('change', onChange);
      } catch (err) {
        try { mq.addListener(onChange); } catch (e) { /* ignore */ }
      }
    }
  }

  // Init inmediato si el DOM ya está listo, o on DOMContentLoaded si no
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
  } else {
    initThemeToggle();
  }
})();

// --- Newsletter → Redirigir a registro con email guardado ---
(function setupNewsletterRedirect() {
  const btn = document.getElementById("newsletter-btn");
  const emailInput = document.getElementById("newsletter-email");

  if (!btn || !emailInput) return;

  btn.addEventListener("click", () => {
    const email = emailInput.value.trim();

    // Si escribió un correo, guardarlo temporalmente
    if (email.length > 5 && email.includes("@")) {
      localStorage.setItem("preRegisterEmail", email);
    }

    // Redirigir al formulario de registro
    window.location.href = "./register.html";
  });
})();

// === Cargar productos desde la API del backend (versión robusta) ===
async function fetchProductsFromAPI() {
  try {
    const res = await fetch("http://localhost:8081/api/productos");
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


// REDIRECCIÓN POR CATEGORÍAS
document.addEventListener('DOMContentLoaded', () => {
  // Si hay recuadros de categorías (index.html)
  const categoryCards = document.querySelectorAll('[data-category]');
  if (categoryCards.length > 0) {
    categoryCards.forEach(card => {
      card.addEventListener('click', () => {
        const category = card.getAttribute('data-category');
        // Redirige a productos.html con el filtro aplicado
        window.location.href = `./productos.html?category=${category}`;
      });
    });
  }

  // Si estamos en productos.html, leer la categoría de la URL
  const params = new URLSearchParams(window.location.search);
  const urlCategory = params.get('category');
  const categorySelect = document.getElementById('category-filter');

  if (urlCategory && categorySelect) {
    // Validar categorías existentes
    const validCategories = ['laptops', 'celulares', 'componentes', 'accesorios'];
    if (validCategories.includes(urlCategory)) {
      // Aplicar filtro automático
      state.category = urlCategory;
      categorySelect.value = urlCategory;
      if (grid) render();
    }
  }
});


// === CONTADOR DE CARRITO (visual) ===
let cartCount = 0;
const cartCounter = document.getElementById("cart-counter");

// Delegación de eventos global (añadir al carrito desde productos)
document.addEventListener("click", (e) => {
  const addBtn = e.target.closest(".add-to-cart-btn");
  const detailsBtn = e.target.closest(".ver-detalles-btn");

  // BOTÓN COMPRAR (visual + persistencia)
  if (addBtn) {
    // intenta leer id/title/price/image defensivamente
    const id = addBtn.dataset.id || addBtn.dataset.productId || addBtn.dataset.product;
    const title = addBtn.dataset.product || addBtn.dataset.id || 'Producto';
    const price = Number(addBtn.dataset.price) || 0;
    const image = addBtn.closest('.product-card')?.querySelector('img')?.src || '';

    // leer carrito desde localStorage y persistir (se usan funciones definidas abajo)
    const cart = readCartLocal();
    const idx = cart.findIndex(i => i.id === id);
    if (idx === -1) {
      cart.push({ id, title, price, qty: 1, image });
    } else {
      cart[idx].qty = (cart[idx].qty || 0) + 1;
    }
    writeCartLocal(cart);

    // actualizar contador visual
    const counterEl = document.getElementById('cart-counter');
    if (counterEl) {
      const total = cart.reduce((s,i)=> s + (i.qty||0), 0);
      counterEl.style.display = total > 0 ? 'flex' : 'none';
      counterEl.textContent = total;
    }

    // notificación
    showNotification(`Tu producto "${title}" ha sido añadido al carrito 🛒`, "success");
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


// ---------- Persistencia de carrito (global, main.js) ----------
const CART_KEY = 'techstore_cart';

function readCartLocal() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) { return []; }
}

function writeCartLocal(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    // disparar storage para la misma pestaña para que car.html reaccione si está abierta
    try {
      window.dispatchEvent(new StorageEvent('storage', { key: CART_KEY, newValue: JSON.stringify(cart) }));
    } catch (e) {
      // algunos navegadores no permiten construir StorageEvent de esa forma; como fallback, llamamos a un evento custom
      const ev = new Event('techstore_cart_updated');
      window.dispatchEvent(ev);
    }
  } catch (e) {
    console.error('Error guardando carrito:', e);
  }
}


// ----------  car.html  ----------
(function setupCartPageIntegration() {
  // Ejecutar solo si estamos en una página con elementos del carrito (car.html)
  // Buscamos elementos clave para decidir si activamos esta sección
  function isCartPage() {
    return !!document.getElementById('cart-items') || location.pathname.includes('car.html') || location.pathname.includes('/pages/car.html');
  }

  // Helper: actualizar contador en header según localStorage
  function updateCartCounterUI() {
    const cart = readCartLocal();
    const count = cart.reduce((s,i)=> s + (i.qty||0), 0);
    const el = document.getElementById('cart-counter');
    if (!el) return;
    if (count > 0) {
      el.style.display = 'flex';
      el.textContent = count;
    } else {
      el.style.display = 'none';
    }
  }

  // Render carrito (usa window.PRODUCTS si el item solo contiene id+qty)
  function renderCartItems() {
    const itemsContainer = document.getElementById('cart-items');
    const emptyText = document.getElementById('cart-empty-text');
    const totalItemsEl = document.getElementById('cart-total-items');
    const totalPriceEl = document.getElementById('cart-total-price');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');

    if (!itemsContainer) return;
    const cart = readCartLocal();

    itemsContainer.innerHTML = '';
    if (cart.length === 0) {
      emptyText && emptyText.classList.remove('hidden');
    } else {
      emptyText && emptyText.classList.add('hidden');
    }

    let subtotal = 0;
    let totalItems = 0;

    cart.forEach(item => {
      // item might be minimal ({id, qty}) or full ({id, title, price, image, qty})
      let product = item;
      if (!item.title || !item.price) {
        // try to resolve from global products list
        if (window.PRODUCTS && Array.isArray(window.PRODUCTS)) {
          const full = window.PRODUCTS.find(p => p.id == item.id);
          if (full) {
            product = {
              id: item.id,
              title: full.title,
              price: full.price,
              image: full.image,
              qty: item.qty || 1
            };
          } else {
            // fallback: keep item as-is but ensure fields exist
            product = {
              id: item.id,
              title: item.title || item.id,
              price: item.price || 0,
              image: item.image || '',
              qty: item.qty || 1
            };
          }
        } else {
          // no PRODUCTS available: render minimal
          product = {
            id: item.id,
            title: item.title || item.id,
            price: item.price || 0,
            image: item.image || '',
            qty: item.qty || 1
          };
        }
      }

      subtotal += (product.price || 0) * (product.qty || 0);
      totalItems += (product.qty || 0);

      const row = document.createElement('div');
      row.className = 'flex items-center gap-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4';

      row.innerHTML = `
        <img src="${product.image || 'https://via.placeholder.com/120'}" alt="${product.title}" class="w-20 h-20 object-cover rounded-md flex-shrink-0">
        <div class="flex-1">
          <div class="font-semibold text-gray-800 dark:text-gray-100">${product.title}</div>
          <div class="text-sm text-gray-500 dark:text-gray-300">${formatPrice(product.price)}</div>
          <div class="mt-2 flex items-center gap-2">
            <button class="decrease-qty px-2 py-1 border rounded text-gray-700 dark:text-gray-200">-</button>
            <span class="px-3 py-1 bg-white dark:bg-gray-800 rounded">${product.qty}</span>
            <button class="increase-qty px-2 py-1 border rounded text-gray-700 dark:text-gray-200">+</button>
            <button class="remove-item ml-4 text-sm text-rose-600 dark:text-rose-400">Eliminar</button>
          </div>
        </div>
        <div class="text-right">
          <div class="font-semibold text-gray-800 dark:text-gray-100">${formatPrice((product.price || 0) * (product.qty || 0))}</div>
        </div>
      `;

      // attach handlers
      row.querySelector('.increase-qty').addEventListener('click', () => {
        updateQty(product.id, product.qty + 1);
      });
      row.querySelector('.decrease-qty').addEventListener('click', () => {
        updateQty(product.id, Math.max(1, product.qty - 1));
      });
      row.querySelector('.remove-item').addEventListener('click', () => {
        removeItem(product.id);
      });

      itemsContainer.appendChild(row);
    });

    // actualizar resumen
    totalItemsEl && (totalItemsEl.textContent = totalItems);
    totalPriceEl && (totalPriceEl.textContent = formatPrice(subtotal));
    if (summarySubtotal) summarySubtotal.textContent = formatPrice(subtotal);
    if (summaryTotal) summaryTotal.textContent = formatPrice(subtotal);
    updateCartCounterUI();
  }

  function updateQty(id, qty) {
    const cart = readCartLocal();
    const idx = cart.findIndex(i => i.id === id);
    if (idx === -1) return;
    cart[idx].qty = qty;
    writeCartLocal(cart);
    renderCartItems();
    showNotification('Cantidad actualizada', 'info');
  }

  function removeItem(id) {
    let cart = readCartLocal();
    cart = cart.filter(i => i.id !== id);
    writeCartLocal(cart);
    renderCartItems();
    showNotification('Producto eliminado del carrito', 'info');
  }

  function clearCart() {
    writeCartLocal([]);
    renderCartItems();
    showNotification('Carrito vaciado', 'info');
  }

  // Conectar botones y eventos sólo si estamos en la página del carrito
  document.addEventListener('DOMContentLoaded', () => {
    if (!isCartPage()) return;

    // Inicial render
    renderCartItems();

    // Botones UI
    document.getElementById('continue-shopping')?.addEventListener('click', () => {
      window.location.href = './productos.html';
    });

    document.getElementById('empty-cart')?.addEventListener('click', () => {
      if (confirm('¿Vaciar el carrito?')) clearCart();
    });

    document.getElementById('checkout-btn')?.addEventListener('click', () => {
      const cart = readCartLocal();
      if (!cart.length) {
        alert('Tu carrito está vacío.');
        return;
      }
      // Por ahora sólo simulamos
      showNotification('Proceso de pago simulado (implementa tu gateway)', 'info');
    });

    // Escuchar storage para actualizar si cambian en otra pestaña
    window.addEventListener('storage', (e) => {
      if (!e.key || e.key === CART_KEY) {
        renderCartItems();
      }
    });

    // también escuchar custom fallback event (en writeCartLocal fallback)
    window.addEventListener('techstore_cart_updated', () => {
      renderCartItems();
    });
  });

})(); // fin setupCartPageIntegration

// ---------------- Registro de usuario ----------------
(function setupRegisterForm() {
  // Solo activar si existe el formulario
  if (document.getElementById('register-form') === null) return;

  const form = document.getElementById('register-form');
  const submitBtn = document.getElementById('register-submit');

  function disableBtn(disabled = true) {
    if (!submitBtn) return;
    submitBtn.disabled = disabled;
    submitBtn.classList.toggle('opacity-60', disabled);
    submitBtn.classList.toggle('cursor-not-allowed', disabled);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    disableBtn(true);

    // Leer valores
    const payload = {
      userId: (document.getElementById('userId')?.value || '').trim(),
      nombre: (document.getElementById('nombre')?.value || '').trim(),
      apellido: (document.getElementById('apellido')?.value || '').trim(),
      telefono: (document.getElementById('telefono')?.value || '').trim(),
      correo: (document.getElementById('correo')?.value || '').trim(),
      password: (document.getElementById('password')?.value || ''),
    };

    // Validación mínima cliente
    if (!payload.userId || !payload.nombre || !payload.apellido || !payload.correo || !payload.password) {
      showNotification('Por favor completa todos los campos obligatorios', 'info');
      disableBtn(false);
      return;
    }

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.message || `Error ${res.status} al registrar`;
        showNotification(msg, 'info');
        disableBtn(false);
        return;
      }

      showNotification('Registro exitoso. Redirigiendo al login...', 'success');

      // pequeño delay para que el usuario vea el toast y luego redirigimos
      setTimeout(() => {
        window.location.href = './login.html';
      }, 900);

    } catch (err) {
      console.error('Error al registrar usuario:', err);
      showNotification('Error de conexión. Intenta de nuevo más tarde.', 'info');
      disableBtn(false);
    }
  });
})();

// --- Autocompletar email en la página register.html ---
(function autofillRegisterEmail() {
  if (!window.location.pathname.includes("register.html")) return;

  const input = document.getElementById("register-email");
  if (!input) return;

  const savedEmail = localStorage.getItem("preRegisterEmail");
  if (savedEmail) {
    input.value = savedEmail;
  }

  // Opcional: eliminar después de usarlo
  localStorage.removeItem("preRegisterEmail");
})();


// ---- Control de iconos de usuario (login / avatar + menú) ----
(function handleUserIcon() {
  const loginIcon = document.getElementById("user-login-icon");
  const avatar = document.getElementById("user-avatar");
  const userMenu = document.getElementById("user-menu");
  const btnPerfil = document.getElementById("btn-ver-perfil");
  const btnLogout = document.getElementById("btn-cerrar-sesion");

  if (!loginIcon || !avatar) return;

  // Revisar si hay usuario guardado
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ---- NO HAY SESIÓN ----
  if (!user) {
    loginIcon.style.display = "flex";
    avatar.style.display = "none";
    if (userMenu) userMenu.classList.add("hidden");
    return;
  }

  // ---- HAY SESIÓN ----
  loginIcon.style.display = "none";
  avatar.style.display = "flex";

  const inicial = user.nombre?.charAt(0)?.toUpperCase() || "?";
  avatar.textContent = inicial;

  // Toggle del menú
  avatar.addEventListener("click", () => {
    userMenu.classList.toggle("hidden");
  });

  // Cierra menú al hacer click fuera
  document.addEventListener("click", (e) => {
    if (!avatar.contains(e.target) && !userMenu.contains(e.target)) {
      userMenu.classList.add("hidden");
    }
  });

  // Ver perfil
  if (btnPerfil) {
    btnPerfil.addEventListener("click", () => {
      window.location.href = "./perfil.html";
    });
  }

  // Cerrar sesión
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("user");
      location.reload();
    });
  }
})();


//  ANIMACIÓN MOSTRAR/OCULTAR CONTRASEÑA
// ------------------------------------------------------
(function setupPasswordToggle() {
  const input = document.getElementById("password");
  const toggle = document.getElementById("toggle-password");
  const eyeOpen = document.getElementById("eye-icon-open");
  const eyeClosed = document.getElementById("eye-icon-closed");

  if (!input || !toggle) return;

  toggle.addEventListener("click", () => {
    const isHidden = input.type === "password";

    // --- Mostrar contraseña ---
    if (isHidden) {
      input.type = "text";
      eyeOpen.classList.add("hidden");
      eyeClosed.classList.remove("hidden");
      return;
    }

    // --- Ocultar contraseña con animación ---
    const original = input.value;
    if (!original.length) {
      input.type = "password";
      eyeOpen.classList.remove("hidden");
      eyeClosed.classList.add("hidden");
      return;
    }

    let chars = original.split("");
    let index = 0;

    // Animación: cambia 1 letra → "•" cada 35ms (izq → der)
    const interval = setInterval(() => {
      chars[index] = "•";

      input.value = chars.join("");

      index++;

      if (index >= chars.length) {
        clearInterval(interval);

        setTimeout(() => {
          input.type = "password";
          input.value = original; 

          eyeOpen.classList.remove("hidden");
          eyeClosed.classList.add("hidden");
        }, 80);
      }
    }, 35); // velocidad de animación
  });
})();

// =============================
//  LOGIN.JS INTEGRADO EN MAIN
// =============================
(function setupLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  console.log("📌 Sistema de login cargado");

  const API_URL = "http://localhost:8081/api/login"; // confirma que esta ruta es la correcta en tu backend
  const btn = document.getElementById("login-btn");
  const errorDiv = document.getElementById("login-error");
  const errorMsg = document.getElementById("login-error-message");

  // helper: mostrar mensaje (info o success)
  function showMessage(text, type = "error") {
    if (!errorDiv || !errorMsg) return;
    errorMsg.textContent = text;
    errorDiv.classList.remove("hidden");
    if (type === "success") {
      errorDiv.className = "mx-auto max-w-md mb-4 rounded-lg px-4 py-2 text-sm bg-green-100 border border-green-300 text-green-700";
    } else {
      errorDiv.className = "mx-auto max-w-md mb-4 rounded-lg px-4 py-2 text-sm bg-red-100 border border-red-300 text-red-700";
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (errorDiv) errorDiv.classList.add("hidden");

    const datos = {
      correo: document.getElementById("email")?.value.trim() || "",
      password: document.getElementById("password")?.value || ""
    };

    if (!datos.correo || !datos.password) {
      showMessage("Por favor completa todos los campos.", "error");
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = "Iniciando sesión...";
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });

      const resultado = await response.json().catch(() => ({}));

      if (response.ok) {
        const usuario = resultado.usuario || resultado.user || resultado.data || resultado;
        const id = usuario?.id || usuario?._id || resultado?.id || null;

        if (!usuario || !id) {
          showMessage("Inicio de sesión correcto, pero la respuesta del servidor no incluye datos de usuario.", "error");
          console.warn("Respuesta inesperada del backend:", resultado);
          if (btn) { btn.disabled = false; btn.textContent = "Iniciar Sesión"; }
          return;
        }

        // Guardar sesión (clave 'user' — coincidente con handleUserIcon)
        localStorage.setItem("sesionActiva", "true");
        localStorage.setItem("user", JSON.stringify({
          id: id,
          nombre: usuario.nombre || usuario.firstName || "",
          apellido: usuario.apellido || usuario.lastName || "",
          telefono: usuario.telefono || usuario.phone || "",
          correo: usuario.correo || usuario.email || ""
        }));

        showMessage("Inicio de sesión correcto. Redirigiendo...", "success");

        setTimeout(() => {
          window.location.href = "productos.html";
        }, 700);

      } else {
        const msg = resultado?.message || resultado?.error || `Credenciales incorrectas (status ${response.status})`;
        showMessage(msg, "error");
      }

    } catch (error) {
      console.error("❌ Error de conexión:", error);
      showMessage("No se pudo conectar al servidor.", "error");
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Iniciar Sesión"; }
    }
  });
})();


// ===============================================
//        CONTROL DINÁMICO DE PERFIL 
// ===============================================
(function setupProfilePage() {
  // Detectar si estamos en perfil.html
  if (!window.location.pathname.includes("perfil.html")) return;

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Si no hay sesión → redirigir
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  // ----------- Rellenar datos si existen los elementos -----------
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("perfil-nombre", user.nombre || "Usuario");
  setText("perfil-correo", user.email || "correo@ejemplo.com");
  setText("perfil-fecha", user.fechaRegistro || "2025");
  setText("perfil-ultimo-login", user.ultimoLogin || "Hace poco");

  // ----------- Avatar dinámico -----------
  const avatar = document.getElementById("perfil-avatar");
  if (avatar) {
    avatar.textContent = user.nombre?.charAt(0)?.toUpperCase() || "?";
  }
})();

// ---- Ajuste de anclas para header fijo (si el hash posiciona muy abajo) ----
(function fixAnchorOffset() {
  // solo si existe hash en la URL
  if (!window.location.hash) return;

  function scrollToHashAdjusted() {
    const hash = window.location.hash;
    const target = document.querySelector(hash);
    const header = document.querySelector('header');
    if (!target) return;
    const headerHeight = header ? header.offsetHeight : 0;
    const y = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12; // 12px breathing room
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  // Esperar a que el DOM y estilos estén listos
  window.addEventListener('load', () => {
    // pequeño delay para asegurar imágenes y CSS
    setTimeout(scrollToHashAdjusted, 50);
  });

  // también interceptar clicks en enlaces internos para aplicar offset
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 0;
    const y = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
    window.history.pushState(null, '', href); // actualizar hash
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
})();


// ======================
// Checkout page handler
// ======================
(function setupCheckoutPage() {
  if (!window.location.pathname.includes("checkout.html")) return;

  const form = document.getElementById("checkout-form");
  const itemsContainer = document.getElementById("checkout-items");
  const subtotalEl = document.getElementById("checkout-subtotal");
  const shippingEl = document.getElementById("checkout-shipping");
  const totalEl = document.getElementById("checkout-total");
  const btnPay = document.getElementById("btn-pay");
  const btnCancel = document.getElementById("btn-cancel");
  const cardFields = document.getElementById("card-fields");

  // lee carrito usando tus helpers
  const cart = readCartLocal() || [];
  if (!itemsContainer || !subtotalEl || !totalEl) return;

  // mostrar items en resumen
  function renderCheckoutItems() {
    itemsContainer.innerHTML = "";
    if (!cart.length) {
      itemsContainer.innerHTML = '<div class="text-sm text-gray-500 dark:text-gray-400">No hay productos en el carrito.</div>';
      subtotalEl.textContent = "$0";
      totalEl.textContent = "$0";
      return;
    }

    let subtotal = 0;
    cart.forEach(it => {
      const lineTotal = (Number(it.price || 0) * Number(it.qty || 1));
      subtotal += lineTotal;

      const row = document.createElement("div");
      row.className = "flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800";
      row.innerHTML = `
        <div class="flex items-center gap-3">
          <img src="${it.image || '../images/placeholder.png'}" class="w-12 h-12 object-cover rounded-md" alt="${(it.title||'Producto')}">
          <div>
            <div class="font-medium text-gray-800 dark:text-gray-100">${(it.title||'Producto')}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">x${it.qty || 1}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="font-semibold text-gray-800 dark:text-gray-100">${formatPrice(lineTotal)}</div>
        </div>
      `;
      itemsContainer.appendChild(row);
    });

    // shipping (puedes modificar lógica según reglas)
    const shipping = 0;
    subtotalEl.textContent = formatPrice(subtotal);
    shippingEl.textContent = shipping === 0 ? "Gratis" : formatPrice(shipping);
    totalEl.textContent = formatPrice(subtotal + shipping);
  }

  renderCheckoutItems();

  // Mostrar/ocultar campos de tarjeta según método seleccionado
  function updatePaymentFields() {
    const method = form.querySelector('input[name="payment-method"]:checked')?.value;
    if (!cardFields) return;
    if (method === "card") {
      cardFields.style.display = "";
    } else {
      cardFields.style.display = "none";
    }
  }
  // init
  updatePaymentFields();
  form.addEventListener("change", (e) => {
    if (e.target.name === "payment-method") updatePaymentFields();
  });

  // Cancelar vuelve al carrito
  btnCancel?.addEventListener("click", () => {
    window.location.href = "./car.html";
  });

  // Evento pagar (simulado)
  btnPay?.addEventListener("click", async (ev) => {
    ev.preventDefault();

    // Valida campos mínimos
    const name = document.getElementById("billing-name")?.value.trim();
    const phone = document.getElementById("billing-phone")?.value.trim();
    const address = document.getElementById("billing-address")?.value.trim();
    const method = form.querySelector('input[name="payment-method"]:checked')?.value || "card";

    if (!name || !phone || !address) {
      showNotification("Por favor completa nombre, teléfono y dirección.", "info");
      return;
    }

    if (!cart.length) {
      showNotification("Tu carrito está vacío.", "info");
      return;
    }

    // Construir payload
    const products = cart.map(it => ({
      id: it.id,
      title: it.title,
      qty: it.qty || 1,
      price: Number(it.price || 0)
    }));

    const subtotal = products.reduce((s,p) => s + (p.price * p.qty), 0);
    const envio = 0;
    const total = subtotal + envio;

    const usuario = JSON.parse(localStorage.getItem("user") || "null");
    const payload = {
      usuarioId: usuario?.id || null,
      usuarioData: usuario || null,
      billing: { name, phone, address },
      payment: {
        method,
        card: {
          number: document.getElementById("card-number")?.value.replace(/\s+/g,"") || null,
          exp: document.getElementById("card-exp")?.value || null,
          cvc: document.getElementById("card-cvc")?.value || null,
          holder: document.getElementById("card-name")?.value || name
        }
      },
      products,
      subtotal,
      envio,
      total,
      meta: { from: window.location.pathname, ts: Date.now() }
    };

    // Interfaz: bloquear botón mientras procesa
    btnPay.disabled = true;
    btnPay.classList.add("opacity-60", "cursor-not-allowed");
    btnPay.textContent = "Procesando...";

    try {
      // LLamada al backend (ruta de ejemplo). Cambia la URL por la de tu servidor.
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        // Respuesta simulada exitosa
        showNotification("Pago procesado correctamente. Gracias por tu compra.", "success");

        // Opcional: limpiar carrito
        writeCartLocal([]);

        // Redirigir a página de confirmación (puedes crear confirm.html)
        setTimeout(() => {
          window.location.href = "./confirmacion.html?order=" + encodeURIComponent(data.orderId || "simulated-" + Date.now());
        }, 900);
      } else {
        const msg = data?.message || `Error procesando pago (${res.status})`;
        showNotification(msg, "info");
      }

    } catch (err) {
      console.error("Error al comunicarse con el backend:", err);
      showNotification("No se pudo conectar con el servidor de pagos.", "info");
    } finally {
      btnPay.disabled = false;
      btnPay.classList.remove("opacity-60", "cursor-not-allowed");
      btnPay.textContent = "Pagar ahora";
    }
  });

})();
