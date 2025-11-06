import express from "express";
import Producto from "../models/productos.js"; // ✅ extensión .js añadida

const router = express.Router();

// Crear un producto
router.post("/", async (req, res) => {
  try {
    const { productId, nombre, descripcion, precio, imagen } = req.body;

    // Validación de campos obligatorios
    if (!productId || !nombre || !descripcion || !precio || !imagen) {
      return res.status(400).json({
        message: "❎ Faltan datos obligatorios del producto",
      });
    }

    const newProduct = new Producto({
      productId,
      nombre,
      descripcion,
      precio,
      imagen,
    });

    await newProduct.save();

    res.status(201).json({
      message: "✅ Producto creado con éxito",
      data: newProduct,
    });
  } catch (error) {
    console.error("❎ Error al crear producto:", error);
    res.status(500).json({
      message: "❎ Error al crear producto",
      error: error.message,
    });
  }
});

export default router;
