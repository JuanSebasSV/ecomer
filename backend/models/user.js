import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Guardar en la colección "user"
const Usuario = mongoose.model("user", userSchema, "user");

export default Usuario;
