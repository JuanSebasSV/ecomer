// --- FORZAR RECARGA DE CSS PARA SALTAR CACHÉ ---
(function fixCssCache() {
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    const url = link.getAttribute("href");
    const sep = url.includes("?") ? "&" : "?";
    link.setAttribute("href", `${url}${sep}v=${Date.now()}`);
  });
})();

// === MODO OSCURO (versión robusta: init inmediato si es necesario) ===
(function () {
  function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');

    if (!themeToggleBtn || !lightIcon || !darkIcon) {
      console.error("⚠️ theme-toggle o iconos no encontrados");
      return;
    }

    // Evitar inicializar más de una vez
    if (themeToggleBtn.dataset.themeInit === "1") return;
    themeToggleBtn.dataset.themeInit = "1";

    // Por defecto esconder ambos (evita flash donde se ven ambos)
    lightIcon.style.display = 'none';
    darkIcon.style.display = 'none';
    lightIcon.setAttribute('aria-hidden', 'true');
    darkIcon.setAttribute('aria-hidden', 'true');

    function applyIconVisibility(isDark) {
      if (isDark) {
        lightIcon.style.display = 'none';
        darkIcon.style.display = 'inline-block';
        lightIcon.setAttribute('aria-hidden', 'true');
        darkIcon.setAttribute('aria-hidden', 'false');
      } else {
        lightIcon.style.display = 'inline-block';
        darkIcon.style.display = 'none';
        lightIcon.setAttribute('aria-hidden', 'false');
        darkIcon.setAttribute('aria-hidden', 'true');
      }
    }

    // Determinar estado inicial
    const stored = localStorage.getItem('theme'); // 'dark' | 'light' | null
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialIsDark = (stored === 'dark') || (stored === null && prefersDark);

    // Aplicar clase al documento y mostrar icono correcto
    document.documentElement.classList.toggle('dark', !!initialIsDark);
    applyIconVisibility(!!initialIsDark);

    // Click handler
    themeToggleBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const isDarkNow = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDarkNow ? 'dark' : 'light');
      applyIconVisibility(isDarkNow);
    });

    // Escuchar cambio de preferencia del sistema solo si no hay preferencia guardada
    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const onChange = e => {
        if (!localStorage.getItem('theme')) {
          const systemDark = !!e.matches;
          document.documentElement.classList.toggle('dark', systemDark);
          applyIconVisibility(systemDark);
        }
      };
      // compatibilidad: addEventListener('change') o addListener
      try {
        mq.addEventListener('change', onChange);
      } catch (err) {
        try { mq.addListener(onChange); } catch (e) { /* ignore */ }
      }
    }
  }

  // Init inmediato si el DOM ya está listo, o on DOMContentLoaded si no
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
  } else {
    initThemeToggle();
  }
})();

// ---------- Persistencia de carrito (global, main.js) ----------
const CART_KEY = 'techstore_cart';

function readCartLocal() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) { return []; }
}

function writeCartLocal(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    // disparar storage para la misma pestaña para que car.html reaccione si está abierta
    try {
      window.dispatchEvent(new StorageEvent('storage', { key: CART_KEY, newValue: JSON.stringify(cart) }));
    } catch (e) {
      // algunos navegadores no permiten construir StorageEvent de esa forma; como fallback, llamamos a un evento custom
      const ev = new Event('techstore_cart_updated');
      window.dispatchEvent(ev);
    }
  } catch (e) {
    console.error('Error guardando carrito:', e);
  }
}


// ---- Control de iconos de usuario (login / avatar + menú) ----
(function handleUserIcon() {
  const loginIcon = document.getElementById("user-login-icon");
  const avatar = document.getElementById("user-avatar");
  const userMenu = document.getElementById("user-menu");
  const btnPerfil = document.getElementById("btn-ver-perfil");
  const btnLogout = document.getElementById("btn-cerrar-sesion");

  if (!loginIcon || !avatar) return;

  // Revisar si hay usuario guardado
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ---- NO HAY SESIÓN ----
  if (!user) {
    loginIcon.style.display = "flex";
    avatar.style.display = "none";
    if (userMenu) userMenu.classList.add("hidden");
    return;
  }

  // ---- HAY SESIÓN ----
  loginIcon.style.display = "none";
  avatar.style.display = "flex";

  const inicial = user.nombre?.charAt(0)?.toUpperCase() || "?";
  avatar.textContent = inicial;

  // Toggle del menú
  avatar.addEventListener("click", () => {
    userMenu.classList.toggle("hidden");
  });

  // Cierra menú al hacer click fuera
  document.addEventListener("click", (e) => {
    if (!avatar.contains(e.target) && !userMenu.contains(e.target)) {
      userMenu.classList.add("hidden");
    }
  });

  // Ver perfil
  if (btnPerfil) {
    btnPerfil.addEventListener("click", () => {
      window.location.href = "./perfil.html";
    });
  }

  // Cerrar sesión
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("user");
      location.reload();
    });
  }
})();


//  ANIMACIÓN MOSTRAR/OCULTAR CONTRASEÑA
// ------------------------------------------------------
(function setupPasswordToggle() {
  const input = document.getElementById("password");
  const toggle = document.getElementById("toggle-password");
  const eyeOpen = document.getElementById("eye-icon-open");
  const eyeClosed = document.getElementById("eye-icon-closed");

  if (!input || !toggle) return;

  toggle.addEventListener("click", () => {
    const isHidden = input.type === "password";

    // --- Mostrar contraseña ---
    if (isHidden) {
      input.type = "text";
      eyeOpen.classList.add("hidden");
      eyeClosed.classList.remove("hidden");
      return;
    }

    // --- Ocultar contraseña con animación ---
    const original = input.value;
    if (!original.length) {
      input.type = "password";
      eyeOpen.classList.remove("hidden");
      eyeClosed.classList.add("hidden");
      return;
    }

    let chars = original.split("");
    let index = 0;

    // Animación: cambia 1 letra → "•" cada 35ms (izq → der)
    const interval = setInterval(() => {
      chars[index] = "•";

      input.value = chars.join("");

      index++;

      if (index >= chars.length) {
        clearInterval(interval);

        setTimeout(() => {
          input.type = "password";
          input.value = original; 

          eyeOpen.classList.remove("hidden");
          eyeClosed.classList.add("hidden");
        }, 80);
      }
    }, 35); // velocidad de animación
  });
})();

// ---- Ajuste de anclas para header fijo (si el hash posiciona muy abajo) ----
(function fixAnchorOffset() {
  // solo si existe hash en la URL
  if (!window.location.hash) return;

  function scrollToHashAdjusted() {
    const hash = window.location.hash;
    const target = document.querySelector(hash);
    const header = document.querySelector('header');
    if (!target) return;
    const headerHeight = header ? header.offsetHeight : 0;
    const y = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12; // 12px breathing room
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  // Esperar a que el DOM y estilos estén listos
  window.addEventListener('load', () => {
    // pequeño delay para asegurar imágenes y CSS
    setTimeout(scrollToHashAdjusted, 50);
  });

  // también interceptar clicks en enlaces internos para aplicar offset
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 0;
    const y = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
    window.history.pushState(null, '', href); // actualizar hash
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
})();