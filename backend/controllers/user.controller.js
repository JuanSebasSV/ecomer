import Usuario from "../models/user.js";
import bcrypt from "bcrypt";

// Registrar usuario
export const registrarUsuario = async (req, res) => {
  try {
    const { userId, nombre, correo, password } = req.body;

    if (!userId || !nombre || !correo || !password) {
      return res.status(400).json({ message: "❎ Faltan datos obligatorios del usuario" });
    }

    // Verificar si ya existe por correo o userId
    const usuarioExistente = await Usuario.findOne({ $or: [{ correo }, { userId }] });
    if (usuarioExistente) {
      return res.status(400).json({ message: "⚠️ El usuario ya existe con ese correo o ID" });
    }

    // Hashear contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear y guardar
    const nuevoUsuario = new Usuario({
      userId,
      nombre,
      correo,
      password: hashedPassword,
    });

    await nuevoUsuario.save();

    // No devolver password
    const { password: _, ...usuarioSafe } = nuevoUsuario._doc;

    return res.status(201).json({ message: "✅ Usuario creado con éxito", data: usuarioSafe });
  } catch (error) {
    console.error("❎ Error al crear usuario:", error);
    return res.status(500).json({ message: "❎ Error al crear usuario", error: error.message });
  }
};

// Listar usuarios (sin password)
export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("-password");
    return res.status(200).json(usuarios);
  } catch (error) {
    console.error("❎ Error al obtener usuarios:", error);
    return res.status(500).json({ message: "❎ Error al obtener los usuarios", error: error.message });
  }
};
