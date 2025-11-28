import bcrypt from "bcrypt";
import User from "../models/user.models.js";

export const loginusuario = async (req, res) => {
  try {
    const { correo, password } = req.body;

    // Validar si los campos se llenaron
    if (!correo || !password) {
      return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
    }

    // Buscar usuario en la base de datos
    const usuario = await User.findOne({ correo });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Comparar la contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Si llega aquí, el login fue exitoso
    res.status(200).json({
      message: "Inicio de sesión exitoso",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo
      }
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      message: "Error al iniciar sesión",
      error: error.message
    });
  }
};
