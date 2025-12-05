(function setupCheckoutPage() {
  // Solo ejecutar si estamos en la página de checkout
  if (!window.location.pathname.includes("checkout.html")) return;

  //  ELEMENTOS DEL DOM
  const form = document.getElementById("checkout-form");
  const itemsContainer = document.getElementById("checkout-items");
  const subtotalEl = document.getElementById("checkout-subtotal");
  const shippingEl = document.getElementById("checkout-shipping");
  const totalEl = document.getElementById("checkout-total");
  const btnPay = document.getElementById("btn-pay");
  const btnCancel = document.getElementById("btn-cancel");
  const cardFields = document.getElementById("card-fields");

  // Elementos de ubicación
  const departmentSelect = document.getElementById("billing-department");
  const citySelect = document.getElementById("billing-city");

  //  INICIALIZAR SELECTS DE UBICACIÓN
  function initializeLocationSelects() {
    // Verificar que COLOMBIA_DATA esté disponible
    if (typeof COLOMBIA_DATA === 'undefined') {
      console.error('❌ COLOMBIA_DATA no está disponible. Asegúrate de cargar colombiaCities.js');
      return;
    }

    console.log('🌎 Inicializando selects de ubicación de Colombia');

    // Poblar departamentos
    if (departmentSelect) {
      const departments = Object.keys(COLOMBIA_DATA).sort();
      
      departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        departmentSelect.appendChild(option);
      });

      console.log(`✅ ${departments.length} departamentos cargados`);

      // Listener para cambio de departamento
      departmentSelect.addEventListener('change', (e) => {
        const selectedDept = e.target.value;
        
        // Limpiar y habilitar select de ciudades
        citySelect.innerHTML = '<option value="">Selecciona municipio...</option>';
        
        if (selectedDept && COLOMBIA_DATA[selectedDept]) {
          const cities = COLOMBIA_DATA[selectedDept].sort();
          
          cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
          });
          
          citySelect.disabled = false;
          console.log(`📍 ${cities.length} municipios cargados para ${selectedDept}`);
        } else {
          citySelect.disabled = true;
        }
      });
    }
  }

  //  FUNCIONES AUXILIARES

  // Leer carrito desde localStorage
  function readCartLocal() {
    try {
      const CART_KEY = "techstore_cart";
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      console.error("Error leyendo carrito:", e);
      return [];
    }
  }

  // Escribir carrito en localStorage
  function writeCartLocal(cart) {
    try {
      const CART_KEY = "techstore_cart";
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Error guardando carrito:", e);
    }
  }

  // Formatear precio
  function formatPrice(n) {
    return "$" + Number(n || 0).toLocaleString("es-CO");
  }

  // Sistema de notificaciones (si no existe window.showNotification)
  function showNotification(message, type = "info") {
    if (window.showNotification) {
      window.showNotification(message, type);
      return;
    }

    // Fallback si no existe la función global
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "fixed top-4 right-4 space-y-3 z-[9999]";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `px-4 py-3 rounded-lg shadow-lg text-white ${
      type === "success"
        ? "bg-green-600"
        : type === "error"
        ? "bg-red-600"
        : "bg-blue-600"
    }`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  //  CARGAR Y RENDERIZAR ITEMS DEL CARRITO
  const cart = readCartLocal();

  function renderCheckoutItems() {
    if (!itemsContainer || !subtotalEl || !totalEl) return;

    itemsContainer.innerHTML = "";

    if (!cart.length) {
      itemsContainer.innerHTML = `
        <div class="text-center py-8">
          <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p class="text-gray-500 dark:text-gray-400">No hay productos en el carrito</p>
          <a href="./productos.html" class="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Ver Productos
          </a>
        </div>
      `;
      subtotalEl.textContent = "$0";
      if (shippingEl) shippingEl.textContent = "Gratis";
      totalEl.textContent = "$0";
      if (btnPay) btnPay.disabled = true;
      return;
    }

    let subtotal = 0;

    cart.forEach((item) => {
      const lineTotal = Number(item.price || 0) * Number(item.qty || 1);
      subtotal += lineTotal;

      const row = document.createElement("div");
      row.className =
        "flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition";

      row.innerHTML = `
        <div class="flex items-center gap-3 flex-1">
          <img 
            src="${item.image || "../images/placeholder.png"}" 
            class="w-16 h-16 object-cover rounded-lg shadow-sm" 
            alt="${item.title || "Producto"}"
            onerror="this.src='../images/placeholder.png'">
          <div class="flex-1">
            <div class="font-semibold text-gray-800 dark:text-gray-100">${
              item.title || "Producto"
            }</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Cantidad: <span class="font-medium">${item.qty || 1}</span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-300 mt-1">
              ${formatPrice(item.price)} c/u
            </div>
          </div>
        </div>
        <div class="text-right">
          <div class="font-bold text-lg text-gray-800 dark:text-gray-100">${formatPrice(
            lineTotal
          )}</div>
        </div>
      `;

      itemsContainer.appendChild(row);
    });

    // Calcular envío (puedes personalizar la lógica)
    const shipping = subtotal > 100000 ? 0 : 5000; // Envío gratis si compra más de $100,000
    const total = subtotal + shipping;

    // Actualizar UI
    subtotalEl.textContent = formatPrice(subtotal);
    if (shippingEl) {
      shippingEl.textContent =
        shipping === 0 ? "Gratis" : formatPrice(shipping);
    }
    totalEl.textContent = formatPrice(total);

    if (btnPay) btnPay.disabled = false;
  }

  //  MOSTRAR/OCULTAR CAMPOS DE TARJETA
  function updatePaymentFields() {
    if (!form || !cardFields) return;

    const method = form.querySelector(
      'input[name="payment-method"]:checked'
    )?.value;

    if (method === "card") {
      cardFields.style.display = "block";
      // Hacer campos de tarjeta requeridos
      cardFields.querySelectorAll("input").forEach((input) => {
        input.setAttribute("required", "required");
      });
    } else {
      cardFields.style.display = "none";
      // Remover requerido de campos de tarjeta
      cardFields.querySelectorAll("input").forEach((input) => {
        input.removeAttribute("required");
      });
    }
  }

  //  VALIDAR CAMPOS DEL FORMULARIO
  function validateForm() {
    const name = document.getElementById("billing-name")?.value.trim();
    const phone = document.getElementById("billing-phone")?.value.trim();
    const department = document.getElementById("billing-department")?.value.trim();
    const city = document.getElementById("billing-city")?.value.trim();
    const neighborhood = document.getElementById("billing-neighborhood")?.value.trim();
    const address = document.getElementById("billing-address")?.value.trim();
    const method = form.querySelector(
      'input[name="payment-method"]:checked'
    )?.value;

    if (!name || !phone || !department || !city || !neighborhood || !address) {
      showNotification(
        "Por favor completa todos los campos obligatorios",
        "error"
      );
      return false;
    }

    // Validar teléfono (básico)
    if (phone.length < 7) {
      showNotification("Por favor ingresa un teléfono válido", "error");
      return false;
    }

    // Si es pago con tarjeta, validar campos de tarjeta
    if (method === "card") {
      const cardNumber = document
        .getElementById("card-number")
        ?.value.replace(/\s+/g, "");
      const cardExp = document.getElementById("card-exp")?.value;
      const cardCvc = document.getElementById("card-cvc")?.value;

      if (!cardNumber || cardNumber.length < 13) {
        showNotification(
          "Por favor ingresa un número de tarjeta válido",
          "error"
        );
        return false;
      }

      if (!cardExp || !cardExp.match(/^\d{2}\/\d{2}$/)) {
        showNotification(
          "Por favor ingresa una fecha de expiración válida (MM/AA)",
          "error"
        );
        return false;
      }

      if (!cardCvc || cardCvc.length < 3) {
        showNotification("Por favor ingresa un CVV válido", "error");
        return false;
      }
    }

    return true;
  }

  //  PROCESAR PAGO - FUNCIÓN MODIFICADA
  async function processPay() {
    if (!validateForm()) return;
    if (!cart.length) {
      showNotification("Tu carrito está vacío", "error");
      return;
    }

    // Obtener datos del formulario
    const name = document.getElementById("billing-name")?.value.trim();
    const phone = document.getElementById("billing-phone")?.value.trim();
    const department = document.getElementById("billing-department")?.value.trim();
    const city = document.getElementById("billing-city")?.value.trim();
    const neighborhood = document.getElementById("billing-neighborhood")?.value.trim();
    const address = document.getElementById("billing-address")?.value.trim();
    const notes = document.getElementById("billing-notes")?.value.trim() || "";
    const method =
      form.querySelector('input[name="payment-method"]:checked')?.value ||
      "card";

    // CORRECCIÓN: Mapear "nequi" a "other" que es aceptado por el backend
    let backendMethod = method;
    if (method === "nequi") {
      backendMethod = "other";
    }

    // =====================================================
    //  CRÍTICO: ASEGURAR QUE LAS IMÁGENES SE INCLUYAN
    // =====================================================
    console.log("🛒 Carrito original:", cart);

    const products = cart.map((item) => {
      // Normalizar la ruta de la imagen para guardarla correctamente
      let imagePath = item.image || "";

      // Si la imagen ya tiene una ruta válida, usarla
      if (imagePath) {
        // Remover ../  para guardar ruta relativa limpia
        if (imagePath.startsWith("../")) {
          imagePath = imagePath.substring(3); // Remueve ../ para guardar "images/m3.png"
        }
        // Si ya empieza con images/, dejarla así
        else if (imagePath.startsWith("images/")) {
          // Ya está bien
        }
        // Si empieza con src/images/, remover src/
        else if (imagePath.startsWith("src/images/")) {
          imagePath = imagePath.substring(4); // Remueve src/ para dejar "images/m3.png"
        }
        // Si es solo el nombre del archivo, agregar images/
        else if (!imagePath.includes("/")) {
          imagePath = "images/" + imagePath;
        }
      } else {
        // Si no hay imagen, usar placeholder
        imagePath = "images/placeholder.png";
      }

      console.log(`📸 Producto: ${item.title}`);
      console.log(`   - Imagen original: "${item.image}"`);
      console.log(`   - Imagen normalizada: "${imagePath}"`);

      return {
        id: item.id,
        title: item.title,
        qty: item.qty || 1,
        price: Number(item.price || 0),
        image: imagePath, // ← GUARDAMOS LA RUTA NORMALIZADA
      };
    });

    console.log("📦 Productos a enviar:", products);

    const subtotal = products.reduce((sum, p) => sum + p.price * p.qty, 0);
    const envio = subtotal > 100000 ? 0 : 5000;
    const total = subtotal + envio;

    // Obtener datos del usuario logueado (si existe)
    const usuario = JSON.parse(localStorage.getItem("user") || "null");

    // IMPORTANTE: Usar el userId personalizado (USR000001), NO el _id de MongoDB
    const usuarioIdFinal = usuario?.userId || usuario?.id || null;

    console.log("👤 Usuario desde localStorage:", usuario);
    console.log("🔑 UsuarioId que se enviará:", usuarioIdFinal);

    // Construir payload
    const payload = {
      usuarioId: usuarioIdFinal,
      usuarioData: {
        nombre: usuario?.nombre || name,
        correo: usuario?.correo || "",
        telefono: usuario?.telefono || phone,
      },
      billing: {
        name,
        phone,
        address,
        city,
        department,
        neighborhood,
        notes
      },
      payment: {
        method: backendMethod,
        card:
          method === "card"
            ? {
                number:
                  document
                    .getElementById("card-number")
                    ?.value.replace(/\s+/g, "") || null,
                exp: document.getElementById("card-exp")?.value || null,
                cvc: document.getElementById("card-cvc")?.value || null,
                holder: document.getElementById("card-name")?.value || name,
              }
            : null,
      },
      products,
      subtotal,
      envio,
      total,
      meta: {
        from: window.location.pathname,
        ts: Date.now(),
      },
    };

    console.log("📤 Payload completo:", JSON.stringify(payload, null, 2));

    // Deshabilitar botón mientras procesa
    if (btnPay) {
      btnPay.disabled = true;
      btnPay.classList.add("opacity-60", "cursor-not-allowed");
      btnPay.innerHTML = `
        <svg class="animate-spin w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      `;
    }

    try {
      // IMPORTANTE: Cambia esta URL por la ruta real de tu backend
      const response = await fetch("http://localhost:8081/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        // Pago exitoso
        showNotification(
          "¡Pago procesado correctamente! Gracias por tu compra 🎉",
          "success"
        );

        // Limpiar carrito
        writeCartLocal([]);

        // Actualizar contador del carrito en el header
        const cartCounter = document.getElementById("cart-counter");
        if (cartCounter) {
          cartCounter.style.display = "none";
        }

        // Redirigir a página de confirmación
        setTimeout(() => {
          const orderId = data.orderId || "ORDER-" + Date.now();
          window.location.href = `./confirmacion.html?order=${encodeURIComponent(
            orderId
          )}`;
        }, 1500);
      } else {
        // Error en el pago
        const msg =
          data?.message || `Error procesando pago (${response.status})`;
        showNotification(msg, "error");
      }
    } catch (err) {
      console.error("Error al comunicarse con el backend:", err);
      showNotification(
        "No se pudo conectar con el servidor. Por favor intenta nuevamente.",
        "error"
      );
    } finally {
      // Restaurar botón
      if (btnPay) {
        btnPay.disabled = false;
        btnPay.classList.remove("opacity-60", "cursor-not-allowed");
        btnPay.innerHTML = "Pagar ahora";
      }
    }
  }

  //  EVENTOS

  // Inicializar selects de ubicación
  initializeLocationSelects();

  // Renderizar items al cargar
  renderCheckoutItems();

  // Cambio de método de pago
  if (form) {
    updatePaymentFields();
    form.addEventListener("change", (e) => {
      if (e.target.name === "payment-method") {
        updatePaymentFields();
      }
    });
  }

  // Botón cancelar
  if (btnCancel) {
    btnCancel.addEventListener("click", () => {
      window.location.href = "./car.html";
    });
  }

  // Botón pagar
  if (btnPay) {
    btnPay.addEventListener("click", (e) => {
      e.preventDefault();
      processPay();
    });
  }

  // Formateo automático de número de tarjeta
  const cardNumberInput = document.getElementById("card-number");
  if (cardNumberInput) {
    cardNumberInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/g, "");
      let formatted = value.match(/.{1,4}/g)?.join(" ") || value;
      e.target.value = formatted;
    });
  }

  // Formateo de fecha de expiración (MM/AA)
  const cardExpInput = document.getElementById("card-exp");
  if (cardExpInput) {
    cardExpInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length >= 2) {
        value = value.slice(0, 2) + "/" + value.slice(2, 4);
      }
      e.target.value = value;
    });
  }

  // Limitar CVV a 4 dígitos
  const cardCvcInput = document.getElementById("card-cvc");
  if (cardCvcInput) {
    cardCvcInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
    });
  }

  //  FUNCIÓN ADICIONAL: VERIFICAR CARRITO AL CARGAR
  function verificarImagenesEnCarrito() {
    console.log("🔍 Verificando imágenes en el carrito...");

    let carritoModificado = false;
    const cartActualizado = cart.map((item) => {
      if (!item.image || item.image === "") {
        console.warn(`⚠️ Producto sin imagen: ${item.title} (${item.id})`);

        // Intentar recuperar la imagen de window.PRODUCTS si existe
        if (window.PRODUCTS && Array.isArray(window.PRODUCTS)) {
          const productoOriginal = window.PRODUCTS.find((p) => p.id == item.id);
          if (productoOriginal && productoOriginal.image) {
            console.log(
              `✅ Imagen recuperada desde PRODUCTS: ${productoOriginal.image}`
            );
            item.image = productoOriginal.image;
            carritoModificado = true;
          }
        }
      }
      return item;
    });

    // Si se modificó el carrito, guardarlo
    if (carritoModificado) {
      console.log("💾 Actualizando carrito con imágenes corregidas...");
      writeCartLocal(cartActualizado);
    }
  }

  // Llamar esta función al cargar checkout
  verificarImagenesEnCarrito();

  console.log("✅ Checkout inicializado correctamente con ubicación de Colombia");
})();
// cambios