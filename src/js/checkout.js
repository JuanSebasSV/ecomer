// Checkout page handler
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