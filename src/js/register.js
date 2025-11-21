// ---------------- Registro de usuario ----------------
(function setupRegisterForm() {
  const form = document.getElementById('register-form');
  const submitBtn = document.getElementById('register-submit');
  if (!form) return;

  function disableBtn(disabled = true) {
    if (!submitBtn) return;
    submitBtn.disabled = disabled;
    submitBtn.classList.toggle('opacity-60', disabled);
    submitBtn.classList.toggle('cursor-not-allowed', disabled);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    disableBtn(true);

    const payload = {
      nombre: document.getElementById("nombre").value.trim(),
      apellido: document.getElementById("apellido").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      correo: document.getElementById("register-email").value.trim(),
      password: document.getElementById("password").value,
    };

    if (!payload.nombre || !payload.apellido || !payload.telefono || 
        !payload.correo || !payload.password) {
      showNotification("Por favor completa todos los campos", "info");
      disableBtn(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8081/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showNotification(data.message || "Error al registrar", "info");
        disableBtn(false);
        return;
      }

      showNotification("Usuario registrado correctamente", "success");

      setTimeout(() => {
        window.location.href = "./login.html";
      }, 900);

    } catch (error) {
      console.error("Error al registrar:", error);
      showNotification("Error de conexión", "info");
      disableBtn(false);
    }
  });
})();
