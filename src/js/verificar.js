// ecomer/src/js/verificar.js
// VERIFICAR CÓDIGO DE 6 DÍGITOS

(function initVerificarCodigo() {
  const API_BASE = "https://tiendavirtual-z09x.onrender.com/api/users";
  
  const form = document.getElementById("verify-code-form");
  const codeInput = document.getElementById("verification-code");
  const verifyBtn = document.getElementById("verify-btn");
  const resendBtn = document.getElementById("resend-btn");
  const userEmailEl = document.getElementById("user-email");

  console.log('🔍 Iniciando verificación de código');
  console.log('📋 Elementos encontrados:', {
    form: !!form,
    codeInput: !!codeInput,
    verifyBtn: !!verifyBtn
  });

  // Obtener email del localStorage
  const email = localStorage.getItem('recovery-email');
  console.log('📧 Email recuperado:', email);

  if (!email) {
    console.error('❌ No se encontró el correo en localStorage');
    if (window.showNotification) {
      window.showNotification("No se encontró el correo. Inicia el proceso de nuevo.", "error");
    }
    setTimeout(() => {
      window.location.href = "./recover.html";
    }, 2000);
    return;
  }

  // Mostrar email en la página
  if (userEmailEl) {
    userEmailEl.textContent = email;
  }

  // Auto-focus en el input
  if (codeInput) {
    codeInput.focus();
  }

  // Permitir solo números
  if (codeInput) {
    codeInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  }

  // VERIFICAR CÓDIGO
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log('✅ Formulario enviado');

      const codigo = codeInput?.value.trim();
      console.log('🔢 Código ingresado:', codigo);

      if (!codigo || codigo.length !== 6) {
        console.warn('⚠️ Código inválido');
        if (window.showNotification) {
          window.showNotification("Por favor ingresa un código de 6 dígitos", "info");
        }
        return;
      }

      // Deshabilitar botón
      if (verifyBtn) {
        verifyBtn.disabled = true;
        verifyBtn.innerHTML = `
          <svg class="animate-spin w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        `;
      }

      try {
        console.log('📤 Enviando petición a:', `${API_BASE}/verify-code`);
        console.log('📦 Datos:', { correo: email, codigo: codigo });

        const response = await fetch(`${API_BASE}/verify-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            correo: email,
            codigo: codigo
          }),
        });

        console.log('📥 Respuesta recibida:', response.status);
        const result = await response.json();
        console.log('📋 Resultado:', result);

        if (!response.ok || !result.valid) {
          throw new Error(result.message || "Código inválido");
        }

        // Guardar el token para la siguiente pantalla
        if (result.token) {
          console.log('🔑 Token recibido, guardando...');
          localStorage.setItem('reset-token', result.token);
        }

        if (window.showNotification) {
          window.showNotification("Código verificado correctamente", "success");
        }

        // Redirigir a la página de cambio de contraseña
        console.log('➡️ Redirigiendo a recuperacion.html');
        setTimeout(() => {
          window.location.href = `./recuperacion.html?token=${result.token}`;
        }, 1000);

      } catch (error) {
        console.error("❌ Error al verificar código:", error);
        
        if (window.showNotification) {
          window.showNotification(
            error.message || "Código inválido o expirado", 
            "error"
          );
        }

        // Restaurar botón
        if (verifyBtn) {
          verifyBtn.disabled = false;
          verifyBtn.textContent = "Verificar Código";
        }

        // Limpiar input
        if (codeInput) {
          codeInput.value = "";
          codeInput.focus();
        }
      }
    });
  } else {
    console.error('❌ No se encontró el formulario');
  }

  // REENVIAR CÓDIGO
  if (resendBtn) {
    resendBtn.addEventListener("click", async () => {
      console.log('🔄 Reenviando código...');
      resendBtn.disabled = true;
      resendBtn.textContent = "Reenviando...";

      try {
        const response = await fetch(`${API_BASE}/recover-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo: email }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Error al reenviar");
        }

        if (window.showNotification) {
          window.showNotification("Código reenviado a tu correo", "success");
        }

        // Limpiar input
        if (codeInput) {
          codeInput.value = "";
          codeInput.focus();
        }

      } catch (error) {
        console.error("Error al reenviar código:", error);
        
        if (window.showNotification) {
          window.showNotification(
            error.message || "Error al reenviar el código", 
            "error"
          );
        }
      } finally {
        resendBtn.disabled = false;
        resendBtn.textContent = "Reenviar código";
      }
    });
  }
})();
