// === Carrusel de imágenes del Hero ===
const heroImages = [
  "../images/hero1.jpg",
  "../images/hero2.jpg",
  "../images/hero3.jpg"
];
const heroSection = document.getElementById("hero");
if (heroSection) {
  let currentIndex = 0;
  function changeBackground() {
    heroSection.style.backgroundImage = `url('${heroImages[currentIndex]}')`;
    heroSection.style.backgroundSize = "cover";
    heroSection.style.backgroundPosition = "center";
    heroSection.style.transition = "background-image 1s ease-in-out";
    currentIndex = (currentIndex + 1) % heroImages.length;
  }
  // Cambia la imagen cada 5 segundos
  changeBackground(); // primera vez
  setInterval(changeBackground, 5000);
}

// --- Newsletter → Mostrar mensaje si está logueado o formulario si no ---
(function setupNewsletter() {
  const newsletterSection = document.querySelector('.py-16.bg-gradient-to-r');
  if (!newsletterSection) return;

  // Verificar si hay usuario logueado
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (user && user.correo) {
    // USUARIO LOGUEADO: Mostrar mensaje personalizado
    newsletterSection.innerHTML = `
      <div class="container mx-auto px-4 text-center text-white">
        <div class="max-w-2xl mx-auto">
          <div class="mb-6">
            <svg class="w-20 h-20 mx-auto mb-4 text-white opacity-90 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 class="text-3xl md:text-4xl font-bold mb-4">
            ¡Estás suscrito! 🎉
          </h2>
          
          <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4 border border-white/20">
            <p class="text-xl mb-3 font-semibold">
              Hola ${user.nombre || 'Usuario'}! 👋
            </p>
            <p class="text-lg opacity-90 mb-2">
              Enviaremos las últimas ofertas y novedades tecnológicas a:
            </p>
            <p class="text-xl font-bold bg-white/20 rounded-lg py-3 px-4 inline-block">
              📧 ${user.correo}
            </p>
          </div>
          
          <div class="flex flex-wrap justify-center gap-4 mt-6">
            <div class="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
              ✨ Ofertas exclusivas
            </div>
            <div class="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
              🚀 Novedades tecnológicas
            </div>
            <div class="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
              🎁 Promociones especiales
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    // USUARIO NO LOGUEADO: Mostrar formulario de suscripción
    const btn = document.getElementById("newsletter-btn");
    const emailInput = document.getElementById("newsletter-email");
    
    if (!btn || !emailInput) return;
    
    btn.addEventListener("click", () => {
      const email = emailInput.value.trim();
      
      // Validar email
      if (!email || email.length < 5 || !email.includes("@")) {
        // Mostrar error visual
        emailInput.classList.add('ring-2', 'ring-red-500');
        setTimeout(() => {
          emailInput.classList.remove('ring-2', 'ring-red-500');
        }, 2000);
        return;
      }
      
      // Si escribió un correo válido, guardarlo temporalmente
      localStorage.setItem("preRegisterEmail", email);
      
      // Redirigir al formulario de registro
      window.location.href = "./register.html";
    });
    
    // Limpiar error al escribir
    emailInput.addEventListener('input', () => {
      emailInput.classList.remove('ring-2', 'ring-red-500');
    });
  }
})();

// REDIRECCIÓN POR CATEGORÍAS
document.addEventListener('DOMContentLoaded', () => {
  // Si hay recuadros de categorías (index.html)
  const categoryCards = document.querySelectorAll('[data-category]');
  if (categoryCards.length > 0) {
    categoryCards.forEach(card => {
      card.addEventListener('click', () => {
        const category = card.getAttribute('data-category');
        // Redirige a productos.html con el filtro aplicado
        window.location.href = `./productos.html?category=${category}`;
      });
    });
  }
  
  // Si estamos en productos.html, leer la categoría de la URL
  const params = new URLSearchParams(window.location.search);
  const urlCategory = params.get('category');
  const categorySelect = document.getElementById('category-filter');
  
  if (urlCategory && categorySelect) {
    // Validar categorías existentes
    const validCategories = ['laptops', 'celulares', 'componentes', 'accesorios'];
    if (validCategories.includes(urlCategory)) {
      // Aplicar filtro automático
      state.category = urlCategory;
      categorySelect.value = urlCategory;
      if (grid) render();
    }
  }
});
// cambios