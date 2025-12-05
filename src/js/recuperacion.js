// RESTABLECER CONTRASEÑA - Página que recibe el token del email

(function initResetPassword() {
  const API_BASE = "https://tiendavirtual-z09x.onrender.com/api/users";

  // Elementos del DOM
  const loadingState = document.getElementById("loading-state");
  const invalidToken = document.getElementById("invalid-token");
  const resetFormContainer = document.getElementById("reset-form-container");
  const successState = document.getElementById("success-state");
  const userEmailEl = document.getElementById("user-email");
  const form = document.getElementById("reset-password-form");
  const submitBtn = document.getElementById("submit-btn");

  // Obtener token de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (!token) {
    mostrarTokenInvalido();
    return;
  }

  // Verificar token al cargar
  verificarToken();

  //  VERIFICAR TOKEN
  async function verificarToken() {
    try {
      const response = await fetch(`${API_BASE}/verify-token/${token}`);
      const result = await response.json();

      if (!response.ok || !result.valid) {
        mostrarTokenInvalido();
        return;
      }

      // Token válido - mostrar formulario
      if (loadingState) loadingState.classList.add("hidden");
      if (resetFormContainer) resetFormContainer.classList.remove("hidden");
      
      if (userEmailEl && result.usuario) {
        userEmailEl.textContent = `Para: ${result.usuario.correo}`;
      }

    } catch (error) {
      console.error("Error al verificar token:", error);
      mostrarTokenInvalido();
    }
  }

  //  MOSTRAR TOKEN INVÁLIDO
  function mostrarTokenInvalido() {
    if (loadingState) loadingState.classList.add("hidden");
    if (resetFormContainer) resetFormContainer.classList.add("hidden");
    if (invalidToken) invalidToken.classList.remove("hidden");
  }

  //  RESTABLECER CONTRASEÑA
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const newPassword = document.getElementById("new-password")?.value;
      const confirmPassword = document.getElementById("confirm-password")?.value;

      // Validaciones
      if (!newPassword || !confirmPassword) {
        if (window.showNotification) {
          window.showNotification("Por favor completa todos los campos", "info");
        }
        return;
      }

      if (newPassword.length < 6) {
        if (window.showNotification) {
          window.showNotification("La contraseña debe tener al menos 6 caracteres", "info");
        }
        return;
      }

      if (newPassword !== confirmPassword) {
        if (window.showNotification) {
          window.showNotification("Las contraseñas no coinciden", "error");
        }
        return;
      }

      // Deshabilitar botón
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        `;
      }

      try {
        const response = await fetch(`${API_BASE}/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            token, 
            newPassword 
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Error al restablecer la contraseña");
        }

        // Éxito - mostrar pantalla de confirmación
        if (resetFormContainer) resetFormContainer.classList.add("hidden");
        if (successState) successState.classList.remove("hidden");

        if (window.showNotification) {
          window.showNotification("Contraseña restablecida correctamente", "success");
        }

      } catch (error) {
        console.error("Error al restablecer contraseña:", error);
        
        if (window.showNotification) {
          window.showNotification(
            error.message || "Error al restablecer la contraseña", 
            "error"
          );
        }

        // Restaurar botón
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Restablecer Contraseña";
        }
      }
    });
  }

  //  TOGGLE DE VISIBILIDAD DE CONTRASEÑAS
  document.querySelectorAll(".toggle-password-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      const eyeOpen = btn.querySelector(".eye-open");
      const eyeClosed = btn.querySelector(".eye-closed");

      if (input.type === "password") {
        input.type = "text";
        eyeOpen.classList.add("hidden");
        eyeClosed.classList.remove("hidden");
      } else {
        input.type = "password";
        eyeOpen.classList.remove("hidden");
        eyeClosed.classList.add("hidden");
      }
    });
  });
})();