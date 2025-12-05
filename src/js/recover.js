// ecomer/src/js/recover.js

(function initRecover() {
  const form = document.getElementById("recover-form");
  const recoverBtn = document.getElementById("recover-btn");
  const emailInput = document.getElementById("recover-email");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput?.value.trim();

    if (!email) {
      if (window.showNotification) {
        window.showNotification("Por favor ingresa tu correo electrónico", "info");
      }
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (window.showNotification) {
        window.showNotification("Por favor ingresa un correo válido", "info");
      }
      return;
    }

    // Deshabilitar botón
    if (recoverBtn) {
      recoverBtn.disabled = true;
      recoverBtn.innerHTML = `
        <svg class="animate-spin w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      `;
    }

    try {
      // Llamar a la API de recuperación
      const response = await fetch("https://tiendavirtual-z09x.onrender.com/api/users/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Error al enviar el correo");
      }

      // Guardar el email en localStorage para la siguiente pantalla
      localStorage.setItem('recovery-email', email);

      if (window.showNotification) {
        window.showNotification("Código enviado a tu correo", "success");
      }

      // Redirigir a la página de verificación de código después de 1 segundo
      setTimeout(() => {
        window.location.href = "../pages/verificar.html";
      }, 1000);

    } catch (error) {
      console.error("Error al recuperar contraseña:", error);
      
      if (window.showNotification) {
        window.showNotification(
          error.message || "Error al enviar el correo de recuperación", 
          "error"
        );
      }

      // Restaurar botón
      if (recoverBtn) {
        recoverBtn.disabled = false;
        recoverBtn.textContent = "Enviar Instrucciones";
      }
    }
  });
})();