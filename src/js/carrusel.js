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