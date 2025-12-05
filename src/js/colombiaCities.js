// BASE DE DATOS COMPLETA DE DEPARTAMENTOS Y MUNICIPIOS DE COLOMBIA
// Este archivo debe estar en: src/js/colombiaCities.js

const COLOMBIA_DATA = {
  "Amazonas": ["Leticia", "Puerto Nariño"],
  "Antioquia": ["Medellín", "Bello", "Itagüí", "Envigado", "Apartadó", "Turbo", "Rionegro", "Caucasia", "Sabaneta", "La Ceja", "Caldas", "Carepa", "El Carmen de Viboral", "Puerto Berrío", "Yarumal", "Marinilla", "Chigorodó", "Necoclí", "Guarne", "San Pedro de Urabá", "La Estrella", "Andes", "Segovia", "Santa Rosa de Osos", "La Unión", "Retiro", "Carmen de Viboral", "Amagá", "Sonsón", "Fredonia", "Puerto Triunfo", "Copacabana", "Girardota", "Barbosa"],
  "Arauca": ["Arauca", "Tame", "Saravena", "Arauquita", "Fortul", "Puerto Rondón", "Cravo Norte"],
  "Atlántico": ["Barranquilla", "Soledad", "Malambo", "Sabanalarga", "Baranoa", "Puerto Colombia", "Galapa", "Palmar de Varela", "Juan de Acosta", "Polonuevo", "Ponedera", "Sabanagrande", "Santo Tomás", "Campo de la Cruz", "Candelaria", "Luruaco", "Manatí", "Repelón", "Santa Lucía", "Suan", "Tubará", "Usiacurí"],
  "Bogotá D.C.": ["Bogotá D.C."],
  "Bolívar": ["Cartagena", "Magangué", "Turbaco", "El Carmen de Bolívar", "Arjona", "Mompós", "San Pablo", "Santa Rosa del Sur", "Simití", "Morales", "Cantagallo", "San Jacinto", "María La Baja", "Achí", "Pinillos", "San Juan Nepomuceno", "Montecristo", "Córdoba", "San Martín de Loba", "Turbana", "Mahates", "Santa Catalina"],
  "Boyacá": ["Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Paipa", "Villa de Leyva", "Puerto Boyacá", "Moniquirá", "Nobsa", "Samacá", "Tibasosa", "Garagoa", "Ventaquemada", "Ramiriquí", "Socha", "Aquitania", "Güicán", "Tota", "Sáchica", "Ráquira", "Sutamarchán", "Mongua", "Tenza", "Soatá"],
  "Caldas": ["Manizales", "Villamaría", "La Dorada", "Chinchiná", "Riosucio", "Aguadas", "Anserma", "Palestina", "Supía", "Salamina", "Aranzazu", "Pácora", "Neira", "Marquetalia", "Manzanares", "Pensilvania", "Viterbo", "Filadelfia"],
  "Caquetá": ["Florencia", "San Vicente del Caguán", "Puerto Rico", "El Doncello", "El Paujil", "La Montañita", "Belén de los Andaquíes", "Cartagena del Chairá", "Albania", "Curillo", "Morelia", "Milán", "San José del Fragua", "Solano", "Solita", "Valparaíso"],
  "Casanare": ["Yopal", "Aguazul", "Villanueva", "Monterrey", "Tauramena", "Paz de Ariporo", "Maní", "Trinidad", "Hato Corozal", "Pore", "Sabanalarga", "Sácama", "San Luis de Palenque", "Támara", "Nunchía", "Orocué", "Recetor", "Chámeza", "La Salina"],
  "Cauca": ["Popayán", "Santander de Quilichao", "Puerto Tejada", "Patía", "Corinto", "Miranda", "Guapi", "Piendamó", "Villa Rica", "Caloto", "Cajibío", "Timbío", "Silvia", "Buenos Aires", "Morales", "Suárez", "Mercaderes", "Bolívar", "Timbiquí", "Almaguer", "Páez", "Toribío", "Jambaló", "Caldono", "Inzá"],
  "Cesar": ["Valledupar", "Aguachica", "Bosconia", "Codazzi", "La Paz", "San Diego", "Agustín Codazzi", "Chiriguaná", "Curumaní", "El Copey", "Astrea", "Becerril", "La Gloria", "Pailitas", "Pelaya", "Río de Oro", "San Alberto", "San Martín", "Tamalameque", "Gamarra"],
  "Chocó": ["Quibdó", "Istmina", "Condoto", "Tadó", "Acandí", "Riosucio", "Bahía Solano", "Nuquí", "El Carmen de Atrato", "Bojayá", "Lloró", "Sipí", "Medio Atrato", "Alto Baudó", "Bajo Baudó", "Medio Baudó", "Litoral del San Juan", "Bagadó", "Cértegui", "Río Quito", "Unguía", "Carmen del Darién", "Belén de Bajirá"],
  "Córdoba": ["Montería", "Cereté", "Lorica", "Sahagún", "Planeta Rica", "Tierralta", "Montelíbano", "Ciénaga de Oro", "Ayapel", "Chinú", "San Andrés de Sotavento", "San Pelayo", "Pueblo Nuevo", "San Carlos", "Purísima", "Momil", "San Antero", "Cotorra", "Moñitos", "Los Córdobas", "San Bernardo del Viento", "Puerto Escondido", "Canalete", "Tuchín", "Valencia"],
  "Cundinamarca": ["Soacha", "Fusagasugá", "Facatativá", "Chía", "Zipaquirá", "Girardot", "Cajicá", "Madrid", "Funza", "Mosquera", "La Mesa", "Sopó", "Tocancipá", "Ubaté", "Villeta", "Tabio", "Tenjo", "Cota", "Gachancipá", "La Calera", "Subachoque", "El Colegio", "Anapoima", "Sibaté", "Arbeláez", "Pacho", "San Antonio del Tequendama", "Guaduas", "Cogua", "Nemocón", "Chocontá"],
  "Guainía": ["Inírida", "Barranco Minas", "Mapiripana", "San Felipe", "Puerto Colombia", "La Guadalupe", "Cacahual", "Pana Pana", "Morichal"],
  "Guaviare": ["San José del Guaviare", "El Retorno", "Calamar", "Miraflores"],
  "Huila": ["Neiva", "Pitalito", "Garzón", "La Plata", "Campoalegre", "Rivera", "Algeciras", "Gigante", "San Agustín", "Hobo", "Aipe", "Palermo", "Isnos", "Acevedo", "Timaná", "Saladoblanco", "Paicol", "Tello", "Baraya", "Teruel", "Tarqui", "Suaza", "Tesalia", "La Argentina", "Yaguará"],
  "La Guajira": ["Riohacha", "Maicao", "Uribia", "Manaure", "San Juan del Cesar", "Villanueva", "Fonseca", "Barrancas", "Distracción", "Dibulla", "Albania", "Hatonuevo", "El Molino", "Urumita", "La Jagua del Pilar"],
  "Magdalena": ["Santa Marta", "Ciénaga", "Fundación", "Zona Bananera", "Plato", "El Banco", "Aracataca", "Pivijay", "Sabanas de San Ángel", "San Zenón", "Santa Ana", "Sitionuevo", "Algarrobo", "El Retén", "Puebloviejo", "Remolino", "Salamina", "Chivolo", "Pedraza", "Pijiño del Carmen", "Tenerife", "Zapayán", "Concordia", "Nueva Granada"],
  "Meta": ["Villavicencio", "Acacías", "Granada", "Puerto López", "San Martín", "Cumaral", "Restrepo", "Puerto Gaitán", "Guamal", "Barranca de Upía", "Cabuyaro", "Castilla la Nueva", "El Calvario", "El Castillo", "El Dorado", "Fuente de Oro", "La Macarena", "Lejanías", "Mapiripán", "Mesetas", "La Uribe", "Puerto Concordia", "Puerto Lleras", "Puerto Rico", "San Carlos de Guaroa", "San Juan de Arama", "San Juanito", "Uribe", "Vistahermosa"],
  "Nariño": ["Pasto", "Tumaco", "Ipiales", "Túquerres", "Barbacoas", "La Unión", "Samaniego", "Sandona", "La Cruz", "Ricaurte", "Cumbal", "El Charco", "Guaitarilla", "Ancuyá", "Magüí Payán", "Mosquera", "Francisco Pizarro", "Santa Bárbara", "Policarpa", "Leiva", "Los Andes", "La Florida", "El Peñol", "Consacá", "Pupiales"],
  "Norte de Santander": ["Cúcuta", "Ocaña", "Villa del Rosario", "Los Patios", "Pamplona", "Tibú", "El Zulia", "Sardinata", "San Cayetano", "Puerto Santander", "Chinácota", "Teorama", "Villa Caro", "Ábrego", "La Esperanza", "Convención", "El Tarra", "Hacarí", "Toledo", "Gramalote", "Salazar", "Durania", "Bucarasica", "Bochalema"],
  "Putumayo": ["Mocoa", "Puerto Asís", "Orito", "Valle del Guamuez", "Puerto Guzmán", "Villagarzón", "San Miguel", "Puerto Caicedo", "Colón", "Santiago", "Sibundoy", "San Francisco", "Puerto Leguízamo"],
  "Quindío": ["Armenia", "Calarcá", "La Tebaida", "Montenegro", "Quimbaya", "Circasia", "Filandia", "Salento", "Génova", "Pijao", "Buenavista", "Córdoba"],
  "Risaralda": ["Pereira", "Dosquebradas", "Santa Rosa de Cabal", "La Virginia", "Belén de Umbría", "Marsella", "Quinchía", "Mistratό", "Pueblo Rico", "Apía", "Santuario", "Balboa", "Guática", "La Celia"],
  "San Andrés y Providencia": ["San Andrés", "Providencia"],
  "Santander": ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja", "San Gil", "Socorro", "Barbosa", "Málaga", "Zapatoca", "Vélez", "Cimitarra", "Sabana de Torres", "Lebrija", "Puerto Wilches", "Rionegro", "Charalá", "El Carmen de Chucurí", "Simacota", "Landázuri", "San Vicente de Chucurí", "Puente Nacional", "Suaita", "Oiba", "Guapotá"],
  "Sucre": ["Sincelejo", "Corozal", "San Marcos", "Sampués", "Tolú", "Majagual", "Ovejas", "Sincé", "San Onofre", "San Juan de Betulia", "Morroa", "Los Palmitos", "Galeras", "San Pedro", "San Benito Abad", "San Luis de Sincé", "Buenavista", "Caimito", "Chalán", "Coloso", "Coveñas", "El Roble", "Guaranda", "La Unión", "Palmito", "Santiago de Tolú"],
  "Tolima": ["Ibagué", "Espinal", "Melgar", "Honda", "Líbano", "Chaparral", "Mariquita", "Purificación", "Guamo", "Flandes", "Fresno", "Armero", "Venadillo", "Cajamarca", "San Luis", "Rovira", "Planadas", "Saldaña", "Natagaima", "Ataco", "Rioblanco", "Ortega", "Coello", "Carmen de Apicalá", "Suárez", "Valle de San Juan", "Ambalema", "Alvarado"],
  "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Tuluá", "Cartago", "Buga", "Jamundí", "Yumbo", "Candelaria", "Florida", "Pradera", "Sevilla", "Roldanillo", "Zarzal", "La Unión", "Bugalagrande", "El Cerrito", "Dagua", "Caicedonia", "Andalucía", "Toro", "Bolívar", "Versalles", "Vijes", "Ginebra", "La Victoria", "Obando", "Trujillo", "Ansermanuevo", "Alcalá", "Argelia", "El Águila", "El Cairo", "El Dovio", "Restrepo", "La Cumbre", "San Pedro", "Ulloa", "Yotoco"],
  "Vaupés": ["Mitú", "Caruru", "Taraira", "Papunahua", "Yavaraté"],
  "Vichada": ["Puerto Carreño", "La Primavera", "Santa Rosalía", "Cumaribo"]
};

// Exportar para usar en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = COLOMBIA_DATA;
}

// También disponible globalmente en el navegador
if (typeof window !== 'undefined') {
  window.COLOMBIA_DATA = COLOMBIA_DATA;
}