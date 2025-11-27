(function initPerfil() {
  const API_BASE = "http://localhost:8081/api/users";
  
  // Verificar sesión
  const userLocal = JSON.parse(localStorage.getItem("user") || "null");
  if (!userLocal || !userLocal.id) {
    window.location.href = "./login.html";
    return;
  }

  const userId = userLocal.id;

  // Elementos del DOM
  const profileAvatar = document.getElementById("profile-avatar");
  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");
  const profileUserId = document.getElementById("profile-userId");
  
  const formProfile = document.getElementById("profile-form");
  const inputNombre = document.getElementById("nombre");
  const inputApellido = document.getElementById("apellido");
  const inputTelefono = document.getElementById("telefono");
  const inputCorreo = document.getElementById("correo");
  const btnSaveProfile = document.getElementById("btn-save-profile");

  // Modal de contraseña
  const modalPassword = document.getElementById("modal-password");
  const btnChangePassword = document.getElementById("btn-change-password");
  const btnCloseModal = document.getElementById("btn-close-modal");
  const btnCancelPassword = document.getElementById("btn-cancel-password");
  const formPassword = document.getElementById("password-form");

  //  CARGAR DATOS DEL USUARIO DESDE LA BD
  async function cargarDatosUsuario() {
    try {
      const response = await fetch(`${API_BASE}/${userId}`);
      
      if (!response.ok) {
        throw new Error("No se pudieron cargar los datos del usuario");
      }

      const result = await response.json();
      const usuario = result.data || result;

      // Actualizar localStorage con datos frescos
      const updatedUser = {
        id: usuario._id || usuario.userId,
        nombre: usuario.nombre || "",
        apellido: usuario.apellido || "",
        telefono: usuario.telefono || "",
        correo: usuario.correo || "",
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Llenar el formulario
      if (inputNombre) inputNombre.value = usuario.nombre || "";
      if (inputApellido) inputApellido.value = usuario.apellido || "";
      if (inputTelefono) inputTelefono.value = usuario.telefono || "";
      if (inputCorreo) inputCorreo.value = usuario.correo || "";

      // Actualizar tarjeta de perfil
      const inicial = (usuario.nombre?.charAt(0) || "?").toUpperCase();
      if (profileAvatar) profileAvatar.textContent = inicial;
      if (profileName) profileName.textContent = `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim();
      if (profileEmail) profileEmail.textContent = usuario.correo || "";
      if (profileUserId) profileUserId.textContent = usuario.userId || usuario._id || "";

    } catch (error) {
      console.error("Error al cargar datos:", error);
      if (window.showNotification) {
        window.showNotification("Error al cargar los datos del usuario", "error");
      }
    }
  }

  //  GUARDAR CAMBIOS DEL PERFIL
  if (formProfile) {
    formProfile.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = inputNombre?.value.trim();
      const apellido = inputApellido?.value.trim();
      const telefono = inputTelefono?.value.trim();

      if (!nombre || !apellido || !telefono) {
        if (window.showNotification) {
          window.showNotification("Por favor completa todos los campos", "info");
        }
        return;
      }

      // Deshabilitar botón
      if (btnSaveProfile) {
        btnSaveProfile.disabled = true;
        btnSaveProfile.innerHTML = `
          <svg class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Guardando...
        `;
      }

      try {
        const response = await fetch(`${API_BASE}/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, apellido, telefono }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Error al actualizar");
        }

        // Actualizar localStorage
        const updatedUser = {
          ...userLocal,
          nombre,
          apellido,
          telefono,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Actualizar UI
        if (profileAvatar) profileAvatar.textContent = nombre.charAt(0).toUpperCase();
        if (profileName) profileName.textContent = `${nombre} ${apellido}`;

        if (window.showNotification) {
          window.showNotification("Perfil actualizado correctamente", "success");
        }

        // Recargar datos después de 500ms
        setTimeout(cargarDatosUsuario, 500);

      } catch (error) {
        console.error("Error al actualizar perfil:", error);
        if (window.showNotification) {
          window.showNotification(error.message || "Error al actualizar el perfil", "error");
        }
      } finally {
        // Restaurar botón
        if (btnSaveProfile) {
          btnSaveProfile.disabled = false;
          btnSaveProfile.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Guardar Cambios
          `;
        }
      }
    });
  }

  //  MODAL DE CAMBIO DE CONTRASEÑA
  // Abrir modal
  if (btnChangePassword) {
    btnChangePassword.addEventListener("click", () => {
      if (modalPassword) modalPassword.classList.remove("hidden");
    });
  }

  // Cerrar modal
  function cerrarModal() {
    if (modalPassword) modalPassword.classList.add("hidden");
    if (formPassword) formPassword.reset();
  }

  if (btnCloseModal) btnCloseModal.addEventListener("click", cerrarModal);
  if (btnCancelPassword) btnCancelPassword.addEventListener("click", cerrarModal);

  // Cerrar al hacer click fuera del modal
  if (modalPassword) {
    modalPassword.addEventListener("click", (e) => {
      if (e.target === modalPassword) cerrarModal();
    });
  }

  //  CAMBIAR CONTRASEÑA
  if (formPassword) {
    formPassword.addEventListener("submit", async (e) => {
      e.preventDefault();

      const currentPassword = document.getElementById("current-password")?.value;
      const newPassword = document.getElementById("new-password")?.value;
      const confirmPassword = document.getElementById("confirm-password")?.value;

      // Validaciones
      if (!currentPassword || !newPassword || !confirmPassword) {
        if (window.showNotification) {
          window.showNotification("Por favor completa todos los campos", "info");
        }
        return;
      }

      if (newPassword.length < 6) {
        if (window.showNotification) {
          window.showNotification("La nueva contraseña debe tener al menos 6 caracteres", "info");
        }
        return;
      }

      if (newPassword !== confirmPassword) {
        if (window.showNotification) {
          window.showNotification("Las contraseñas no coinciden", "error");
        }
        return;
      }

      const btnSubmit = document.getElementById("btn-submit-password");
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Actualizando...";
      }

      try {
        const response = await fetch(`${API_BASE}/${userId}/change-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            currentPassword, 
            newPassword 
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Error al cambiar la contraseña");
        }

        if (window.showNotification) {
          window.showNotification("Contraseña actualizada correctamente", "success");
        }

        cerrarModal();

      } catch (error) {
        console.error("Error al cambiar contraseña:", error);
        if (window.showNotification) {
          window.showNotification(error.message || "Error al cambiar la contraseña", "error");
        }
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = "Actualizar";
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

  //  INICIALIZAR
  cargarDatosUsuario();
})();