import Producto from "../models/productos.js"; // ✅ Modelo con mayúscula

// Crear producto
export const crearProductos = async (req, res) => { // ✅ Nombre camelCase claro
  try {
    const { productId, nombre, descripcion, precio, imagen } = req.body;

    // Validar campos requeridos
    if (!productId || !nombre || !descripcion || !precio || !imagen) {
      return res.status(400).json({
        message: "❎ Faltan datos obligatorios del producto"
      });
    }

    // Validar tipo de precio
    if (typeof precio !== "number") {
      return res.status(400).json({
        message: "❎ El campo 'precio' debe ser numérico"
      });
    }

    // Verificar si ya existe el producto
    const existe = await Producto.findOne({ productId });
    if (existe) {
      return res.status(400).json({
        message: "⚠️ El producto con ese productId ya existe"
      });
    }

    // Crear nuevo producto
    const nuevoProducto = new Producto({
      productId,
      nombre,
      descripcion,
      precio,
      imagen,
    });

    await nuevoProducto.save();

    return res.status(201).json({
      message: "✅ Producto creado con éxito",
      data: nuevoProducto
    });
  } catch (error) {
    console.error("❎ Error al crear producto:", error);
    return res.status(500).json({
      message: "❎ Error al crear producto",
      error: error.message
    });
  }
};

// Listar productos
export const listarProductos = async (req, res) => { // ✅ Nombre consistente
  try {
    const productos = await Producto.find();
    return res.status(200).json(productos);
  } catch (error) {
    console.error("❎ Error al obtener productos:", error);
    return res.status(500).json({
      message: "❎ Error al obtener los productos",
      error: error.message
    });
  }
};