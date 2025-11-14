import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  telefono: { type: Number, required: true },
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Guardar en la colección "user"
const User = mongoose.model("User", userSchema, "User");

export default User;