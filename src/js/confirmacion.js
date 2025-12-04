// confirmacion.js
// PÁGINA DE CONFIRMACIÓN DE PEDIDO - VERSIÓN CORREGIDA CON IMÁGENES

(function initConfirmacion() {
  const API_BASE = "http://localhost:8081/api/checkout";

  // Elementos del DOM
  const loadingState = document.getElementById("loading-state");
  const confirmationContent = document.getElementById("confirmation-content");
  const errorState = document.getElementById("error-state");

  // =====================================================
  //  FUNCIÓN HELPER PARA NORMALIZAR RUTAS DE IMAGEN
  // =====================================================
  function normalizeImagePath(imagePath) {
    console.log('🖼️ Ruta original recibida:', imagePath);
    
    if (!imagePath) {
      console.log('⚠️ No hay imagen, usando placeholder');
      return '../images/placeholder.png';
    }
    
    // Si ya es una URL completa, devolverla tal cual
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      console.log('✅ URL completa detectada');
      return imagePath;
    }
    
    // Si es una ruta relativa que empieza con ../ o ./, devolverla tal cual
    if (imagePath.startsWith('../') || imagePath.startsWith('./')) {
      console.log('✅ Ruta relativa correcta detectada');
      return imagePath;
    }
    
    // Si empieza con src/, necesita retroceder un nivel más
    if (imagePath.startsWith('src/')) {
      const normalizedPath = '../' + imagePath;
      console.log('🔧 Convertida de src/ a:', normalizedPath);
      return normalizedPath;
    }
    
    // Si es solo el nombre del archivo o empieza con images/, normalizarla
    if (imagePath.startsWith('images/')) {
      const normalizedPath = '../' + imagePath;
      console.log('🔧 Agregado ../ a images/:', normalizedPath);
      return normalizedPath;
    }
    
    // Si es solo el nombre del archivo, agregar la ruta completa
    if (!imagePath.includes('/')) {
      const normalizedPath = '../images/' + imagePath;
      console.log('🔧 Nombre de archivo solo, ruta completa:', normalizedPath);
      return normalizedPath;
    }
    
    // Por defecto, asumir que necesita ../ al inicio
    const normalizedPath = '../' + imagePath;
    console.log('🔧 Caso por defecto, agregado ../:', normalizedPath);
    return normalizedPath;
  }

  // =====================================================
  //  OBTENER ORDER ID DE LA URL
  // =====================================================
  function getOrderIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('order');
  }

  // =====================================================
  //  FORMATEAR PRECIO
  // =====================================================
  function formatPrice(n) {
    return '$' + Number(n || 0).toLocaleString('es-CO');
  }

  // =====================================================
  //  FORMATEAR FECHA
  // =====================================================
  function formatDate(dateString) {
    const fecha = new Date(dateString);
    return fecha.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // =====================================================
  //  CARGAR DETALLES DEL PEDIDO
  // =====================================================
  async function cargarDetallesPedido(orderId) {
    try {
      console.log(`📡 Cargando detalles del pedido: ${orderId}`);
      
      const response = await fetch(`${API_BASE}/order/${orderId}`);
      const result = await response.json();

      if (loadingState) loadingState.classList.add("hidden");

      if (!response.ok) {
        throw new Error(result.message || "Error al cargar el pedido");
      }

      const orden = result.data;

      if (!orden) {
        throw new Error("No se encontró el pedido");
      }

      console.log("✅ Pedido cargado:", orden);

      // Mostrar contenido de confirmación
      if (confirmationContent) {
        confirmationContent.classList.remove("hidden");
        renderizarDetalles(orden);
      }

    } catch (error) {
      console.error("❌ Error al cargar pedido:", error);
      if (loadingState) loadingState.classList.add("hidden");
      if (errorState) errorState.classList.remove("hidden");
      
      if (window.showNotification) {
        window.showNotification("Error al cargar los detalles del pedido", "error");
      }
    }
  }

  // =====================================================
  //  RENDERIZAR DETALLES DEL PEDIDO
  // =====================================================
  function renderizarDetalles(orden) {
    // Order ID
    const orderIdEl = document.getElementById("order-id");
    if (orderIdEl) orderIdEl.textContent = orden.orderId;

    // Fecha
    const orderDateEl = document.getElementById("order-date");
    if (orderDateEl) orderDateEl.textContent = formatDate(orden.createdAt);

    // Productos con carrusel
    const productsContainer = document.getElementById("order-products");
    if (productsContainer) {
      let html = '';
      
      // Si hay múltiples productos, mostrar carrusel
      if (orden.products.length > 1) {
        html += '<div class="relative mb-4">';
        html += '<div class="overflow-hidden rounded-lg">';
        html += '<div id="carousel-confirm" class="flex transition-transform duration-300 ease-in-out gap-3">';
        
        orden.products.forEach((p, idx) => {
          html += '<div class="flex-shrink-0 w-32 h-32 relative group">';
          
          // CRÍTICO: Normalizar la ruta de la imagen antes de usarla
          const normalizedImage = normalizeImagePath(p.image);
          console.log(`📸 Producto ${idx}: ${p.title}`);
          console.log(`   - Imagen original: "${p.image}"`);
          console.log(`   - Imagen normalizada: "${normalizedImage}"`);
          
          html += `<img src="${normalizedImage}" class="w-full h-full object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 group-hover:border-blue-500 transition-all cursor-pointer" alt="${p.title}" onerror="this.src='../images/placeholder.png'" onclick="showProductDetailConfirm(${idx})">`;
          html += '<div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg"></div>';
          html += `<div class="absolute bottom-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">×${p.qty}</div>`;
          html += '</div>';
        });
        
        html += '</div></div>';
        
        // Botones de navegación si hay más de 4 productos
        if (orden.products.length > 4) {
          html += '<button onclick="scrollCarouselConfirm(-1)" class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all z-10 border border-gray-200 dark:border-gray-600" aria-label="Anterior">';
          html += '<svg class="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">';
          html += '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg></button>';
          
          html += '<button onclick="scrollCarouselConfirm(1)" class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all z-10 border border-gray-200 dark:border-gray-600" aria-label="Siguiente">';
          html += '<svg class="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">';
          html += '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg></button>';
        }
        
        html += '</div>';
      } else {
        // Un solo producto - imagen grande
        const normalizedImage = normalizeImagePath(orden.products[0].image);
        console.log(`📸 Producto único: ${orden.products[0].title}`);
        console.log(`   - Imagen original: "${orden.products[0].image}"`);
        console.log(`   - Imagen normalizada: "${normalizedImage}"`);
        
        html += '<div class="mb-4">';
        html += `<img src="${normalizedImage}" class="w-full h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700" alt="${orden.products[0].title}" onerror="this.src='../images/placeholder.png'">`;
        html += '</div>';
      }
      
      // Lista de productos
      html += '<div class="space-y-3">';
      orden.products.forEach(p => {
        html += '<div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all">';
        html += '<div class="flex-1">';
        html += `<div class="font-medium text-gray-800 dark:text-gray-100">${p.title}</div>`;
        html += `<div class="text-sm text-gray-600 dark:text-gray-400">Cantidad: ${p.qty} × ${formatPrice(p.price)}</div>`;
        html += '</div>';
        html += `<div class="font-bold text-gray-800 dark:text-gray-100">${formatPrice(p.price * p.qty)}</div>`;
        html += '</div>';
      });
      html += '</div>';
      
      productsContainer.innerHTML = html;
    }
    
    // Guardar orden globalmente para funciones
    window.currentOrder = orden;

    // Información de envío
    const shippingInfo = document.getElementById("shipping-info");
    if (shippingInfo) {
      let html = `<p><strong class="text-gray-900 dark:text-gray-100">${orden.billing.name}</strong></p>`;
      html += `<p>${orden.billing.address}</p>`;
      if (orden.billing.city) {
        html += `<p>${orden.billing.city}`;
        if (orden.billing.department) html += `, ${orden.billing.department}`;
        html += '</p>';
      }
      html += `<p>Tel: ${orden.billing.phone}</p>`;
      shippingInfo.innerHTML = html;
    }

    // Método de pago
    const paymentInfo = document.getElementById("payment-info");
    if (paymentInfo) {
      const paymentMethodLabels = {
        card: "Tarjeta de Crédito/Débito",
        cash: "Efectivo",
        transfer: "Transferencia",
        pse: "PSE",
        other: "Nequi / Daviplata"
      };

      const paymentStatusLabels = {
        pending: "Pendiente",
        approved: "Aprobado",
        rejected: "Rechazado",
        refunded: "Reembolsado"
      };

      const statusColor = orden.payment.status === 'approved' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400';

      let html = `<p><strong class="text-gray-900 dark:text-gray-100">${paymentMethodLabels[orden.payment.method] || orden.payment.method}</strong></p>`;
      if (orden.payment.card?.lastFour) {
        html += `<p>**** **** **** ${orden.payment.card.lastFour}</p>`;
      }
      if (orden.payment.card?.brand) {
        html += `<p>${orden.payment.card.brand}</p>`;
      }
      html += `<p class="mt-2">Estado: <span class="font-semibold ${statusColor}">${paymentStatusLabels[orden.payment.status] || orden.payment.status}</span></p>`;
      
      paymentInfo.innerHTML = html;
    }

    // Resumen de precios
    const subtotalEl = document.getElementById("order-subtotal");
    const shippingEl = document.getElementById("order-shipping");
    const totalEl = document.getElementById("order-total");

    if (subtotalEl) subtotalEl.textContent = formatPrice(orden.subtotal);
    if (shippingEl) shippingEl.textContent = orden.envio === 0 ? 'Gratis' : formatPrice(orden.envio);
    if (totalEl) totalEl.textContent = formatPrice(orden.total);
  }

  // =====================================================
  //  FUNCIONES GLOBALES
  // =====================================================
  
  // Scroll del carrusel
  window.scrollCarouselConfirm = function(direction) {
    const carousel = document.getElementById('carousel-confirm');
    if (!carousel) return;
    
    const scrollAmount = 140;
    carousel.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth'
    });
  };

  // Modal de detalle de producto
  window.showProductDetailConfirm = function(productIndex) {
    if (!window.currentOrder || !window.currentOrder.products[productIndex]) return;
    
    const product = window.currentOrder.products[productIndex];
    
    // CRÍTICO: Normalizar la imagen antes de mostrarla en el modal
    const normalizedImage = normalizeImagePath(product.image);
    console.log(`🔍 Modal - Producto: ${product.title}`);
    console.log(`   - Imagen original: "${product.image}"`);
    console.log(`   - Imagen normalizada: "${normalizedImage}"`);
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4';
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
    
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl';
    modalContent.innerHTML = `
      <div class="p-6">
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Detalle del Producto</h3>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="mb-6">
          <img 
            src="${normalizedImage}" 
            alt="${product.title}"
            class="w-full h-80 object-cover rounded-lg"
            onerror="this.src='../images/placeholder.png'"
          >
        </div>
        
        <div class="space-y-4">
          <div>
            <h4 class="text-xl font-semibold text-gray-900 dark:text-gray-100">${product.title}</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">ID: ${product.productId}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Precio Unitario</p>
              <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">${formatPrice(product.price)}</p>
            </div>
            <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Cantidad</p>
              <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">${product.qty} unidad${product.qty > 1 ? 'es' : ''}</p>
            </div>
          </div>
          
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
            <p class="text-3xl font-bold text-green-600 dark:text-green-400">${formatPrice(product.price * product.qty)}</p>
          </div>
        </div>
        
        <button 
          onclick="this.closest('.fixed').remove()"
          class="w-full mt-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold"
        >
          Cerrar
        </button>
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  };

  // =====================================================
  //  INICIALIZAR
  // =====================================================
  const orderId = getOrderIdFromUrl();

  if (!orderId) {
    if (loadingState) loadingState.classList.add("hidden");
    if (errorState) errorState.classList.remove("hidden");
    console.error("❌ No se proporcionó un ID de pedido");
    return;
  }

  console.log(`🚀 Inicializando confirmación para pedido: ${orderId}`);

  // Cargar detalles del pedido
  cargarDetallesPedido(orderId);

})();