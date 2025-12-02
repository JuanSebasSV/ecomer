// ecomer/src/js/pedidos.js
// PÁGINA DE PEDIDOS DEL USUARIO

(function initPedidos() {
  const API_BASE = "http://localhost:8081/api/checkout";

  // Elementos del DOM
  const loadingState = document.getElementById("loading-state");
  const noSession = document.getElementById("no-session");
  const noOrders = document.getElementById("no-orders");
  const ordersContainer = document.getElementById("orders-container");

  // =====================================================
  //  VERIFICAR SESIÓN
  // =====================================================
  const user = JSON.parse(localStorage.getItem("user") || "null");

  console.log("👤 Usuario desde localStorage:", user);

  if (!user) {
    if (loadingState) loadingState.classList.add("hidden");
    if (noSession) noSession.classList.remove("hidden");
    return;
  }

  // IMPORTANTE: Usar el userId personalizado, NO el _id de MongoDB
  const userId = user.userId || user.id;
  
  console.log("🔑 UserId que se usará para buscar órdenes:", userId);

  if (!userId) {
    console.error("❌ No se encontró userId en el objeto user");
    if (loadingState) loadingState.classList.add("hidden");
    if (noSession) noSession.classList.remove("hidden");
    return;
  }

  // =====================================================
  //  CARGAR PEDIDOS DEL USUARIO
  // =====================================================
  async function cargarPedidos() {
    try {
      console.log(`📡 Haciendo petición a: ${API_BASE}/user/${userId}`);
      
      const response = await fetch(`${API_BASE}/user/${userId}`);
      const result = await response.json();

      console.log("📦 Respuesta del servidor:", result);

      if (loadingState) loadingState.classList.add("hidden");

      if (!response.ok) {
        throw new Error(result.message || "Error al cargar pedidos");
      }

      const ordenes = result.data || [];

      console.log(`✅ ${ordenes.length} órdenes recibidas`);

      if (ordenes.length === 0) {
        if (noOrders) noOrders.classList.remove("hidden");
        return;
      }

      // Renderizar pedidos
      if (ordersContainer) {
        ordersContainer.classList.remove("hidden");
        renderizarPedidos(ordenes);
      }

    } catch (error) {
      console.error("❌ Error al cargar pedidos:", error);
      if (loadingState) loadingState.classList.add("hidden");
      if (noOrders) noOrders.classList.remove("hidden");
      
      if (window.showNotification) {
        window.showNotification("Error al cargar los pedidos", "error");
      }
    }
  }

  // =====================================================
  //  RENDERIZAR PEDIDOS
  // =====================================================
  function renderizarPedidos(ordenes) {
    ordersContainer.innerHTML = "";
    
    // Guardar órdenes globalmente para acceso desde funciones
    window.currentOrders = ordenes;

    ordenes.forEach(orden => {
      const card = crearTarjetaPedido(orden);
      ordersContainer.appendChild(card);
    });
  }

  // =====================================================
  //  CREAR TARJETA DE PEDIDO
  // =====================================================
  function crearTarjetaPedido(orden) {
    const card = document.createElement("div");
    card.className = "bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition";

    // Determinar color del estado
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    };

    const statusLabels = {
      pending: "Pendiente",
      processing: "En proceso",
      shipped: "Enviado",
      delivered: "Entregado",
      cancelled: "Cancelado"
    };

    const paymentStatusLabels = {
      pending: "Pendiente",
      approved: "Aprobado",
      rejected: "Rechazado",
      refunded: "Reembolsado"
    };

    const paymentMethodLabels = {
      card: "Tarjeta",
      cash: "Efectivo",
      transfer: "Transferencia",
      pse: "PSE",
      other: "Nequi / Daviplata"
    };

    // Formatear fecha
    const fecha = new Date(orden.createdAt);
    const fechaFormateada = fecha.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    card.innerHTML = `
      <!-- Header del pedido -->
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 p-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Pedido ${orden.orderId}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${fechaFormateada}</p>
          </div>
          <div class="flex gap-2">
            <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusColors[orden.status] || statusColors.pending}">
              ${statusLabels[orden.status] || orden.status}
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-semibold ${orden.payment.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}">
              Pago: ${paymentStatusLabels[orden.payment.status] || orden.payment.status}
            </span>
          </div>
        </div>
      </div>

      <!-- Contenido del pedido -->
      <div class="p-6">
        
        <!-- Productos con Carrusel de Imágenes -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Productos (${orden.products.length})
          </h4>
          
          ${orden.products.length > 1 ? `
            <!-- Carrusel de imágenes para múltiples productos -->
            <div class="relative mb-4">
              <div class="overflow-x-auto">
                <div id="carousel-${orden.orderId}" class="flex gap-2 pb-2">
                  ${orden.products.map((p, idx) => `
                    <div class="flex-shrink-0 w-20 h-20 relative group cursor-pointer" onclick="showProductDetail('${orden.orderId}', ${idx})">
                      <img 
                        src="${p.image}" 
                        class="w-full h-full object-cover rounded-md border border-gray-300 dark:border-gray-600 group-hover:border-blue-500 transition-all shadow-sm" 
                        alt="${p.title}" 
                        onerror="this.onerror=null; this.src='https://via.placeholder.com/80?text=Sin+Imagen'"
                        title="${p.title}"
                      >
                      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-md"></div>
                      <div class="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-tl-md rounded-br-md font-bold">
                        ${p.qty}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : `
            <!-- Una sola imagen pequeña para un producto -->
            <div class="mb-4 inline-block">
              <div class="w-20 h-20 relative">
                <img 
                  src="${orden.products[0].image}" 
                  class="w-full h-full object-cover rounded-md border border-gray-300 dark:border-gray-600 shadow-sm" 
                  alt="${orden.products[0].title}"
                  onerror="this.onerror=null; this.src='https://via.placeholder.com/80?text=Sin+Imagen'"
                >
              </div>
            </div>
          `}
          
          <!-- Lista de productos con detalles -->
          <div class="space-y-3">
            ${orden.products.map(p => `
              <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all">
                <div class="flex-1">
                  <div class="font-medium text-gray-800 dark:text-gray-100">${p.title}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    Cantidad: ${p.qty} × ${formatPrice(p.price)}
                  </div>
                </div>
                <div class="font-bold text-gray-800 dark:text-gray-100">
                  ${formatPrice(p.price * p.qty)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Información de envío -->
        <div class="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Dirección de Entrega
          </h4>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            <strong>${orden.billing.name}</strong><br>
            ${orden.billing.address}<br>
            Tel: ${orden.billing.phone}
          </p>
        </div>

        <!-- Método de pago -->
        <div class="mb-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Método de Pago
          </h4>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            ${paymentMethodLabels[orden.payment.method] || orden.payment.method}
            ${orden.payment.card?.lastFour ? ` - **** ${orden.payment.card.lastFour}` : ''}
            ${orden.payment.card?.brand ? ` (${orden.payment.card.brand})` : ''}
          </p>
        </div>

        <!-- Resumen de precios -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div class="flex justify-between text-sm mb-2">
            <span class="text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span class="text-gray-900 dark:text-gray-100">${formatPrice(orden.subtotal)}</span>
          </div>
          <div class="flex justify-between text-sm mb-2">
            <span class="text-gray-600 dark:text-gray-400">Envío:</span>
            <span class="text-gray-900 dark:text-gray-100">${orden.envio === 0 ? 'Gratis' : formatPrice(orden.envio)}</span>
          </div>
          <div class="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
            <span class="text-gray-900 dark:text-gray-100">Total:</span>
            <span class="text-blue-600 dark:text-blue-400">${formatPrice(orden.total)}</span>
          </div>
        </div>

        <!-- Acciones -->
        <div class="mt-6 flex gap-3">
          <button onclick="verDetallesPedido('${orden.orderId}')" class="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
            Ver detalles completos
          </button>
          ${orden.status === 'pending' ? `
            <button onclick="cancelarPedido('${orden.orderId}')" class="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium">
              Cancelar
            </button>
          ` : ''}
        </div>
      </div>
    `;

    return card;
  }

  // =====================================================
  //  FUNCIONES AUXILIARES
  // =====================================================
  function formatPrice(n) {
    return '$' + Number(n || 0).toLocaleString('es-CO');
  }

  // =====================================================
  //  FUNCIONES GLOBALES PARA INTERACCIÓN
  // =====================================================

  // Mostrar detalle del producto en modal
  window.showProductDetail = function(orderId, productIndex) {
    const orden = window.currentOrders?.find(o => o.orderId === orderId);
    if (!orden || !orden.products[productIndex]) return;
    
    const product = orden.products[productIndex];
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4';
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
    
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
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
              src="${product.image || '../images/placeholder.png'}" 
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
      </div>
    `;
    
    document.body.appendChild(modal);
  };
  
  // Ver detalles del pedido
  window.verDetallesPedido = function(orderId) {
    window.location.href = `./confirmacion.html?order=${encodeURIComponent(orderId)}`;
  };

  // Cancelar pedido
  window.cancelarPedido = async function(orderId) {
    if (!confirm('¿Estás seguro de que deseas cancelar este pedido?')) return;

    try {
      const response = await fetch(`${API_BASE}/order/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (response.ok) {
        if (window.showNotification) {
          window.showNotification("Pedido cancelado correctamente", "success");
        }
        setTimeout(() => location.reload(), 1000);
      } else {
        throw new Error("Error al cancelar el pedido");
      }
    } catch (error) {
      console.error("Error:", error);
      if (window.showNotification) {
        window.showNotification("No se pudo cancelar el pedido", "error");
      }
    }
  };

  // INICIALIZAR
  cargarPedidos();

})();