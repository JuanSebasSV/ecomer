// backend/models/user.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  // cambiar a String para permitir formatos +57, paréntesis, espacios
  telefono: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() }
});

// Guardar en la colección "User"
const user = mongoose.model("user", userSchema, "user");

export default user;
