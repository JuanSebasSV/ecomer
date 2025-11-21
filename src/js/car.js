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