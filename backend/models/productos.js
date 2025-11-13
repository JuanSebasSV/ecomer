import mongoose from "mongoose";

const productoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  desc: { type: String, required: true },
  rating: { type: Number, required: true },
  reviews: { type: Number, required: true },
  newestRank: { type: Number, required: true },
  badge: { type: String, default: null }
});

const Producto = mongoose.model("Producto", productoSchema);
export default Producto;