(function initLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;

  console.log("📌 Login conectado desde login.js");

  const API_URL = "http://localhost:8081/api/login";
  const btn = document.getElementById("login-btn");
  const errorDiv = document.getElementById("login-error");
  const errorMsg = document.getElementById("login-error-message");

  // Mostrar mensaje (error o success)
  function showMessage(text, type = "error") {
    if (!errorDiv || !errorMsg) return;

    errorMsg.textContent = text;
    errorDiv.classList.remove("hidden");

    if (type === "success") {
      errorDiv.className =
        "mx-auto max-w-md mb-4 rounded-lg px-4 py-2 text-sm bg-green-100 border border-green-300 text-green-700";
    } else {
      errorDiv.className =
        "mx-auto max-w-md mb-4 rounded-lg px-4 py-2 text-sm bg-red-100 border border-red-300 text-red-700";
    }
  }

  // Evento principal del login
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (errorDiv) errorDiv.classList.add("hidden");

    const datos = {
      correo: document.getElementById("email")?.value.trim() || "",
      password: document.getElementById("password")?.value || "",
    };

    if (!datos.correo || !datos.password) {
      showMessage("Por favor completa todos los campos.");
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = "Iniciando sesión...";
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      const resultado = await response.json().catch(() => ({}));

      // SI EL LOGIN ES CORRECTO
      if (response.ok) {
        const usuario =
          resultado.usuario ||
          resultado.user ||
          resultado.data ||
          resultado;

        const id =
          usuario?.id ||
          usuario?._id ||
          resultado?.id ||
          null;

        if (!usuario || !id) {
          showMessage(
            "Inicio correcto, pero el servidor no devolvió los datos del usuario.",
            "error"
          );
          console.warn("⚠ Respuesta inesperada:", resultado);

          if (btn) {
            btn.disabled = false;
            btn.textContent = "Iniciar Sesión";
          }
          return;
        }

        // GUARDAR SESIÓN EN LOCALSTORAGE
        localStorage.setItem("sesionActiva", "true");

        localStorage.setItem(
          "user",
          JSON.stringify({
            id: id,
            nombre: usuario.nombre || usuario.firstName || "",
            apellido: usuario.apellido || usuario.lastName || "",
            telefono: usuario.telefono || usuario.phone || "",
            correo: usuario.correo || usuario.email || "",
          })
        );

        showMessage("Inicio de sesión correcto. Redirigiendo...", "success");

        setTimeout(() => {
          window.location.href = "productos.html";
        }, 700);

        return;
      }

      // SI EL LOGIN FALLA
      const msg =
        resultado?.message ||
        resultado?.error ||
        `Credenciales incorrectas (${response.status})`;
      showMessage(msg);

    } catch (error) {
      console.error("❌ Error de conexión:", error);
      showMessage("No se pudo conectar al servidor.");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Iniciar Sesión";
      }
    }
  });
})();
