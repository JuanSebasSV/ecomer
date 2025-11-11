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

// ------------------ Script de productos (buscar, filtrar, ordenar, paginar) ------------------
// (NO MODIFICADO visualmente; se dejó tal como lo tenías)
const PRODUCTS = [
  // --- Laptops (10) ---
  {
    id: 'macbook-pro-m3',
    title: 'MacBook Pro M3',
    category: 'laptops',
    price: 2499000,
    image: '../images/m3.png',
    desc: 'Potencia profesional para creativos y desarrolladores',
    rating: 5,
    reviews: 128,
    newestRank: 2,
    badge: 'Top'
  },
  {
    id: 'asus-rog-2025',
    title: 'ASUS ROG Strix 2025',
    category: 'laptops',
    price: 1899000,
    image: '../images/strix.png',
    desc: 'Rendimiento gaming con refrigeración avanzada',
    rating: 4.5,
    reviews: 64,
    newestRank: 5,
    badge: 'Oferta'
  },
  {
    id: 'dell-xps-15',
    title: 'Dell XPS 15',
    category: 'laptops',
    price: 2199000,
    image: '../images/xps.png',
    desc: 'Diseño compacto y pantalla 4K para creadores',
    rating: 4.7,
    reviews: 102,
    newestRank: 3
  },
  {
    id: 'hp-omen-16',
    title: 'HP Omen 16',
    category: 'laptops',
    price: 1599000,
    image: '../images/omen.png',
    desc: 'Balance entre potencia y precio para gamers',
    rating: 4.3,
    reviews: 48,
    newestRank: 6
  },
  {
    id: 'lenovo-legion-7',
    title: 'Lenovo Legion 7',
    category: 'laptops',
    price: 1999000,
    image: '..//images/legion.png',
    desc: 'Alto rendimiento con GPU dedicada',
    rating: 4.6,
    reviews: 77,
    newestRank: 4,
    badge: 'Nuevo'
  },
  {
    id: 'acer-swift-5',
    title: 'Acer Swift 5',
    category: 'laptops',
    price: 1299000,
    image: '../images/swift.png',
    desc: 'Ultraportátil y buena autonomía',
    rating: 4.1,
    reviews: 39,
    newestRank: 8
  },
  {
    id: 'rog-flow-x13',
    title: 'ROG Flow X13',
    category: 'laptops',
    price: 1799000,
    image: '../images/flow.png',
    desc: 'Compacta convertible con GPU externa opcional',
    rating: 4.4,
    reviews: 21,
    newestRank: 7
  },
  {
    id: 'microsoft-surface-pro',
    title: 'Surface Laptop Studio',
    category: 'laptops',
    price: 2299000,
    image: '../images/studio.png',
    desc: 'Convertible para creativos y productividad',
    rating: 4.5,
    reviews: 58,
    newestRank: 9
  },
  {
    id: 'gigabyte-aero-15',
    title: 'Gigabyte Aero 15',
    category: 'laptops',
    price: 2099000,
    image: '../images/aero.png',
    desc: 'Pantalla con alta fidelidad de color',
    rating: 4.2,
    reviews: 33,
    newestRank: 10
  },
  {
    id: 'xiaomi-redmibook',
    title: 'Xiaomi RedmiBook Pro',
    category: 'laptops',
    price: 1099000,
    image: '../images/redmibook.png',
    desc: 'Buena relación precio-rendimiento para estudiantes',
    rating: 4.0,
    reviews: 86,
    newestRank: 11
  },

  // --- Celulares (10) ---
  {
    id: 'iphone-15-pro',
    title: 'iPhone 15 Pro',
    category: 'celulares',
    price: 1199000,
    image: '../images/15pro.png',
    desc: 'El smartphone más avanzado con chip A17 Pro',
    rating: 5,
    reviews: 89,
    newestRank: 1,
    badge: 'Top'
  },
  {
    id: 'samsung-galaxy-s24',
    title: 'Samsung Galaxy S24',
    category: 'celulares',
    price: 999000,
    image: '../images/s24.png',
    desc: 'Cámaras mejoradas y pantalla brillante',
    rating: 4.6,
    reviews: 210,
    newestRank: 2
  },
  {
    id: 'google-pixel-8',
    title: 'Google Pixel 8',
    category: 'celulares',
    price: 849000,
    image: '../images/pixel8.png',
    desc: 'Fotografía computacional y Android puro',
    rating: 4.4,
    reviews: 71,
    newestRank: 3,
    badge: 'Nuevo'
  },
  {
    id: 'oneplus-12',
    title: 'OnePlus 12',
    category: 'celulares',
    price: 799000,
    image: '../images/oneplus12.png',
    desc: 'Fluidez y carga rápida de primera',
    rating: 4.3,
    reviews: 52,
    newestRank: 6
  },
  {
    id: 'xiaomi-13-pro',
    title: 'Xiaomi 13 Pro',
    category: 'celulares',
    price: 699000,
    image: '../images/xiaomi13.png',
    desc: 'Gran cámara y batería duradera',
    rating: 4.2,
    reviews: 43,
    newestRank: 8
  },
  {
    id: 'motorola-edge',
    title: 'Motorola Edge 40',
    category: 'celulares',
    price: 459000,
    image: '../images/edge40.png',
    desc: 'Pantalla curva y buena autonomía',
    rating: 4.0,
    reviews: 27,
    newestRank: 9
  },
  {
    id: 'sony-xperia-1',
    title: 'Sony Xperia 1 IV',
    category: 'celulares',
    price: 899000,
    image: '../images/xperia.png',
    desc: 'Enfoque en multimedia y audio de alta calidad',
    rating: 4.1,
    reviews: 31,
    newestRank: 7
  },
  {
    id: 'oppo-find-x6',
    title: 'OPPO Find X6',
    category: 'celulares',
    price: 749000,
    image: '../images/findx6.png',
    desc: 'Carga ultrarrápida y cámara versátil',
    rating: 4.2,
    reviews: 22,
    newestRank: 11
  },
  {
    id: 'poco-f5',
    title: 'POCO F5',
    category: 'celulares',
    price: 399000,
    image: '../images/f5.jpg',
    desc: 'Rendimiento sólido a precio asequible',
    rating: 3.9,
    reviews: 19,
    newestRank: 12,
    badge: 'Oferta'
  },
  {
    id: 'asus-zenfone-10',
    title: 'ASUS Zenfone 10',
    category: 'celulares',
    price: 529000,
    image: '../images/zenfone.png',
    desc: 'Compacto y potente para uso diario',
    rating: 4.0,
    reviews: 12,
    newestRank: 13
  },

  // --- Componentes PC (10) ---
  {
    id: 'rtx-4070-super',
    title: 'RTX 4070 Super',
    category: 'componentes',
    price: 599000,
    image: '../images/4070super.png',
    desc: 'Tarjeta gráfica de nueva generación para gaming',
    rating: 5,
    reviews: 156,
    newestRank: 3
  },
  {
    id: 'ryzen-9-7950x',
    title: 'AMD Ryzen 9 7950X',
    category: 'componentes',
    price: 2890000,
    image: '../images/7950x.png',
    desc: 'CPU de alto rendimiento para estaciones de trabajo',
    rating: 5,
    reviews: 44,
    newestRank: 1,
    badge: 'Top'
  },
  {
    id: 'intel-i9-13900k',
    title: 'Intel Core i9-13900K',
    category: 'componentes',
    price: 2599000,
    image: '../images/13900k.png',
    desc: 'Máximo rendimiento single-thread y multi-thread',
    rating: 4.9,
    reviews: 61,
    newestRank: 2
  },
  {
    id: 'msi-b650-motherboard',
    title: 'MSI B650 Motherboard',
    category: 'componentes',
    price: 749000,
    image: '../images/b650.png',
    desc: 'Placa base con características modernas y PCIe 5.0',
    rating: 4.2,
    reviews: 18,
    newestRank: 6
  },
  {
    id: 'corsair-32gb-ddr5',
    title: 'Corsair Vengeance 32GB DDR5',
    category: 'componentes',
    price: 499000,
    image: '../images/vengeance.png',
    desc: 'Memoria DDR5 para rendimiento extremo',
    rating: 4.6,
    reviews: 29,
    newestRank: 7
  },
  {
    id: 'samsung-980-pro-2tb',
    title: 'Samsung 980 PRO 2TB',
    category: 'componentes',
    price: 850000,
    image: '../images/980pro.png',
    desc: 'SSD NVMe de alta velocidad para cargas pesadas',
    rating: 4.8,
    reviews: 98,
    newestRank: 4,
    badge: 'Oferta'
  },
  {
    id: 'cooler-master-240',
    title: 'Cooler Master Liquid 240',
    category: 'componentes',
    price: 269000,
    image: '../images/masterliquid.png',
    desc: 'Refrigeración líquida AIO para CPUs potentes',
    rating: 4.3,
    reviews: 14,
    newestRank: 8
  },
  {
    id: 'seagate-4tb-hdd',
    title: 'Seagate BarraCuda 4TB',
    category: 'componentes',
    price: 299000,
    image: '../images/barracuda.png',
    desc: 'Almacenamiento masivo para archivos y backups',
    rating: 4.0,
    reviews: 52,
    newestRank: 9
  },
  {
    id: 'asus-tuf-rtx-4060',
    title: 'ASUS TUF RTX 4060',
    category: 'componentes',
    price: 399000,
    image: '../images/4060.png',
    desc: 'Tarjeta gráfica para gaming 1080p con eficiencia',
    rating: 4.1,
    reviews: 27,
    newestRank: 10
  },
  {
    id: 'evga-psu-850w',
    title: 'EVGA SuperNOVA 850W',
    category: 'componentes',
    price: 279000,
    image: '../images/850w.png',
    desc: 'Fuente de poder modular, certificación 80+ Gold',
    rating: 4.4,
    reviews: 23,
    newestRank: 11
  },

  // --- Accesorios (10) ---
  {
    id: 'silla-gaming',
    title: 'Silla Gaming Pro',
    category: 'accesorios',
    price: 890000,
    image: '../images/sillapro.png',
    desc: 'Ergonómica, LED RGB',
    rating: 5,
    reviews: 45,
    newestRank: 5
  },
  {
    id: 'audifonos-usb',
    title: 'Audífonos USB Pro',
    category: 'accesorios',
    price: 45000,
    image: '../images/audifonos-usb.png',
    desc: 'Sonido claro y micrófono integrado',
    rating: 4.0,
    reviews: 37,
    newestRank: 12
  },
  {
    id: 'logitech-mx-master-3',
    title: 'Logitech MX Master 3',
    category: 'accesorios',
    price: 289000,
    image: '../images/logitech.png',
    desc: 'Mouse ergonómico para productividad',
    rating: 4.7,
    reviews: 154,
    newestRank: 2,
    badge: 'Top'
  },
  {
    id: 'anker-powerbank-20000',
    title: 'Anker PowerBank 20,000mAh',
    category: 'accesorios',
    price: 129000,
    image: '../images/powerbank.png',
    desc: 'Carga rápida y capacidad para viajes',
    rating: 4.5,
    reviews: 88,
    newestRank: 4
  },
  {
    id: 'anker-cable-usbc',
    title: 'Cable USB-C 100W',
    category: 'accesorios',
    price: 29900,
    image: '../images/100w.png',
    desc: 'Carga y datos a alta velocidad',
    rating: 4.3,
    reviews: 26,
    newestRank: 6
  },
  {
    id: 'elgato-cam-link',
    title: 'Elgato Cam Link 4K',
    category: 'accesorios',
    price: 319000,
    image: '../images/elgato.png',
    desc: 'Captura profesional para streaming',
    rating: 4.6,
    reviews: 40,
    newestRank: 7,
    badge: 'Nuevo'
  },
  {
    id: 'steelseries-arctis',
    title: 'SteelSeries Arctis 7',
    category: 'accesorios',
    price: 349000,
    image: '../images/arctis.png',
    desc: 'Auriculares inalámbricos para gaming',
    rating: 4.4,
    reviews: 65,
    newestRank: 8
  },
  {
    id: 'razer-tank-mousepad',
    title: 'Razer Goliathus Mousepad',
    category: 'accesorios',
    price: 59000,
    image: '../images/mousepad.png',
    desc: 'Base para mouse con gran control',
    rating: 4.1,
    reviews: 18,
    newestRank: 9
  },
  {
    id: 'wd-my-passport-2tb',
    title: 'WD My Passport 2TB',
    category: 'accesorios',
    price: 239000,
    image: '../images/passport.png',
    desc: 'Disco externo portátil y seguro',
    rating: 4.2,
    reviews: 27,
    newestRank: 10
  },
  {
    id: 'usb-hub-7-port',
    title: 'Hub USB 7 puertos',
    category: 'accesorios',
    price: 69000,
    image: '../images/multihub.png',
    desc: 'Expande tus puertos USB rápidamente',
    rating: 3.9,
    reviews: 9,
    newestRank: 11
  }
];

// === Exponer globalmente la lista de productos para car.html (solicitado) ===
window.PRODUCTS = PRODUCTS;


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

// Render paginación (sin cambios lógicos, solo se usa si hay filtro)
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


// ---------- LÓGICA y RENDEREO para car.html (moved from car.html) ----------
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
