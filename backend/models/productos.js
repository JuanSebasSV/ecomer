import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  imagen: { type: String, required: true }
});

// Forzar que se guarde en la colección "productos"
const Producto = mongoose.model("productos", productSchema, "productos");

export default Producto;
