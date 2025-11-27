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

// --- Newsletter → Redirigir a registro con email guardado ---
(function setupNewsletterRedirect() {
  const btn = document.getElementById("newsletter-btn");
  const emailInput = document.getElementById("newsletter-email");

  if (!btn || !emailInput) return;

  btn.addEventListener("click", () => {
    const email = emailInput.value.trim();

    // Si escribió un correo, guardarlo temporalmente
    if (email.length > 5 && email.includes("@")) {
      localStorage.setItem("preRegisterEmail", email);
    }

    // Redirigir al formulario de registro
    window.location.href = "./register.html";
  });
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

