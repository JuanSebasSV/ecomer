import mongoose from "mongoose";

const productoSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  imagen: { type: String, required: true },
});

const Producto = mongoose.model("Producto", productoSchema);
export default Producto;
