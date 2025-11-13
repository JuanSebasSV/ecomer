// Función de cargar productos
async function cargarProductos() {
    try {
        const response = await fetch("http://localhost:8081/api/productos");
        const productos = await response.json();

        const grid = document.getElementById('productos-grid');
        grid.innerHTML = productos.map(producto => `
            <div class="p-4 bg-white rounded shadow hover:shadow-lg transition">
                <h2 class="text-lg font-semibold text-gray-800">${producto.nombre}</h2>
                <p class="text-gray-600">$${producto.precio}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error al cargar los productos:", error);
    }
}


const PRODUCTS = [
  // --- Laptops (10) ---
  {
    id: 'macbook-pro-m3',
    title: 'MacBook Pro M3',
    category: 'laptops',
    price: 2499000,
    image: '../images/m3.png',
    desc: 'Potencia profesional para creativos y desarrolladores',
    rating: 5,
    reviews: 128,
    newestRank: 2,
    badge: 'Top'
  },
  {
    id: 'asus-rog-2025',
    title: 'ASUS ROG Strix 2025',
    category: 'laptops',
    price: 1899000,
    image: '../images/strix.png',
    desc: 'Rendimiento gaming con refrigeración avanzada',
    rating: 4.5,
    reviews: 64,
    newestRank: 5,
    badge: 'Oferta'
  },
  {
    id: 'dell-xps-15',
    title: 'Dell XPS 15',
    category: 'laptops',
    price: 2199000,
    image: '../images/xps.png',
    desc: 'Diseño compacto y pantalla 4K para creadores',
    rating: 4.7,
    reviews: 102,
    newestRank: 3
  },
  {
    id: 'hp-omen-16',
    title: 'HP Omen 16',
    category: 'laptops',
    price: 1599000,
    image: '../images/omen.png',
    desc: 'Balance entre potencia y precio para gamers',
    rating: 4.3,
    reviews: 48,
    newestRank: 6
  },
  {
    id: 'lenovo-legion-7',
    title: 'Lenovo Legion 7',
    category: 'laptops',
    price: 1999000,
    image: '..//images/legion.png',
    desc: 'Alto rendimiento con GPU dedicada',
    rating: 4.6,
    reviews: 77,
    newestRank: 4,
    badge: 'Nuevo'
  },
  {
    id: 'acer-swift-5',
    title: 'Acer Swift 5',
    category: 'laptops',
    price: 1299000,
    image: '../images/swift.png',
    desc: 'Ultraportátil y buena autonomía',
    rating: 4.1,
    reviews: 39,
    newestRank: 8
  },
  {
    id: 'rog-flow-x13',
    title: 'ROG Flow X13',
    category: 'laptops',
    price: 1799000,
    image: '../images/flow.png',
    desc: 'Compacta convertible con GPU externa opcional',
    rating: 4.4,
    reviews: 21,
    newestRank: 7
  },
  {
    id: 'microsoft-surface-pro',
    title: 'Surface Laptop Studio',
    category: 'laptops',
    price: 2299000,
    image: '../images/studio.png',
    desc: 'Convertible para creativos y productividad',
    rating: 4.5,
    reviews: 58,
    newestRank: 9
  },
  {
    id: 'gigabyte-aero-15',
    title: 'Gigabyte Aero 15',
    category: 'laptops',
    price: 2099000,
    image: '../images/aero.png',
    desc: 'Pantalla con alta fidelidad de color',
    rating: 4.2,
    reviews: 33,
    newestRank: 10
  },
  {
    id: 'xiaomi-redmibook',
    title: 'Xiaomi RedmiBook Pro',
    category: 'laptops',
    price: 1099000,
    image: '../images/redmibook.png',
    desc: 'Buena relación precio-rendimiento para estudiantes',
    rating: 4.0,
    reviews: 86,
    newestRank: 11
  },

  // --- Celulares (10) ---
  {
    id: 'iphone-15-pro',
    title: 'iPhone 15 Pro',
    category: 'celulares',
    price: 1199000,
    image: '../images/15pro.png',
    desc: 'El smartphone más avanzado con chip A17 Pro',
    rating: 5,
    reviews: 89,
    newestRank: 1,
    badge: 'Top'
  },
  {
    id: 'samsung-galaxy-s24',
    title: 'Samsung Galaxy S24',
    category: 'celulares',
    price: 999000,
    image: '../images/s24.png',
    desc: 'Cámaras mejoradas y pantalla brillante',
    rating: 4.6,
    reviews: 210,
    newestRank: 2
  },
  {
    id: 'google-pixel-8',
    title: 'Google Pixel 8',
    category: 'celulares',
    price: 849000,
    image: '../images/pixel8.png',
    desc: 'Fotografía computacional y Android puro',
    rating: 4.4,
    reviews: 71,
    newestRank: 3,
    badge: 'Nuevo'
  },
  {
    id: 'oneplus-12',
    title: 'OnePlus 12',
    category: 'celulares',
    price: 799000,
    image: '../images/oneplus12.png',
    desc: 'Fluidez y carga rápida de primera',
    rating: 4.3,
    reviews: 52,
    newestRank: 6
  },
  {
    id: 'xiaomi-13-pro',
    title: 'Xiaomi 13 Pro',
    category: 'celulares',
    price: 699000,
    image: '../images/xiaomi13.png',
    desc: 'Gran cámara y batería duradera',
    rating: 4.2,
    reviews: 43,
    newestRank: 8
  },
  {
    id: 'motorola-edge',
    title: 'Motorola Edge 40',
    category: 'celulares',
    price: 459000,
    image: '../images/edge40.png',
    desc: 'Pantalla curva y buena autonomía',
    rating: 4.0,
    reviews: 27,
    newestRank: 9
  },
  {
    id: 'sony-xperia-1',
    title: 'Sony Xperia 1 IV',
    category: 'celulares',
    price: 899000,
    image: '../images/xperia.png',
    desc: 'Enfoque en multimedia y audio de alta calidad',
    rating: 4.1,
    reviews: 31,
    newestRank: 7
  },
  {
    id: 'oppo-find-x6',
    title: 'OPPO Find X6',
    category: 'celulares',
    price: 749000,
    image: '../images/findx6.png',
    desc: 'Carga ultrarrápida y cámara versátil',
    rating: 4.2,
    reviews: 22,
    newestRank: 11
  },
  {
    id: 'poco-f5',
    title: 'POCO F5',
    category: 'celulares',
    price: 399000,
    image: '../images/f5.jpg',
    desc: 'Rendimiento sólido a precio asequible',
    rating: 3.9,
    reviews: 19,
    newestRank: 12,
    badge: 'Oferta'
  },
  {
    id: 'asus-zenfone-10',
    title: 'ASUS Zenfone 10',
    category: 'celulares',
    price: 529000,
    image: '../images/zenfone.png',
    desc: 'Compacto y potente para uso diario',
    rating: 4.0,
    reviews: 12,
    newestRank: 13
  },

  // --- Componentes PC (10) ---
  {
    id: 'rtx-4070-super',
    title: 'RTX 4070 Super',
    category: 'componentes',
    price: 599000,
    image: '../images/4070super.png',
    desc: 'Tarjeta gráfica de nueva generación para gaming',
    rating: 5,
    reviews: 156,
    newestRank: 3
  },
  {
    id: 'ryzen-9-7950x',
    title: 'AMD Ryzen 9 7950X',
    category: 'componentes',
    price: 2890000,
    image: '../images/7950x.png',
    desc: 'CPU de alto rendimiento para estaciones de trabajo',
    rating: 5,
    reviews: 44,
    newestRank: 1,
    badge: 'Top'
  },
  {
    id: 'intel-i9-13900k',
    title: 'Intel Core i9-13900K',
    category: 'componentes',
    price: 2599000,
    image: '../images/13900k.png',
    desc: 'Máximo rendimiento single-thread y multi-thread',
    rating: 4.9,
    reviews: 61,
    newestRank: 2
  },
  {
    id: 'msi-b650-motherboard',
    title: 'MSI B650 Motherboard',
    category: 'componentes',
    price: 749000,
    image: '../images/b650.png',
    desc: 'Placa base con características modernas y PCIe 5.0',
    rating: 4.2,
    reviews: 18,
    newestRank: 6
  },
  {
    id: 'corsair-32gb-ddr5',
    title: 'Corsair Vengeance 32GB DDR5',
    category: 'componentes',
    price: 499000,
    image: '../images/vengeance.png',
    desc: 'Memoria DDR5 para rendimiento extremo',
    rating: 4.6,
    reviews: 29,
    newestRank: 7
  },
  {
    id: 'samsung-980-pro-2tb',
    title: 'Samsung 980 PRO 2TB',
    category: 'componentes',
    price: 850000,
    image: '../images/980pro.png',
    desc: 'SSD NVMe de alta velocidad para cargas pesadas',
    rating: 4.8,
    reviews: 98,
    newestRank: 4,
    badge: 'Oferta'
  },
  {
    id: 'cooler-master-240',
    title: 'Cooler Master Liquid 240',
    category: 'componentes',
    price: 269000,
    image: '../images/masterliquid.png',
    desc: 'Refrigeración líquida AIO para CPUs potentes',
    rating: 4.3,
    reviews: 14,
    newestRank: 8
  },
  {
    id: 'seagate-4tb-hdd',
    title: 'Seagate BarraCuda 4TB',
    category: 'componentes',
    price: 299000,
    image: '../images/barracuda.png',
    desc: 'Almacenamiento masivo para archivos y backups',
    rating: 4.0,
    reviews: 52,
    newestRank: 9
  },
  {
    id: 'asus-tuf-rtx-4060',
    title: 'ASUS TUF RTX 4060',
    category: 'componentes',
    price: 399000,
    image: '../images/4060.png',
    desc: 'Tarjeta gráfica para gaming 1080p con eficiencia',
    rating: 4.1,
    reviews: 27,
    newestRank: 10
  },
  {
    id: 'evga-psu-850w',
    title: 'EVGA SuperNOVA 850W',
    category: 'componentes',
    price: 279000,
    image: '../images/850w.png',
    desc: 'Fuente de poder modular, certificación 80+ Gold',
    rating: 4.4,
    reviews: 23,
    newestRank: 11
  },

  // --- Accesorios (10) ---
  {
    id: 'silla-gaming',
    title: 'Silla Gaming Pro',
    category: 'accesorios',
    price: 890000,
    image: '../images/sillapro.png',
    desc: 'Ergonómica, LED RGB',
    rating: 5,
    reviews: 45,
    newestRank: 5
  },
  {
    id: 'audifonos-usb',
    title: 'Audífonos USB Pro',
    category: 'accesorios',
    price: 45000,
    image: '../images/audifonos-usb.png',
    desc: 'Sonido claro y micrófono integrado',
    rating: 4.0,
    reviews: 37,
    newestRank: 12
  },
  {
    id: 'logitech-mx-master-3',
    title: 'Logitech MX Master 3',
    category: 'accesorios',
    price: 289000,
    image: '../images/logitech.png',
    desc: 'Mouse ergonómico para productividad',
    rating: 4.7,
    reviews: 154,
    newestRank: 2,
    badge: 'Top'
  },
  {
    id: 'anker-powerbank-20000',
    title: 'Anker PowerBank 20,000mAh',
    category: 'accesorios',
    price: 129000,
    image: '../images/powerbank.png',
    desc: 'Carga rápida y capacidad para viajes',
    rating: 4.5,
    reviews: 88,
    newestRank: 4
  },
  {
    id: 'anker-cable-usbc',
    title: 'Cable USB-C 100W',
    category: 'accesorios',
    price: 29900,
    image: '../images/100w.png',
    desc: 'Carga y datos a alta velocidad',
    rating: 4.3,
    reviews: 26,
    newestRank: 6
  },
  {
    id: 'elgato-cam-link',
    title: 'Elgato Cam Link 4K',
    category: 'accesorios',
    price: 319000,
    image: '../images/elgato.png',
    desc: 'Captura profesional para streaming',
    rating: 4.6,
    reviews: 40,
    newestRank: 7,
    badge: 'Nuevo'
  },
  {
    id: 'steelseries-arctis',
    title: 'SteelSeries Arctis 7',
    category: 'accesorios',
    price: 349000,
    image: '../images/arctis.png',
    desc: 'Auriculares inalámbricos para gaming',
    rating: 4.4,
    reviews: 65,
    newestRank: 8
  },
  {
    id: 'razer-tank-mousepad',
    title: 'Razer Goliathus Mousepad',
    category: 'accesorios',
    price: 59000,
    image: '../images/mousepad.png',
    desc: 'Base para mouse con gran control',
    rating: 4.1,
    reviews: 18,
    newestRank: 9
  },
  {
    id: 'wd-my-passport-2tb',
    title: 'WD My Passport 2TB',
    category: 'accesorios',
    price: 239000,
    image: '../images/passport.png',
    desc: 'Disco externo portátil y seguro',
    rating: 4.2,
    reviews: 27,
    newestRank: 10
  },
  {
    id: 'usb-hub-7-port',
    title: 'Hub USB 7 puertos',
    category: 'accesorios',
    price: 69000,
    image: '../images/multihub.png',
    desc: 'Expande tus puertos USB rápidamente',
    rating: 3.9,
    reviews: 9,
    newestRank: 11
  }
];