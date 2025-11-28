import Producto from "../models/productos.models.js";

// Crear producto individual
export const crearProductos = async (req, res) => {
  try {
    const { id, title, category, price, image, desc, rating, reviews, newestRank, badge } = req.body;

    if (!id || !title || !category || price === undefined || !image || !desc) {
      return res.status(400).json({ message: "❎ Faltan datos obligatorios del producto (id, title, category, price, image, desc)" });
    }
    if (typeof price !== "number") return res.status(400).json({ message: "❎ El campo 'price' debe ser numérico" });

    const existe = await Producto.findOne({ id });
    if (existe) return res.status(400).json({ message: "⚠️ El producto con ese id ya existe" });

    const nuevoProducto = new Producto({ id, title, category, price, image, desc, rating, reviews, newestRank, badge });
    await nuevoProducto.save();

    return res.status(201).json({ message: "✅ Producto creado con éxito", data: nuevoProducto });
  } catch (error) {
    console.error("❎ Error al crear producto:", error);
    return res.status(500).json({ message: "❎ Error al crear producto", error: error.message });
  }
};

// Listar productos
export const listarProductos = async (req, res) => {
  try {
    const productos = await Producto.find();
    return res.status(200).json(productos);
  } catch (error) {
    console.error("❎ Error al obtener productos:", error);
    return res.status(500).json({ message: "❎ Error al obtener los productos", error: error.message });
  }
};

// Insert masivo (bulk) — acepta badge en los objetos
export const crearProductosBulk = async (req, res) => {
  try {
    const items = req.body; // <-- asegurarse que items viene de req.body

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Envía un array de productos" });
    }

    // Validación mínima por item (badge opcional)
    const invalidIndex = items.findIndex(p => !p || !p.id || !p.title || !p.category || p.price === undefined || !p.image || !p.desc);
    if (invalidIndex !== -1) {
      return res.status(400).json({ message: `Item inválido en el índice ${invalidIndex}: requiere id, title, category, price, image, desc` });
    }

    // Verificar que price sea number en todos
    const nonNumeric = items.findIndex(p => typeof p.price !== "number");
    if (nonNumeric !== -1) {
      return res.status(400).json({ message: `El campo price debe ser numérico en el índice ${nonNumeric}` });
    }

    // insertMany con ordered:false para que continúe ante duplicados
    const result = await Producto.insertMany(items, { ordered: false });

    return res.status(201).json({
      message: "✅ Insert masivo completado",
      requested: items.length,
      insertedCount: result.length,
      insertedIds: result.map(r => r._id)
    });
  } catch (error) {
    console.error("Error insertMany:", error);

    // Manejo para writeErrors (duplicados u otros)
    if (error && Array.isArray(error.writeErrors) && error.writeErrors.length > 0) {
      const writeErrors = error.writeErrors.map(e => ({ index: e.index, errmsg: e.errmsg, code: e.code }));
      const inserted = (error.result && error.result.nInserted) || (error.insertedDocs ? error.insertedDocs.length : 0);
      return res.status(207).json({
        message: "Insert masivo parcial: algunos documentos fallaron",
        requested: Array.isArray(req.body) ? req.body.length : 0,
        insertedCount: inserted,
        writeErrors
      });
    }

    return res.status(500).json({ message: "Error al insertar productos", error: error.message });
  }
};
