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

document.addEventListener('DOMContentLoaded', () => {
  // === MODO OSCURO ===

  const themeToggleBtn = document.getElementById('theme-toggle');
  const lightIcon = document.getElementById('theme-toggle-light-icon');
  const darkIcon = document.getElementById('theme-toggle-dark-icon');

  if (!themeToggleBtn) {
    console.error("⚠️ No se encontró el botón #theme-toggle");
    return;
  }

  // Verificar tema guardado
  if (
    localStorage.getItem('theme') === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.classList.add('dark');
    darkIcon.classList.remove('hidden');
    lightIcon.classList.add('hidden');
  } else {
    document.documentElement.classList.remove('dark');
    lightIcon.classList.remove('hidden');
    darkIcon.classList.add('hidden');
  }

  // Evento de clic
  themeToggleBtn.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    lightIcon.classList.toggle('hidden', isDark);
    darkIcon.classList.toggle('hidden', !isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
})


// Script de productos (buscar, filtrar, ordenar, paginar)
const PRODUCTS = [
  {
    id: 'macbook-pro-m3',
    title: 'MacBook Pro M3',
    category: 'laptops',
    price: 2499000,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    desc: 'Potencia profesional para creativos y desarrolladores',
    rating: 5,
    reviews: 128,
    newestRank: 2
  },
  {
    id: 'iphone-15-pro',
    title: 'iPhone 15 Pro',
    category: 'celulares',
    price: 1199000,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
    desc: 'El smartphone más avanzado con chip A17 Pro',
    rating: 5,
    reviews: 89,
    newestRank: 1
  },
  {
    id: 'rtx-4070-super',
    title: 'RTX 4070 Super',
    category: 'componentes',
    price: 599000,
    image: 'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=800',
    desc: 'Tarjeta gráfica de nueva generación para gaming',
    rating: 5,
    reviews: 156,
    newestRank: 3
  },
  {
    id: 'silla-gaming',
    title: 'Silla Gaming Pro',
    category: 'accesorios',
    price: 890000,
    image: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800',
    desc: 'Ergonómica, LED RGB',
    rating: 5,
    reviews: 45,
    newestRank: 5
  }
];

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

// Render de tarjetas
function createProductCard(p) {
  const wrapper = document.createElement('div');
  wrapper.className = 'bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 product-card';
  wrapper.setAttribute('data-category', p.category);
  wrapper.setAttribute('data-price', p.price);
  wrapper.setAttribute('data-product-id', p.id);

  wrapper.innerHTML = `
    <div class="bg-gradient-to-br from-gray-100 to-gray-200 h-48 flex items-center justify-center relative overflow-hidden">
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

// Render principal
function render() {
  if (!grid) return; // seguridad si no existe el contenedor
  const all = getFilteredProducts();
  const total = all.length;
  const start = (state.page - 1) * state.perPage;
  const end = start + state.perPage;
  const pageItems = all.slice(start, end);

  grid.innerHTML = '';
  if (pageItems.length === 0) {
    grid.innerHTML = '<div class="col-span-1 text-center text-gray-500">No se encontraron productos.</div>';
  } else {
    pageItems.forEach(p => grid.appendChild(createProductCard(p)));
  }

  renderPagination(Math.ceil(total / state.perPage), state.page);
}

// Render paginación
function renderPagination(totalPages, current) {
  if (!pagination) return;
  pagination.innerHTML = '';
  if (totalPages <= 1) return;

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

// Delegación: botones de "Ver Detalles" y "Comprar"
document.addEventListener('click', e => {
  const addBtn = e.target.closest('.add-to-cart-btn');
  if (addBtn) {
    const title = addBtn.dataset.product;
    alert('Añadido al carrito: ' + title);
  }
  const detailsBtn = e.target.closest('.ver-detalles-btn');
  if (detailsBtn) {
    const pid = detailsBtn.dataset.productId;
    alert('Mostrar detalles de: ' + pid);
  }
});

// Inicializar render al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  if (grid) render();
  console.log('✅ Script de productos inicializado correctamente');
});
