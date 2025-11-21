// ===============================
//  SISTEMA DE NOTIFICACIONES
// ===============================
window.showNotification = function (message, type = "info") {
  // Crear contenedor si no existe
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.position = "fixed";
    container.style.top = "20px";
    container.style.right = "20px";
    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "10px";
    document.body.appendChild(container);
  }

  // Crear toast
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.padding = "12px 18px";
  toast.style.borderRadius = "10px";
  toast.style.color = "white";
  toast.style.fontSize = "14px";
  toast.style.fontWeight = "600";
  toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
  toast.style.opacity = "0";
  toast.style.transform = "translateY(-15px)";
  toast.style.transition = "all .3s";

  // Colores según tipo
  const colors = {
    success: "#22c55e",
    info: "#3b82f6",
    error: "#ef4444",
  };

  toast.style.background = colors[type] || colors.info;

  container.appendChild(toast);

  // Animación de entrada
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  // Remover después de 2.2s
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-15px)";

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2200);
};
